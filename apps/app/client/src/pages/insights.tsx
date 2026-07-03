import { Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, Sparkles, TrendingUp, Info } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { useEffectiveTimezone } from "@/hooks/use-effective-timezone";
import { cn } from "@/lib/utils";

interface SlotCell {
  score: number;
  multiplier: number;
  confidence: "low" | "medium" | "high";
  personal: boolean;
  baseline: number;
}

interface HeatmapResponse {
  platform: string;
  niche: string;
  grid: SlotCell[][];
  top: { dow: number; hour: number; multiplier: number; score: number }[];
  source: { baselineRows: number; userPostsConsidered: number };
}

const PLATFORMS = ["tiktok", "instagram", "youtube", "twitter", "linkedin", "threads"] as const;
const PLATFORM_LABEL: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  threads: "Threads",
};
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function heatColor(mult: number): string {
  if (mult >= 1.6) return "bg-emerald-500/90";
  if (mult >= 1.3) return "bg-emerald-500/60";
  if (mult >= 1.1) return "bg-orange-500/60";
  if (mult >= 0.9) return "bg-orange-500/25";
  if (mult >= 0.7) return "bg-slate-700/60";
  return "bg-slate-800/60";
}

function fmtHour(h: number): string {
  const ampm = h >= 12 ? "p" : "a";
  const hh = h % 12 || 12;
  return `${hh}${ampm}`;
}

function nextOccurrence(dow: number, hour: number): Date {
  const now = new Date();
  const cur = now.getDay();
  let delta = (dow - cur + 7) % 7;
  const candidate = new Date(now);
  candidate.setDate(now.getDate() + delta);
  candidate.setHours(hour, 0, 0, 0);
  if (candidate.getTime() <= now.getTime()) candidate.setDate(candidate.getDate() + 7);
  return candidate;
}

export default function InsightsPage() {
  const [platform, setPlatform] = useState<string>("tiktok");
  const tz = useEffectiveTimezone();

  const { data, isLoading } = useQuery<HeatmapResponse>({
    queryKey: ["/api/insights/heatmap", platform, tz],
    queryFn: async () => {
      const res = await fetch(`/api/insights/heatmap?platform=${platform}&tz=${encodeURIComponent(tz)}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Plan"
          title="Best time to post"
          description="A 7×24 heatmap of when your audience is most likely to convert. Combines an editorial baseline with your own posting actuals."
        />

        <div className="flex flex-wrap gap-2 mb-5">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                platform === p
                  ? "bg-orange-500/20 border-orange-400/40 text-orange-100"
                  : "border-white/10 text-slate-400 hover:text-white hover:border-white/20"
              )}
              data-testid={`tab-platform-${p}`}
            >
              {PLATFORM_LABEL[p]}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="card-base p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-h3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-300" /> Heatmap · {PLATFORM_LABEL[platform]}
              </h3>
              <span className="text-meta">Times shown in {tz}</span>
            </div>

            {isLoading || !data ? (
              <div className="skeleton h-80 rounded-lg" />
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                  <div className="grid" style={{ gridTemplateColumns: "32px repeat(24, minmax(0, 1fr))" }}>
                    <div />
                    {Array.from({ length: 24 }).map((_, h) => (
                      <div key={h} className="text-[10px] text-slate-500 text-center pb-1">
                        {h % 3 === 0 ? fmtHour(h) : ""}
                      </div>
                    ))}
                    {DAYS.map((dayLabel, dow) => (
                      <Fragment key={`row-${dow}`}>
                        <div key={`l-${dow}`} className="text-[11px] text-slate-400 pr-1 flex items-center">{dayLabel}</div>
                        {data.grid[dow].map((cell, hour) => {
                          const isTop = data.top.some((t) => t.dow === dow && t.hour === hour);
                          return (
                            <div
                              key={`c-${dow}-${hour}`}
                              title={`${dayLabel} ${fmtHour(hour)} · ${cell.multiplier.toFixed(2)}× avg${cell.personal ? " · personalized" : ""}`}
                              className={cn(
                                "h-7 m-[1px] rounded-sm relative flex items-center justify-center text-[9px] font-semibold tabular-nums text-white/90",
                                heatColor(cell.multiplier),
                                cell.personal && "ring-1 ring-amber-300/60",
                                isTop && "ring-2 ring-emerald-300"
                              )}
                              data-testid={`cell-${dow}-${hour}`}
                            >
                              {cell.multiplier.toFixed(1)}
                            </div>
                          );
                        })}
                      </Fragment>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 mt-4 text-meta">
                    <span>Quieter</span>
                    <div className="flex gap-0.5">
                      {[0.6, 0.8, 1.0, 1.2, 1.4, 1.6].map((v) => (
                        <div key={v} className={cn("h-3 w-6 rounded-sm", heatColor(v))} />
                      ))}
                    </div>
                    <span>Peak</span>
                    <span className="ml-4 inline-flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-sm bg-orange-500/40 ring-1 ring-amber-300/60" /> Personalized from your posts
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="space-y-4"
          >
            <div className="card-base p-5">
              <h3 className="text-h3 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-300" /> Top 3 slots this week
              </h3>
              {isLoading || !data ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => <div key={i} className="skeleton h-14 rounded-lg" />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {data.top.map((t, i) => {
                    const next = nextOccurrence(t.dow, t.hour);
                    return (
                      <div
                        key={`${t.dow}-${t.hour}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02]"
                        data-testid={`top-slot-${i}`}
                      >
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/15 text-emerald-300 flex items-center justify-center text-sm font-bold">
                          #{i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {DAYS[t.dow]} · {fmtHour(t.hour)}
                          </div>
                          <div className="text-meta">
                            {next.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {t.multiplier.toFixed(2)}× avg
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card-base p-5">
              <h3 className="text-h3 mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-orange-300" /> How this works
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                We start from a curated baseline by platform & niche, then blend in your own posted actuals (views &amp; likes per dow/hour) as you log them. The more posts you publish &amp; track, the more personal the heatmap becomes.
              </p>
              {data && (
                <div className="mt-3 text-meta flex items-center gap-2">
                  <Info className="h-3.5 w-3.5" />
                  {data.source.userPostsConsidered === 0
                    ? "Showing editorial baseline — log post actuals to personalize."
                    : `Personalized from ${data.source.userPostsConsidered} of your posted analyses.`}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
