import { useQuery } from "@tanstack/react-query";
import {
  Link as LinkIcon,
  BarChart3,
  TrendingUp,
  type LucideIcon,
  ArrowRight,
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
import { Link } from "react-router-dom";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  glowColor: string;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  glowColor,
}: StatCardProps) => (
  <Card className="relative overflow-hidden group">
    <div
      className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 bg-${glowColor}`}
    />
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            {label}
          </p>
          <p className="text-3xl font-extrabold text-white mt-3 font-space-grotesk tracking-tight">
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-gray-500 mt-2 font-medium">{subtext}</p>
          )}
        </div>
        <div
          className={`p-3 rounded-xl bg-white/4 border border-white/6 group-hover:border-indigo-500/25 group-hover:bg-indigo-500/5 transition-colors duration-300`}
        >
          <Icon className="w-5 h-5 text-indigo-400" />
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white font-space-grotesk tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-gray-400 text-sm mt-1.5">
          Real-time metrics and shortcut controls for your shortened links.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              label="Total Links"
              value={stats?.totalUrls ?? 0}
              subtext="Created links in your account"
              glowColor="indigo-500"
            />
            <StatCard
              icon={BarChart3}
              label="Total Clicks"
              value={(stats?.totalClicks ?? 0).toLocaleString()}
              subtext="Accumulated redirects"
              glowColor="cyan-500"
            />
            <StatCard
              icon={TrendingUp}
              label="Top Click Peak"
              value={stats?.topUrl?.clicks || 0}
              subtext={`Code: ${stats?.topUrl?.shortCode || "N/A"}`}
              glowColor="violet-500"
            />
          </>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {stats?.topUrl ? (
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Most Popular Link</CardTitle>
                    <CardDescription>
                      Your highest performing link based on user clicks.
                    </CardDescription>
                  </div>
                  <div className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
                    Top Performer
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-black/25 border border-white/4">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Short Link
                    </span>
                    <p className="text-white font-mono font-medium text-sm mt-1.5 break-all select-all flex items-center justify-between">
                      <span>{getShortUrl(stats.topUrl.shortCode)}</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-black/25 border border-white/4">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Destination Link
                    </span>
                    <p className="text-gray-300 text-sm mt-1.5 break-all line-clamp-2">
                      {stats.topUrl.originalUrl}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/4">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        Total Hits
                      </p>
                      <p className="text-2xl font-black text-white mt-1 font-space-grotesk">
                        {stats.topUrl.clicks}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        Created
                      </p>
                      <p className="text-sm text-white font-bold mt-2">
                        {new Date(stats.topUrl.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/dashboard/urls/${stats.topUrl.id}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/15 transition-all"
                  >
                    View Analytics
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex flex-col items-center justify-center p-12 text-center">
              <CardContent className="space-y-4">
                <div className="p-4 rounded-full bg-white/2 border border-white/6 inline-block">
                  <LinkIcon className="w-8 h-8 text-gray-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    No link statistics
                  </h3>
                  <p className="text-gray-400 text-sm max-w-sm">
                    Generate shortened URLs to start gathering traffic stats and
                    click analytics.
                  </p>
                </div>
                <Link
                  to="/dashboard/urls"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg transition-all"
                >
                  Create link
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription>
                Shortcuts to manage your account details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                to="/dashboard/urls"
                className="w-full flex items-center justify-between p-4 rounded-xl bg-white/2 hover:bg-white/4 border border-white/5 hover:border-white/10 text-left transition-all group/action"
              >
                <div>
                  <p className="text-sm font-semibold text-white group-hover/action:text-indigo-400 transition-colors">
                    URL Hub
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Shorten, search and edit links.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover/action:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/dashboard/settings"
                className="w-full flex items-center justify-between p-4 rounded-xl bg-white/2 hover:bg-white/4 border border-white/5 hover:border-white/10 text-left transition-all group/action"
              >
                <div>
                  <p className="text-sm font-semibold text-white group-hover/action:text-indigo-400 transition-colors">
                    API Docs
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Integrate via developer keys.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover/action:translate-x-1 transition-transform" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
