import type { RetentionCurve } from "@repo/score-engine";
import { cn } from "@/lib/utils";

interface RetentionCurveChartProps {
  curve: RetentionCurve;
  className?: string;
}

export function RetentionCurveChart({ curve, className }: RetentionCurveChartProps) {
  const width = 560;
  const height = 160;
  const pad = { t: 12, r: 12, b: 28, l: 36 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const maxT = Math.max(1, ...curve.points.map((p) => p.t));

  const coords = curve.points.map((p) => {
    const x = pad.l + (p.t / maxT) * innerW;
    const y = pad.t + (1 - p.retention / 100) * innerH;
    return `${x},${y}`;
  });

  return (
    <div
      className={cn(
        "rounded-[var(--r-md,12px)] border border-[var(--border-subtle,#26263A)] bg-[var(--bg-surface,#12121A)] p-5",
        className,
      )}
      data-testid="retention-curve"
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary,#64647A)]">
            Retention prediction
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary,#A0A0B8)]">
            Predicted watch curve with annotated risk moments
          </p>
        </div>
        {curve.primaryDropoffAt != null && (
          <p className="font-mono text-xs text-[var(--score-50,#FBBF24)]">
            Primary risk @ 0:{String(curve.primaryDropoffAt).padStart(2, "0")}
          </p>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Predicted retention curve"
      >
        {/* grid */}
        {[0, 25, 50, 75, 100].map((v) => {
          const y = pad.t + (1 - v / 100) * innerH;
          return (
            <g key={v}>
              <line
                x1={pad.l}
                x2={width - pad.r}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
              />
              <text
                x={pad.l - 8}
                y={y + 3}
                textAnchor="end"
                fill="#64647A"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                {v}
              </text>
            </g>
          );
        })}
        <polyline
          fill="none"
          stroke="#7C5CFF"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={coords.join(" ")}
        />
        {curve.riskMoments.map((r) => {
          const x = pad.l + (r.atSeconds / maxT) * innerW;
          const pt = curve.points.find((p) => p.t === r.atSeconds) ?? curve.points[0]!;
          const y = pad.t + (1 - pt.retention / 100) * innerH;
          const color =
            r.severity === "high"
              ? "#F87171"
              : r.severity === "medium"
                ? "#FBBF24"
                : "#A0A0B8";
          return (
            <g key={`${r.atSeconds}-${r.reason}`}>
              <line
                x1={x}
                x2={x}
                y1={pad.t}
                y2={pad.t + innerH}
                stroke={color}
                strokeOpacity={0.35}
                strokeDasharray="3 3"
              />
              <circle cx={x} cy={y} r={4} fill={color} />
            </g>
          );
        })}
        <text
          x={pad.l}
          y={height - 6}
          fill="#64647A"
          fontSize="10"
          fontFamily="JetBrains Mono, monospace"
        >
          0s
        </text>
        <text
          x={width - pad.r}
          y={height - 6}
          textAnchor="end"
          fill="#64647A"
          fontSize="10"
          fontFamily="JetBrains Mono, monospace"
        >
          {maxT}s
        </text>
      </svg>

      {curve.riskMoments.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {curve.riskMoments.map((r) => (
            <li
              key={`${r.atSeconds}-${r.reason}`}
              className="text-sm text-[var(--text-secondary,#A0A0B8)]"
            >
              <span
                className={cn(
                  "mr-2 font-mono text-xs uppercase",
                  r.severity === "high" && "text-[var(--score-30,#F87171)]",
                  r.severity === "medium" && "text-[var(--score-50,#FBBF24)]",
                  r.severity === "low" && "text-[var(--text-tertiary,#64647A)]",
                )}
              >
                {r.severity}
              </span>
              {r.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
