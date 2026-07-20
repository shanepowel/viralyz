"use client";

import { useEffect, useState } from "react";
import { FactorBar } from "@/components/score/FactorBar";
import { ScoreRing } from "@/components/score/ScoreRing";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const STEPS = [
  { factors: [40, 70, 55, 60], score: 52, fix: null as string | null },
  { factors: [52, 81, 68, 72], score: 77, fix: null },
  {
    factors: [64, 81, 68, 90],
    score: 89,
    fix: "lead with the result, not the setup · +12",
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
          morning-routine-v2.mp4
        </span>
        <Badge variant="neutral">Product preview</Badge>
      </div>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <ScoreRing value={current.score} size={120} animate key={current.score} />
        <div className="w-full flex-1 space-y-3">
          <FactorBar label="Hook" value={current.factors[0]} />
          <FactorBar label="Pacing" value={current.factors[1]} />
          <FactorBar label="Caption" value={current.factors[2]} />
          <FactorBar label="Thumbnail" value={current.factors[3]} />
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
