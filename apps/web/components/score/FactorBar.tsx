import { Num } from "@/components/ui/Num";
import { cn } from "@/lib/cn";

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
      <span className="w-20 shrink-0 text-muted">{label}</span>
      <div className="h-2 flex-1 rounded-full bg-panel overflow-hidden">
        <div
          className="h-full rounded-full bg-ink"
          style={{ width: `${value}%` }}
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
        "tabular text-sm font-medium text-ink",
        className,
      )}
      aria-label={`${up ? "up" : "down"} ${Math.abs(delta)} points`}
    >
      {up ? "▲" : "▼"} {up ? "+" : "−"}
      {Math.abs(delta)}
    </span>
  );
}
