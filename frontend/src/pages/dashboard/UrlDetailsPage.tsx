import { useState } from "react";
import { useParams } from "react-router-dom";
import { Copy, ExternalLink, Download, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getShortUrl } from "@/lib/config";
import { urlService } from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { UrlAnalyticsCharts } from "@/components/ui/dashboard/UrlAnalyticsCharts";
import { QrCodeDisplay } from "@/components/ui/dashboard/QrCodeDisplay";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/use-toast";

export function UrlDetailsPage() {
  const { id } = useParams();
  const { addToast } = useToast();

  const { data: urlData, isLoading: urlLoading } = useQuery({
    queryKey: ["url", id],
    queryFn: () =>
      urlService.getUrlDetails(id!).then((res) => res.data.data.url),
    enabled: !!id,
  });

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["analytics", id, startDate, endDate],
    queryFn: () =>
      urlService
        .getAnalytics(id!, startDate || undefined, endDate || undefined)
        .then((res) => res.data.data),
    enabled: !!id,
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast("Copied to clipboard!", "success");
    } catch {
      addToast("Failed to copy", "error");
    }
  };

  const handleExport = async () => {
    try {
      const response = await urlService.exportCsv(id!);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", `analytics-${id}.csv`);

      document.body.appendChild(link);

      link.click();
      link.parentNode?.removeChild(link);

      addToast("CSV exported successfully", "success");
    } catch {
      addToast("Failed to export CSV", "error");
    }
  };

  if (urlLoading)
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );

  if (!urlData)
    return (
      <div className="bg-surface-card border border-red-700 rounded-lg p-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 mt-1" />
        <div>
          <h3 className="font-semibold text-white">URL not found</h3>
          <p className="text-gray-400 text-sm mt-1">
            The URL you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );

  const isExpired =
    urlData.expiresAt && new Date(urlData.expiresAt) < new Date();
  const shortUrl = getShortUrl(urlData.shortCode);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">URL Details</h1>
        <p className="text-gray-400 mt-1">
          Analytics and information for your shortened URL
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Short URL</CardTitle>
              <CardDescription>Your shortened link</CardDescription>
            </div>
            {isExpired && (
              <span className="px-3 py-1 bg-red-900/20 border border-red-700 rounded text-red-300 text-xs font-medium">
                Expired
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase">
                Short Code
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm break-all">
                  {urlData.shortCode}
                </code>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => copyToClipboard(urlData.shortCode)}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase">
                Full Short URL
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white font-mono text-sm break-all">
                  {shortUrl}
                </code>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => copyToClipboard(shortUrl)}
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase">
              Original URL
            </label>
            <div className="flex items-center gap-2">
              <p className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-300 text-sm break-all">
                {urlData.originalUrl}
              </p>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => window.open(urlData.originalUrl, "_blank")}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div>
              <p className="text-gray-400 text-xs uppercase">Clicks</p>
              <p className="text-2xl font-bold text-white mt-1">
                {urlData.clicks}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase">Visitors</p>
              <p className="text-2xl font-bold text-white mt-1">
                {analyticsData?.uniqueVisitors ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase">Created</p>
              <p className="text-sm text-white mt-1">
                {new Date(urlData.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase">Expires</p>
              <p className="text-sm text-white mt-1">
                {urlData.expiresAt
                  ? new Date(urlData.expiresAt).toLocaleDateString()
                  : "Never"}
              </p>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>
      <QrCodeDisplay urlId={id!} />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        <h2 className="text-xl font-bold text-white">Analytics</h2>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-white text-sm"
          />
        </div>
      </div>
      {analyticsLoading ? (
        <CardSkeleton />
      ) : analyticsData ? (
        <UrlAnalyticsCharts analytics={analyticsData} />
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-400">No analytics data available yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
