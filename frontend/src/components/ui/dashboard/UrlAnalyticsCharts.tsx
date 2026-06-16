import type { Analytics } from "@/types/index";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface UrlAnalyticsChartsProps {
  analytics: Analytics;
}

const COLORS = [
  "#6366f1", // Indigo
  "#06b6d4", // Cyan
  "#8b5cf6", // Violet
  "#10b981", // Emerald
  "#f43f5e", // Rose
  "#eab308", // Yellow
];

const browserStatsToChartData = (browserStats: Record<string, number>) =>
  Object.entries(browserStats).map(([browser, count]) => ({ browser, count }));

const parseBrowser = (userAgent: string | null): string => {
  if (!userAgent) return "Other";
  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/") || ua.includes("edge/")) return "Edge";
  if (ua.includes("opr/") || ua.includes("opera")) return "Opera";
  if (ua.includes("firefox/")) return "Firefox";
  if (ua.includes("chrome/") && !ua.includes("edg/")) return "Chrome";
  if (ua.includes("safari/") && !ua.includes("chrome/")) return "Safari";
  return "Other";
};

export function UrlAnalyticsCharts({ analytics }: UrlAnalyticsChartsProps) {
  const browserChartData = browserStatsToChartData(analytics.browserStats);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Redirect Trends</CardTitle>
          <CardDescription>
            Visual tracker of link redirects over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart
              data={analytics.clicksPerDay}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.4)"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                fontSize={11}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 16, 22, 0.85)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#clicksGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Browser Distribution</CardTitle>
            <CardDescription>
              Redirect breakdown by user-agent browser.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {browserChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={browserChartData}
                    cx="50%"
                    cy="40%"
                    labelLine={false}
                    label={false}
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {browserChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 16, 22, 0.85)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", bottom: 0 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm text-center py-12">
                Gathering browser statistics...
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>
              Top origins where visitors click your link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.topReferrers.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={analytics.topReferrers.slice(0, 5)}
                  layout="vertical"
                  margin={{ left: 10, right: 10, top: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                  />
                  <XAxis
                    type="number"
                    stroke="rgba(255,255,255,0.4)"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="source"
                    type="category"
                    stroke="rgba(255,255,255,0.6)"
                    fontSize={11}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 16, 22, 0.85)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm text-center py-12">
                No referrers detected yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      {analytics.recentVisits && analytics.recentVisits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Visits Log</CardTitle>
            <CardDescription>
              Live timeline of the last 10 visits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {analytics.recentVisits.slice(0, 10).map((visit, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3.5 bg-black/20 hover:bg-black/30 border border-white/4 rounded-xl transition-all"
                >
                  <div>
                    <p className="text-sm text-white font-bold">
                      {parseBrowser(visit.userAgent)}
                    </p>
                    <p className="text-xs text-indigo-400/80 font-medium mt-0.5">
                      Origin: {visit.referrer || "Direct / QR Code"}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {new Date(visit.clickedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
