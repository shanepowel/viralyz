import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useQueries, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Sparkles, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { scoreTone } from "@/components/ui/score-ring";
import { useEffectiveTimezone } from "@/hooks/use-effective-timezone";
import { dowHourInTz } from "@/lib/tz";
import { cn } from "@/lib/utils";

interface ScheduledItem {
  id: string;
  title: string | null;
  scheduledFor: string | null;
  postedAt: string | null;
  targetPlatform: string | null;
  viralScore: number | null;
  status: string | null;
}

interface SlotCell { multiplier: number; score: number; personal: boolean; baseline: number; confidence: string }
interface HeatmapResponse { platform: string; grid: SlotCell[][] }

const HEATMAP_PLATFORMS = ["tiktok", "instagram", "youtube", "twitter", "linkedin", "threads"];

function multiplierTone(m: number): string {
  if (m >= 1.4) return "bg-emerald-500/20 text-emerald-200 border-emerald-400/30";
  if (m >= 1.1) return "bg-orange-500/15 text-orange-200 border-orange-400/30";
  if (m >= 0.9) return "bg-slate-500/10 text-slate-300 border-slate-400/20";
  return "bg-rose-500/10 text-rose-200 border-rose-400/20";
}

function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999); }
function startOfGrid(d: Date) {
  const s = startOfMonth(d);
  const day = s.getDay();
  return new Date(s.getFullYear(), s.getMonth(), 1 - day);
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const fromIso = useMemo(() => startOfGrid(cursor).toISOString(), [cursor]);
  const toIso = useMemo(() => {
    const e = endOfMonth(cursor);
    return new Date(e.getFullYear(), e.getMonth(), e.getDate() + 7).toISOString();
  }, [cursor]);

  const tz = useEffectiveTimezone();
  const heatmapQueries = useQueries({
    queries: HEATMAP_PLATFORMS.map((p) => ({
      queryKey: ["/api/insights/heatmap", p, tz],
      queryFn: async (): Promise<HeatmapResponse | null> => {
        const r = await fetch(`/api/insights/heatmap?platform=${p}&tz=${encodeURIComponent(tz)}`);
        if (!r.ok) return null;
        return r.json();
      },
      staleTime: 10 * 60 * 1000,
    })),
  });

  const heatmapData = heatmapQueries.map((q) => q.data ?? null);
  const heatmapDataKey = heatmapData.map((d) => (d ? "1" : "0")).join("");
  const heatmapByPlatform = useMemo(() => {
    const m = new Map<string, HeatmapResponse>();
    HEATMAP_PLATFORMS.forEach((p, i) => {
      const d = heatmapData[i];
      if (d) m.set(p, d);
    });
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heatmapDataKey]);

  const platformAlias = (p?: string | null): string => {
    if (!p) return "tiktok";
    const lower = p.toLowerCase();
    if (lower === "x") return "twitter";
    if (lower === "ig" || lower === "reels") return "instagram";
    if (lower === "shorts") return "youtube";
    return lower;
  };

  const multiplierFor = (it: ScheduledItem): number | undefined => {
    if (!it.scheduledFor) return undefined;
    const hm = heatmapByPlatform.get(platformAlias(it.targetPlatform));
    if (!hm) return undefined;
    const { dow, hour } = dowHourInTz(new Date(it.scheduledFor), tz);
    return hm.grid[dow]?.[hour]?.multiplier;
  };

  const { data: items, isLoading } = useQuery<ScheduledItem[]>({
    queryKey: ["/api/calendar", fromIso, toIso],
    queryFn: async () => {
      const res = await fetch(`/api/calendar?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const grid = useMemo(() => {
    const start = startOfGrid(cursor);
    const cells: Date[] = [];
    for (let i = 0; i < 42; i++) {
      cells.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    }
    return cells;
  }, [cursor]);

  const itemsByDay = useMemo(() => {
    const map = new Map<string, ScheduledItem[]>();
    (items || []).forEach((it) => {
      const d = it.scheduledFor ? new Date(it.scheduledFor) : null;
      if (!d) return;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    });
    return map;
  }, [items]);

  const today = new Date();
  const inMonth = (d: Date) => d.getMonth() === cursor.getMonth();
  const isToday = (d: Date) =>
    d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();

  const monthLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  const upcoming = (items || [])
    .filter((it) => it.scheduledFor && new Date(it.scheduledFor) >= today)
    .sort((a, b) => new Date(a.scheduledFor!).getTime() - new Date(b.scheduledFor!).getTime())
    .slice(0, 6);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Plan"
          title="Content Calendar"
          description="Schedule your analyses, plan your week, and never miss a post."
          actions={
            <Link href="/analyze">
              <Button className="bg-orange-600 hover:bg-orange-500">
                <Plus className="h-4 w-4 mr-1.5" /> Schedule a post
              </Button>
            </Link>
          }
        />

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="card-base p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h3" data-testid="text-month-label">{monthLabel}</h2>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                  data-testid="button-prev-month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCursor(startOfMonth(new Date()))}
                  data-testid="button-today"
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                  data-testid="button-next-month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {DAY_LABELS.map((d) => (
                <div key={d} className="text-eyebrow text-center py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {grid.map((d, i) => {
                const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                const dayItems = itemsByDay.get(key) || [];
                return (
                  <div
                    key={i}
                    className={cn(
                      "min-h-[88px] rounded-lg border p-1.5 transition-colors",
                      inMonth(d)
                        ? "border-white/[0.06] bg-white/[0.02]"
                        : "border-white/[0.03] bg-white/[0.01] opacity-40",
                      isToday(d) && "ring-1 ring-orange-400/60"
                    )}
                    data-testid={`cell-${key}`}
                  >
                    <div className="text-[11px] font-semibold text-slate-300 mb-1 px-1">{d.getDate()}</div>
                    <div className="space-y-1">
                      {dayItems.slice(0, 2).map((it) => {
                        const tone = scoreTone(it.viralScore);
                        const mult = multiplierFor(it);
                        return (
                          <Link key={it.id} href={`/analyze/${it.id}`}>
                            <div
                              className={cn(
                                "rounded px-1.5 py-1 text-[10px] font-medium truncate cursor-pointer hover:opacity-80 flex items-center gap-1",
                                `score-bg-${tone}`
                              )}
                              data-testid={`event-${it.id}`}
                            >
                              <span className="truncate flex-1">{it.title || "Untitled"}</span>
                              {mult !== undefined && (
                                <span
                                  className={cn(
                                    "shrink-0 rounded-sm px-1 text-[9px] font-semibold border tabular-nums",
                                    multiplierTone(mult)
                                  )}
                                  title={`Predicted ${mult.toFixed(2)}× avg engagement at this time`}
                                  data-testid={`mult-${it.id}`}
                                >
                                  {mult.toFixed(1)}×
                                </span>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                      {dayItems.length > 2 && (
                        <div className="text-[10px] text-slate-400 px-1.5">+{dayItems.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="space-y-4"
          >
            <div className="card-base p-5">
              <h3 className="text-h3 mb-4">Upcoming</h3>
              {isLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
                </div>
              ) : upcoming.length === 0 ? (
                <EmptyState
                  icon={CalendarIcon}
                  title="Nothing scheduled"
                  description="Schedule a draft from the analyze view."
                />
              ) : (
                <div className="space-y-2">
                  {upcoming.map((it) => {
                    const d = new Date(it.scheduledFor!);
                    const tone = scoreTone(it.viralScore);
                    const mult = multiplierFor(it);
                    return (
                      <Link key={it.id} href={`/analyze/${it.id}`}>
                        <div className="card-base card-hover p-3 cursor-pointer flex items-center gap-3" data-testid={`upcoming-${it.id}`}>
                          <div className="text-center shrink-0 w-12">
                            <div className="text-eyebrow leading-none">{d.toLocaleString(undefined, { month: "short" })}</div>
                            <div className="text-h3 leading-none mt-1">{d.getDate()}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{it.title || "Untitled"}</div>
                            <div className="text-meta capitalize flex items-center gap-1.5">
                              <span>{it.targetPlatform} · {d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>
                              {mult !== undefined && (
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold border tabular-nums",
                                    multiplierTone(mult)
                                  )}
                                  data-testid={`upcoming-mult-${it.id}`}
                                >
                                  <TrendingUp className="h-2.5 w-2.5" /> {mult.toFixed(2)}×
                                </span>
                              )}
                            </div>
                          </div>
                          {typeof it.viralScore === "number" && (
                            <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums", `score-bg-${tone}`)}>
                              {it.viralScore}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card-base p-5">
              <h3 className="text-h3 mb-2">Pro tip</h3>
              <p className="text-sm text-slate-400">
                Score your draft, fix the top 3 issues, then schedule it for your platform's peak hour.
              </p>
              <Link href="/analyze">
                <Button variant="outline" size="sm" className="mt-3 border-white/10 hover:bg-white/[0.04]">
                  <Sparkles className="h-4 w-4 mr-1.5" /> Score a new draft
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
