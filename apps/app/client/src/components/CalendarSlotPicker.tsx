import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffectiveTimezone } from "@/hooks/use-effective-timezone";
import { dowHourInTz } from "@/lib/tz";
import { cn } from "@/lib/utils";

interface CalendarItem {
  id: string;
  title: string | null;
  scheduledFor: string | null;
  targetPlatform: string | null;
}

interface SlotCell { score: number; multiplier: number; confidence: string; personal: boolean; baseline: number }
interface HeatmapResponse {
  platform: string;
  grid: SlotCell[][];
  top: { dow: number; hour: number; multiplier: number; score: number }[];
}

const FALLBACK_PEAK_HOURS: Record<string, number[]> = {
  tiktok: [12, 19, 21],
  reels: [11, 14, 19],
  shorts: [12, 15, 20],
  instagram: [11, 14, 19],
  twitter: [9, 12, 17],
  x: [9, 12, 17],
  threads: [9, 14, 20],
  linkedin: [8, 12, 17],
  youtube: [15, 18, 20],
};

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate() - day);
  out.setHours(0, 0, 0, 0);
  return out;
}

function toLocalIso(d: Date): string {
  const tz = d.getTimezoneOffset();
  return new Date(d.getTime() - tz * 60000).toISOString().slice(0, 16);
}

interface Props {
  platform: string;
  value: string;
  onChange: (isoLocal: string) => void;
}

export function CalendarSlotPicker({ platform, value, onChange }: Props) {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const tz = useEffectiveTimezone();

  const { data: heatmap } = useQuery<HeatmapResponse>({
    queryKey: ["/api/insights/heatmap", platform, tz],
    queryFn: async () => {
      const res = await fetch(`/api/insights/heatmap?platform=${encodeURIComponent(platform)}&tz=${encodeURIComponent(tz)}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Pick top 3 peak hours for this platform from heatmap (across all dows: take overall best 3 distinct hours)
  const peakHours = useMemo<number[]>(() => {
    if (!heatmap) return FALLBACK_PEAK_HOURS[platform.toLowerCase()] ?? [9, 13, 18];
    const byHour = new Map<number, number>();
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        const m = heatmap.grid[d]?.[h]?.multiplier ?? 0;
        byHour.set(h, Math.max(byHour.get(h) ?? 0, m));
      }
    }
    return Array.from(byHour.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([h]) => h)
      .sort((a, b) => a - b);
  }, [heatmap, platform]);

  const fromIso = useMemo(() => weekStart.toISOString(), [weekStart]);
  const toIso = useMemo(() => new Date(weekStart.getTime() + 7 * 86400000).toISOString(), [weekStart]);

  const { data: items } = useQuery<CalendarItem[]>({
    queryKey: ["/api/calendar", "slot-picker", fromIso, toIso],
    queryFn: async () => {
      const res = await fetch(`/api/calendar?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const days = useMemo(() => {
    const out: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      out.push(d);
    }
    return out;
  }, [weekStart]);

  const itemsByDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    (items ?? []).forEach((it) => {
      if (!it.scheduledFor) return;
      const d = new Date(it.scheduledFor);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(it);
    });
    return map;
  }, [items]);

  useEffect(() => {
    if (value) return;
    for (const d of days) {
      for (const h of peakHours) {
        const slot = new Date(d);
        slot.setHours(h, 0, 0, 0);
        if (slot.getTime() > Date.now() + 60 * 60 * 1000) {
          onChange(toLocalIso(slot));
          return;
        }
      }
    }
  }, [days, peakHours, value, onChange]);

  const now = new Date();
  const weekLabel = `${weekStart.toLocaleString(undefined, { month: "short", day: "numeric" })} – ${new Date(weekStart.getTime() + 6 * 86400000).toLocaleString(undefined, { month: "short", day: "numeric" })}`;

  const isTopSlot = (dow: number, hour: number) =>
    !!heatmap?.top.some((t) => t.dow === dow && t.hour === hour);

  const multiplierBadge = (mult?: number) => {
    if (mult === undefined) return "";
    if (mult >= 1.4) return "bg-emerald-500/20 text-[var(--score-90)] border-emerald-400/40";
    if (mult >= 1.1) return "bg-indigo-500/15 text-primary border-indigo-400/30";
    if (mult >= 0.9) return "bg-slate-500/10 text-muted-foreground border-slate-400/20";
    return "bg-muted/30 text-muted-foreground border-slate-600/40";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-eyebrow flex items-center gap-1.5">
          <CalendarIcon className="h-3 w-3" /> {weekLabel}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => setWeekStart(new Date(weekStart.getTime() - 7 * 86400000))}
            data-testid="button-slot-prev-week"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => setWeekStart(startOfWeek(new Date()))}
            data-testid="button-slot-today"
          >
            This week
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => setWeekStart(new Date(weekStart.getTime() + 7 * 86400000))}
            data-testid="button-slot-next-week"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          const dayItems = itemsByDay.get(key) ?? [];
          const isToday =
            d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
          return (
            <div
              key={key}
              className={cn(
                "rounded-lg border p-1.5 min-h-[120px]",
                isToday ? "border-indigo-400/40 bg-indigo-500/[0.04]" : "border-border bg-card"
              )}
            >
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground text-center">
                {d.toLocaleString(undefined, { weekday: "short" })}
              </div>
              <div className="text-[11px] font-semibold text-foreground text-center mb-1">{d.getDate()}</div>
              <div className="space-y-1">
                {peakHours.map((h) => {
                  const slot = new Date(d);
                  slot.setHours(h, 0, 0, 0);
                  const slotIso = toLocalIso(slot);
                  const past = slot.getTime() < Date.now();
                  const taken = dayItems.some((it) => {
                    if (!it.scheduledFor) return false;
                    const ot = new Date(it.scheduledFor);
                    return ot.getHours() === h && ot.getDate() === d.getDate();
                  });
                  const active = value === slotIso;
                  const { dow: lookupDow, hour: lookupHour } = dowHourInTz(slot, tz);
                  const mult = heatmap?.grid[lookupDow]?.[lookupHour]?.multiplier;
                  const top = isTopSlot(lookupDow, lookupHour);
                  return (
                    <button
                      key={h}
                      type="button"
                      disabled={past}
                      onClick={() => onChange(slotIso)}
                      title={taken ? "Already a post here — pick another time?" : mult ? `${mult.toFixed(2)}× avg engagement` : ""}
                      className={cn(
                        "w-full text-[10px] rounded px-1 py-1 border transition-colors flex items-center justify-center gap-1",
                        past
                          ? "opacity-40 cursor-not-allowed border-border text-muted-foreground"
                          : active
                          ? "bg-indigo-500/30 border-indigo-400 text-foreground"
                          : taken
                          ? "border-amber-400/30 bg-amber-500/10 text-[var(--score-50)] hover:bg-amber-500/20"
                          : multiplierBadge(mult) + " hover:brightness-125"
                      )}
                      data-testid={`slot-${key}-${h}`}
                    >
                      {top && !past && <Star className="h-2.5 w-2.5 text-[var(--score-90)] fill-emerald-300" />}
                      {h % 12 || 12}{h >= 12 ? "p" : "a"}{taken ? "•" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {heatmap && (
        <div className="text-meta flex items-center gap-2 pt-1">
          <Star className="h-3 w-3 text-[var(--score-90)] fill-emerald-300" />
          Starred = top 3 slots from your <a href="/insights" className="text-primary hover:underline">best-time heatmap</a>
        </div>
      )}
    </div>
  );
}
