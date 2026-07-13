"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "./lib/cn";
import { scoreBandClass, scoreColor } from "./lib/score";

export interface ScoreRingProps {
  score: number | null | undefined;
  /** Preset sizes: 32 table, 64 card, 120 header, 200 reveal — or custom px */
  size?: 32 | 64 | 120 | 200 | number;
  strokeWidth?: number;
  label?: string;
  className?: string;
  animate?: boolean;
  /** Optional five-component scores shown as sub-arcs on hover (0–100 each) */
  components?: {
    hook?: number;
    visual?: number;
    structure?: number;
    metadata?: number;
    timing?: number;
  };
}

const SIZE_STROKE: Record<number, number> = {
  32: 3,
  64: 5,
  120: 8,
  200: 10,
};

export function ScoreRing({
  score,
  size = 120,
  strokeWidth,
  label,
  className,
  animate = true,
  components,
}: ScoreRingProps) {
  const gradId = useId().replace(/:/g, "");
  const [displayScore, setDisplayScore] = useState(animate ? 0 : (score ?? 0));
  const target = score ?? 0;
  const stroke = strokeWidth ?? SIZE_STROKE[size] ?? Math.max(4, Math.round(size * 0.067));
  const color = scoreColor(score);
  const showGlow = (score ?? 0) >= 80;

  useEffect(() => {
    if (!animate) {
      setDisplayScore(target);
      return;
    }
    let raf = 0;
    const startTime = performance.now();
    const duration = 1200;
    const start = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // --ease-out approximation
      setDisplayScore(Math.round(start + (target - start) * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, animate]);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;
  const fontSize =
    size >= 200 ? 56 : size >= 120 ? 36 : size >= 64 ? 20 : 11;

  const componentValues = components
    ? [
        components.hook,
        components.visual,
        components.structure,
        components.metadata,
        components.timing,
      ].filter((v): v is number => typeof v === "number")
    : [];

  return (
    <div
      className={cn(
        "group relative inline-flex items-center justify-center",
        scoreBandClass(score),
        showGlow && "glow-score",
        className,
      )}
      style={{ width: size, height: size }}
      data-testid={`score-ring-${score ?? "na"}`}
      role="img"
      aria-label={score == null ? "No score" : `Viral score ${score}`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity={0.65} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={`url(#${gradId})`}
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
        {componentValues.length === 5 &&
          componentValues.map((value, i) => {
            const subR = radius - stroke - 4 - i * 3;
            const subC = 2 * Math.PI * subR;
            const arc = (value / 100) * subC * 0.18;
            const gap = subC / 5;
            return (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={subR}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeDasharray={`${arc} ${gap - arc}`}
                strokeDashoffset={-i * gap}
                className="opacity-0 transition-opacity duration-300 group-hover:opacity-60"
              />
            );
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-[family-name:var(--font-display)] font-semibold tabular-nums text-[var(--text-primary)]"
          style={{ fontSize, lineHeight: 1 }}
        >
          {score == null ? "—" : displayScore}
        </span>
        {label && size >= 64 && (
          <span
            className="mt-1 font-[family-name:var(--font-mono)] uppercase tracking-[0.08em] text-[var(--text-tertiary)]"
            style={{ fontSize: Math.max(9, size * 0.08) }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
