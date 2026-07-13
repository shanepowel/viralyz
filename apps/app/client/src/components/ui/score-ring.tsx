import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number | null | undefined;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
  animate?: boolean;
}

/** Signal score bands: emerald / lime / amber / red */
export function scoreTone(score: number | null | undefined): "emerald" | "lime" | "amber" | "rose" | "slate" {
  if (score == null) return "slate";
  if (score >= 80) return "emerald";
  if (score >= 60) return "lime";
  if (score >= 40) return "amber";
  return "rose";
}

export function ScoreRing({
  score,
  size = 144,
  strokeWidth = 10,
  label,
  className,
  animate = true,
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score ?? 0);
  const target = score ?? 0;

  useEffect(() => {
    if (!animate) {
      setDisplayScore(target);
      return;
    }
    let raf: number;
    let start = 0;
    const startTime = performance.now();
    const duration = 900;
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayScore(Math.round(start + (target - start) * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, animate]);

  const tone = scoreTone(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  const stops: Record<string, [string, string]> = {
    emerald: ["#34D399", "#34D399"],
    lime: ["#A3E635", "#A3E635"],
    amber: ["#FBBF24", "#FBBF24"],
    rose: ["#F87171", "#F87171"],
    slate: ["#64647A", "#3A3A52"],
  };
  const [c1, c2] = stops[tone];
  const gradId = `ringGradient-${tone}`;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", `score-glow-${tone}`, className)}
      style={{ width: size, height: size }}
      data-testid={`score-ring-${score ?? "na"}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="ring-track"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={`url(#${gradId})`}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-display text-4xl text-white tabular-nums">
          {score == null ? "—" : displayScore}
        </span>
        {label && <span className="text-eyebrow mt-1">{label}</span>}
      </div>
    </div>
  );
}
