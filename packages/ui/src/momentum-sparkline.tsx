"use client";

import { cn } from "./lib/cn";

export interface MomentumSparklineProps {
  /** Last N viral scores (oldest → newest), typically up to 10 */
  scores: number[];
  width?: number;
  height?: number;
  className?: string;
}

export function MomentumSparkline({
  scores,
  width = 64,
  height = 20,
  className,
}: MomentumSparklineProps) {
  if (scores.length < 2) {
    return (
      <span
        className={cn("inline-block text-[var(--text-tertiary)]", className)}
        aria-hidden
      >
        —
      </span>
    );
  }

  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = Math.max(1, max - min);
  const pad = 2;
  const points = scores
    .map((s, i) => {
      const x = pad + (i / (scores.length - 1)) * (width - pad * 2);
      const y = height - pad - ((s - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const trendingUp = scores[scores.length - 1]! >= scores[0]!;
  const stroke = trendingUp ? "var(--score-90)" : "var(--score-30)";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("inline-block align-middle", className)}
      role="img"
      aria-label={trendingUp ? "Score trending up" : "Score trending down"}
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
