import type { RetentionCurve } from "@repo/score-engine";
import { cn } from "@/lib/utils";

interface RetentionCurveChartProps {
  curve: RetentionCurve;
  className?: string;
}

function formatSeconds(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.round(t % 60);
  return m > 0
    ? `${m}:${String(s).padStart(2, "0")}`
    : `0:${String(s).padStart(2, "0")}`;
}

export function RetentionCurveChart({
  curve,
  className,
}: RetentionCurveChartProps) {
  const width = 600;
  const height = 120;
  const maxT = Math.max(1, ...curve.points.map((p) => p.t));

  const path = curve.points
    .map((p, i) => {
      const x = (p.t / maxT) * width;
      const y = (1 - p.retention / 100) * (height - 8) + 4;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  const area = `${path} L${width},${height} L0,${height} Z`;

  const risk =
    curve.riskMoments?.[0] ??
    (curve.primaryDropoffAt != null
      ? {
          atSeconds: curve.primaryDropoffAt,
          reason: "People start leaving here.",
          severity: "medium" as const,
        }
      : null);

  const riskT = risk?.atSeconds;
  const riskX = riskT != null ? (riskT / maxT) * width : null;
  const riskY =
    riskT != null
      ? (() => {
          const nearest = curve.points.reduce((best, p) =>
            Math.abs(p.t - riskT) < Math.abs(best.t - riskT) ? p : best,
          );
          return (1 - nearest.retention / 100) * (height - 8) + 4;
        })()
      : null;

  return (
    <div className={cn("px-5 py-5", className)} data-testid="retention-curve">
      <svg
        className="h-[120px] w-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Predicted watch curve"
      >
        <defs>
          <linearGradient id="retFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6C4CF1" stopOpacity="0.18" />
            <stop offset="1" stopColor="#6C4CF1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#retFill)" />
        <path
          d={path}
          fill="none"
          stroke="#6C4CF1"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
        />
        {riskX != null && riskY != null && (
          <circle cx={riskX} cy={riskY} r="5" fill="#D9950B" />
        )}
      </svg>
      {risk && riskT != null && (
        <div className="mt-2.5 flex items-start gap-2 text-[12px] text-[var(--ink-2)]">
          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--score-50-soft)] text-[10px] font-bold text-[var(--score-50)]">
            !
          </span>
          <span>
            Risk moment at {formatSeconds(riskT)}.{" "}
            {risk.reason || "The still shot loses people."} The fix above deals
            with this.
          </span>
        </div>
      )}
    </div>
  );
}
