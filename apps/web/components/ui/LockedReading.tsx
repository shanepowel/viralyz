import { cn } from "@/lib/cn";

/**
 * A metric that only shows a number once the real data threshold is met.
 * Below it, the value renders as dashes with a segmented progress bar and
 * "[n] of [threshold] matched" — never an invented number.
 */
export function LockedReading({
  label,
  matched,
  threshold,
  value,
  placeholder = "r = –.––",
  unit = "variants matched",
  tone = "default",
  segments = 10,
  className,
}: {
  label: string;
  /** How many records are matched so far. null = not known (nothing connected). */
  matched: number | null;
  threshold: number;
  /** The real reading. Only shown when matched >= threshold. */
  value?: string | null;
  placeholder?: string;
  unit?: string;
  tone?: "default" | "inverse";
  segments?: number;
  className?: string;
}) {
  const inverse = tone === "inverse";
  const unlocked = matched != null && matched >= threshold && value != null;
  const filled =
    matched == null
      ? 0
      : Math.min(segments, Math.floor((matched / threshold) * segments));

  return (
    <div
      className={cn(
        "flex flex-col gap-5 rounded-card border p-7",
        inverse ? "border-inv-line bg-inv-raised" : "border-line bg-card",
        className,
      )}
    >
      <div
        className={cn(
          "flex justify-between gap-3 text-sm",
          inverse ? "text-inv-muted" : "text-muted",
        )}
      >
        <span>{label}</span>
        <span>{unlocked ? "Calibrated" : "Locked"}</span>
      </div>
      <p
        className={cn(
          "m-0 font-display tabular text-[clamp(44px,6vw,64px)]",
          unlocked ? "" : inverse ? "text-inv-muted" : "text-muted",
        )}
      >
        {unlocked ? value : <span aria-label="No reading yet">{placeholder}</span>}
      </p>
      {unlocked ? null : (
        <div className="flex flex-col gap-2">
          <div
            className="flex gap-1"
            role="progressbar"
            aria-label={`${label}: data collected`}
            aria-valuemin={0}
            aria-valuemax={threshold}
            aria-valuenow={matched ?? 0}
          >
            {Array.from({ length: segments }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-2.5 flex-1 rounded-full",
                  i < filled
                    ? inverse
                      ? "bg-inv-ink"
                      : "bg-ink"
                    : inverse
                      ? "bg-inv-line"
                      : "bg-line",
                )}
              />
            ))}
          </div>
          <span
            className={cn(
              "text-sm tabular",
              inverse ? "text-inv-muted" : "text-muted",
            )}
          >
            {matched == null
              ? `Unlocks at ${threshold} ${unit}`
              : `${matched} of ${threshold} ${unit}`}
          </span>
        </div>
      )}
    </div>
  );
}
