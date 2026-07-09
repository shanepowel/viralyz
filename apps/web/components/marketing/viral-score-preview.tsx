"use client";

import { useEffect, useState } from "react";

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-bold tabular-nums">{score}</span>
        <span className="text-eyebrow mt-1">Viral Score</span>
      </div>
    </div>
  );
}

export function ViralScorePreview() {
  const [score, setScore] = useState(34);
  const [phase, setPhase] = useState<"analyzing" | "done">("analyzing");

  useEffect(() => {
    const t1 = setTimeout(() => setScore(58), 1200);
    const t2 = setTimeout(() => {
      setScore(89);
      setPhase("done");
    }, 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const breakdown = [
    { label: "Hook Strength", value: phase === "done" ? "18/20" : "7/20" },
    { label: "Visual Impact", value: phase === "done" ? "17/20" : "14/20" },
    { label: "Timing", value: phase === "done" ? "16/20" : "5/20" },
  ];

  return (
    <div className="glass-card card-pop relative mx-auto w-full max-w-md animate-float rounded-2xl p-6">
      <div className="mb-1 text-center text-xs font-medium text-muted-foreground">
        viralyz.com/analyze
      </div>
      <div className="flex flex-col items-center py-4">
        <ScoreRing score={score} size={140} />
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              phase === "analyzing" ? "animate-pulse bg-accent" : "bg-emerald-400"
            }`}
          />
          {phase === "analyzing" ? "Analyzing hook & pacing..." : "Ready to post"}
        </div>
      </div>
      <div className="divider-soft space-y-3 pt-4">
        {breakdown.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-medium tabular-nums">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
