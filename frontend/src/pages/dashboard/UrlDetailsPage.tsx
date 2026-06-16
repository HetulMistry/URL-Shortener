import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Copy,
  ExternalLink,
  Download,
  AlertCircle,
  ArrowLeft,
  Calendar,
  MousePointerClick,
  Users,
} from "lucide-react";
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
      <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
        <div>
          <h3 className="font-bold text-white">URL Link Not Found</h3>
          <p className="text-gray-400 text-sm mt-1">
            The link details you are trying to view could not be loaded.
          </p>
          <Link
            to="/dashboard/urls"
            className="text-indigo-400 text-xs font-semibold hover:underline mt-3 inline-block"
          >
            Return to Link Hub
          </Link>
        </div>
      </div>
    );

  const isExpired =
    urlData.expiresAt && new Date(urlData.expiresAt) < new Date();
  const shortUrl = getShortUrl(urlData.shortCode);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link
          to="/dashboard/urls"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to URLs
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white font-space-grotesk tracking-tight">
              Link Analytics
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Detailed tracking metrics and redirect configurations.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">Redirection Settings</CardTitle>
              <CardDescription>
                Target mapping and expiration details.
              </CardDescription>
            </div>
            {isExpired ? (
              <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/25 rounded-full text-red-400 text-[10px] font-bold uppercase tracking-wider">
                Expired
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                Active
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-0.5">
                Alias Code
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black/25 border border-white/6 rounded-lg px-4 py-2.5 text-white font-mono text-sm break-all">
                  {urlData.shortCode}
                </code>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => copyToClipboard(urlData.shortCode)}
                  className="px-3 py-2.5 h-auto"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-0.5">
                Full Short URL
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black/25 border border-white/6 rounded-lg px-4 py-2.5 text-white font-mono text-sm break-all">
                  {shortUrl}
                </code>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => copyToClipboard(shortUrl)}
                  className="px-3 py-2.5 h-auto"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider pl-0.5">
              Original Destination URL
            </label>
            <div className="flex items-center gap-2">
              <p className="flex-1 bg-black/25 border border-white/6 rounded-lg px-4 py-2.5 text-gray-300 text-sm break-all">
                {urlData.originalUrl}
              </p>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => window.open(urlData.originalUrl, "_blank")}
                className="px-3 py-2.5 h-auto"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/5">
            <div className="p-4 rounded-xl bg-white/2 border border-white/4">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Total Clicks
              </span>
              <div className="flex items-center gap-2 mt-2">
                <MousePointerClick className="w-4 h-4 text-indigo-400" />
                <span className="text-xl font-extrabold text-white font-space-grotesk">
                  {urlData.clicks}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/2 border border-white/4">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Unique Visitors
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-xl font-extrabold text-white font-space-grotesk">
                  {analyticsData?.uniqueVisitors ?? "-"}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/2 border border-white/4">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Created On
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-bold text-white mt-0.5">
                  {new Date(urlData.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/2 border border-white/4">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Expiration Date
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-bold text-white mt-0.5">
                  {urlData.expiresAt
                    ? new Date(urlData.expiresAt).toLocaleDateString()
                    : "Never"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold text-white font-space-grotesk">
              Interactive Analytics
            </h2>
            <div className="flex items-center gap-2 bg-black/20 border border-white/6 rounded-xl p-1.5 w-full sm:w-auto">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-xs px-2 py-1 cursor-pointer"
              />
              <span className="text-gray-500 text-xs font-semibold">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-xs px-2 py-1 cursor-pointer"
              />
            </div>
          </div>
          {analyticsLoading ? (
            <CardSkeleton />
          ) : analyticsData ? (
            <UrlAnalyticsCharts analytics={analyticsData} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-400 text-sm">
                  No analytics tracking data found in selected range.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="lg:col-span-1">
          <QrCodeDisplay urlId={id!} />
        </div>
      </div>
    </div>
  );
}
