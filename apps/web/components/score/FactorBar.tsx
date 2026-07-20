import { Num } from "@/components/ui/Num";
import { cn } from "@/lib/cn";

function tone(value: number) {
  if (value >= 75) return "var(--score-high)";
  if (value >= 50) return "var(--score-mid)";
  return "var(--score-low)";
}

export function FactorBar({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 text-sm", className)}>
      <span className="w-20 shrink-0 text-ink-secondary">{label}</span>
      <div className="h-2 flex-1 rounded-full bg-sunken overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-[var(--dur-med)] ease-out"
          style={{ width: `${value}%`, background: tone(value) }}
        />
      </div>
      <Num className="w-8 text-right text-ink">{value}</Num>
    </div>
  );
}

export function ScoreDelta({
  delta,
  className,
}: {
  delta: number;
  className?: string;
}) {
  const up = delta >= 0;
  return (
    <span
      className={cn(
        "font-mono tabular-nums text-sm font-medium",
        up ? "text-score-high" : "text-score-low",
        className,
      )}
      aria-label={`${up ? "up" : "down"} ${Math.abs(delta)} points`}
    >
      {up ? "▲" : "▼"} {up ? "+" : "−"}
      {Math.abs(delta)}
    </span>
  );
}
