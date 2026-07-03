import { motion } from "framer-motion";
import {
  TrendingUp,
  BarChart3,
  Clock,
  Target,
  Eye,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

interface AnalyticsResponse {
  stats: {
    totalAnalyses: number;
    avgScore: number;
    totalViews: number;
    predictionAccuracy: number;
    improvement: number;
  };
  scoreTrend: Array<{ date: string; score: number }>;
  heatmap: {
    cells: Array<{ dow: number; hour: number; score: number }>;
  };
}

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatViews(views: number) {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return String(views);
}

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery<AnalyticsResponse>({
    queryKey: ["/api/analytics?platform=tiktok"],
  });

  const stats = data?.stats;
  const scoreTrend = data?.scoreTrend ?? [];
  const heatmapCells = data?.heatmap?.cells ?? [];

  const heatmapData = dayLabels.map((day, dow) => ({
    day,
    hours: Array.from({ length: 24 }, (_, hour) => {
      const cell = heatmapCells.find((c) => c.dow === dow && c.hour === hour);
      return cell?.score ?? 2;
    }),
  }));

  const getHeatColor = (value: number) => {
    if (value >= 9) return "bg-emerald-500";
    if (value >= 7) return "bg-emerald-600/80";
    if (value >= 5) return "bg-orange-500/60";
    if (value >= 3) return "bg-slate-600";
    return "bg-slate-700";
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics</h1>
            <p className="text-slate-400">Performance from your analyses and posts</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "Content Analyzed",
              value: String(stats?.totalAnalyses ?? 0),
              change: stats?.improvement ? `+${stats.improvement}` : "—",
              icon: BarChart3,
              color: "orange",
            },
            {
              label: "Avg Viral Score",
              value: String(stats?.avgScore ?? 0),
              change: stats?.improvement ? `${stats.improvement >= 0 ? "+" : ""}${stats.improvement}` : "—",
              icon: Target,
              color: "emerald",
            },
            {
              label: "Prediction Accuracy",
              value: `${stats?.predictionAccuracy ?? 0}%`,
              change: "live",
              icon: TrendingUp,
              color: "purple",
            },
            {
              label: "Total Views",
              value: formatViews(stats?.totalViews ?? 0),
              change: "tracked",
              icon: Eye,
              color: "pink",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-orange-400" />
                </div>
                <span className="text-slate-400 text-sm">{stat.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{stat.value}</span>
                <span className="text-emerald-400 text-sm">{stat.change}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              Score Trend
            </h3>
            <div className="h-48 flex items-end justify-between gap-2">
              {(scoreTrend.length > 0 ? scoreTrend : [{ date: "", score: 0 }]).map((point, i) => (
                <div key={`${point.date}-${i}`} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t-lg ${point.score >= 80 ? "bg-emerald-500" : point.score >= 60 ? "bg-orange-500" : "bg-amber-500"}`}
                    style={{ height: `${Math.max(point.score, 5)}%` }}
                  />
                  <span className="text-xs text-slate-500">{i + 1}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-400" />
              Your Optimal Posting Times
            </h3>
            <div className="space-y-2">
              <div className="flex gap-1 text-xs text-slate-500 mb-2">
                <div className="w-10" />
                {Array.from({ length: 24 }, (_, i) => (
                  <div key={i} className="flex-1 text-center">
                    {i % 4 === 0 ? `${i}` : ""}
                  </div>
                ))}
              </div>
              {heatmapData.map((row) => (
                <div key={row.day} className="flex gap-1 items-center">
                  <div className="w-10 text-xs text-slate-500">{row.day}</div>
                  {row.hours.map((value, hour) => (
                    <div
                      key={hour}
                      className={`flex-1 h-4 rounded-sm ${getHeatColor(value)}`}
                      title={`${row.day} ${hour}:00 — score ${value}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
