import { useQuery } from "@tanstack/react-query";
import {
  Link as LinkIcon,
  BarChart3,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { urlService } from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { getShortUrl } from "@/lib/config";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
}

const StatCard = ({ icon: Icon, label, value, subtext }: StatCardProps) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className="p-3 bg-blue-900/20 rounded-lg">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export function DashboardOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["urlStats"],
    queryFn: async () => {
      const listRes = await urlService.getUserUrls(1, 100);
      const { urls, total } = listRes.data.data;

      const totalClicks = urls.reduce((sum, url) => sum + (url.clicks || 0), 0);
      const topUrl =
        urls.length > 0
          ? urls.reduce((top, url) =>
              url.clicks > (top.clicks || 0) ? url : top,
            )
          : null;

      return { totalUrls: total, totalClicks, topUrl };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Welcome back! Here's your URL shortener overview
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              icon={LinkIcon}
              label="Total URLs"
              value={stats?.totalUrls ?? 0}
              subtext="All time"
            />
            <StatCard
              icon={BarChart3}
              label="Total Clicks"
              value={(stats?.totalClicks ?? 0).toLocaleString()}
              subtext="From your latest URLs"
            />
            <StatCard
              icon={TrendingUp}
              label="Most Popular"
              value={stats?.topUrl?.clicks || 0}
              subtext={stats?.topUrl?.shortCode || "N/A"}
            />
          </>
        )}
      </div>
      {stats?.topUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Most Popular URL</CardTitle>
            <CardDescription>
              Your top performing shortened link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase">
                Short URL
              </label>
              <p className="text-white font-mono break-all">
                {getShortUrl(stats.topUrl.shortCode)}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase">
                Original URL
              </label>
              <p className="text-gray-300 break-all">
                {stats.topUrl.originalUrl}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-gray-400 text-sm">Total Clicks</p>
                <p className="text-2xl font-bold text-white">
                  {stats.topUrl.clicks}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
