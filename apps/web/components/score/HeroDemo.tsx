"use client";

import { useEffect, useState } from "react";
import { FactorBar } from "@/components/score/FactorBar";
import { ScoreRing } from "@/components/score/ScoreRing";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const STEPS = [
  { factors: [40, 70, 55, 0], score: 41, fix: null as string | null },
  { factors: [100, 70, 55, 0], score: 56, fix: null },
  {
    factors: [100, 100, 100, 72],
    score: 83,
    fix: "6 of 8 checks scored · pre-flight 83",
  },
] as const;

export function HeroDemo() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = STEPS[step]!;

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(STEPS.length - 1);
      return;
    }
    const id = window.setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <Card
      className="p-5 md:p-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-sm bg-sunken px-2.5 py-1 font-mono text-xs text-ink-secondary">
          vz_k3f9 · meta_feed_4x5
        </span>
        <Badge variant="neutral">Product preview</Badge>
      </div>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <ScoreRing
          value={current.score}
          size={120}
          animate
          key={current.score}
          label={`Pre-flight ${current.score} out of 100`}
        />
        <div className="w-full flex-1 space-y-3">
          <FactorBar label="Contrast" value={current.factors[0]} />
          <FactorBar label="Safe zone" value={current.factors[1]} />
          <FactorBar label="Character limits" value={current.factors[2]} />
          <FactorBar label="Hook strength" value={current.factors[3]} />
          {current.fix ? (
            <div className="mt-2 rounded-sm border border-line bg-sunken px-3 py-2 text-sm text-ink">
              Fix: <strong>{current.fix}</strong>
            </div>
          ) : (
            <div className="mt-2 h-10 rounded-sm border border-dashed border-line" />
          )}
        </div>
      </div>
    </Card>
  );
}
