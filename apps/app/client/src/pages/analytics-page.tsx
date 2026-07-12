import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, BarChart3, Clock, Target, Zap, Eye, Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { scoreTone } from "@/components/ui/score-ring";

interface AnalyticsDashboard {
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
    top: Array<{ dow: number; hour: number; score: number }>;
  };
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PLATFORMS = ["tiktok", "instagram", "youtube", "twitter", "linkedin"] as const;

function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return String(views);
}

function getHeatColor(value: number) {
  if (value >= 80) return "bg-emerald-500";
  if (value >= 60) return "bg-emerald-600/80";
  if (value >= 40) return "bg-indigo-500/60";
  if (value >= 20) return "bg-slate-600";
  return "bg-slate-700";
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [platform, setPlatform] = useState(
    user?.primaryPlatform || "tiktok",
  );

  const { data, isLoading, isError } = useQuery<AnalyticsDashboard>({
    queryKey: ["/api/analytics", platform],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?platform=${platform}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load analytics");
      return res.json();
    },
  });

  const stats = data?.stats;
  const scoreTrend = data?.scoreTrend ?? [];
  const heatmapCells = data?.heatmap.cells ?? [];
  const topSlot = data?.heatmap.top?.[0];

  const heatmapGrid = Array.from({ length: 7 }, (_, dow) =>
    Array.from({ length: 24 }, (_, hour) => {
      const cell = heatmapCells.find((c) => c.dow === dow && c.hour === hour);
      return cell?.score ?? 0;
    }),
  );

  const statCards = stats
    ? [
        {
          label: "Content Analyzed",
          value: String(stats.totalAnalyses),
          change:
            stats.improvement > 0
              ? `+${stats.improvement} pts`
              : stats.improvement < 0
                ? `${stats.improvement} pts`
                : "—",
          icon: BarChart3,
          color: "indigo",
        },
        {
          label: "Avg Viral Score",
          value: String(stats.avgScore),
          change: stats.improvement > 0 ? `+${stats.improvement}` : "—",
          icon: Target,
          color: "emerald",
        },
        {
          label: "Prediction Accuracy",
          value: `${stats.predictionAccuracy}%`,
          change: "—",
          icon: TrendingUp,
          color: "purple",
        },
        {
          label: "Total Views",
          value: formatViews(stats.totalViews),
          change: "—",
          icon: Eye,
          color: "pink",
        },
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics</h1>
            <p className="text-slate-400">Performance from your real analyses</p>
          </div>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-white"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </motion.div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          </div>
        )}

        {isError && (
          <div className="card-base p-8 text-center text-slate-400">
            Could not load analytics. Try again later.
          </div>
        )}

        {!isLoading && !isError && stats?.totalAnalyses === 0 && (
          <div className="card-base p-10 text-center">
            <BarChart3 className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No analyses yet</h2>
            <p className="text-slate-400 mb-6">
              Run your first viral score analysis to unlock trends, timing heatmaps,
              and prediction tracking.
            </p>
            <Link href="/analyze">
              <Button className="bg-indigo-600 hover:bg-indigo-500">
                Analyze your first video
              </Button>
            </Link>
          </div>
        )}

        {!isLoading && !isError && stats && stats.totalAnalyses > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {statCards.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-indigo-400" />
                    </div>
                    <span className="text-slate-400 text-sm">{stat.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{stat.value}</span>
                    {stat.change !== "—" && (
                      <span className="text-emerald-400 text-sm">{stat.change}</span>
                    )}
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
                  <TrendingUp className="h-5 w-5 text-indigo-400" />
                  Score Trend
                </h3>
                {scoreTrend.length === 0 ? (
                  <p className="text-slate-500 text-sm">Not enough data yet.</p>
                ) : (
                  <div className="h-48 flex items-end justify-between gap-1">
                    {scoreTrend.map((point, i) => (
                      <div key={`${point.date}-${i}`} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                        <div
                          className={`w-full rounded-t-lg ${
                            point.score >= 80
                              ? "bg-emerald-500"
                              : point.score >= 60
                                ? "bg-indigo-500"
                                : "bg-amber-500"
                          }`}
                          style={{ height: `${Math.max(8, point.score)}%` }}
                          title={`${point.date}: ${point.score}`}
                        />
                        <span className="text-[10px] text-slate-500 truncate w-full text-center">
                          {point.date.slice(5)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-400" />
                  Optimal Posting Times
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
                  {heatmapGrid.map((hours, dow) => (
                    <div key={dow} className="flex gap-1 items-center">
                      <div className="w-10 text-xs text-slate-500">
                        {DAY_LABELS[dow]}
                      </div>
                      {hours.map((value, hour) => (
                        <div
                          key={hour}
                          className={`flex-1 h-5 rounded-sm ${getHeatColor(value)}`}
                          title={`${DAY_LABELS[dow]} ${hour}:00 — score ${value}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                {topSlot && (
                  <div className="mt-4 text-sm text-slate-400">
                    Best slot:{" "}
                    <span className="text-emerald-400 font-medium">
                      {DAY_LABELS[topSlot.dow]} {topSlot.hour}:00
                    </span>
                  </div>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                Score distribution
              </h3>
              <p className="text-slate-400 text-sm">
                Your average viral score is{" "}
                <span className={`font-semibold score-bg-${scoreTone(stats.avgScore)} px-2 py-0.5 rounded`}>
                  {stats.avgScore}
                </span>
                {stats.improvement > 0 && (
                  <>
                    {" "}
                    — up{" "}
                    <span className="text-emerald-400 font-medium">
                      {stats.improvement} points
                    </span>{" "}
                    from earlier analyses.
                  </>
                )}
                . Keep iterating with Hook Lab and Caption Studio to push higher.
              </p>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
