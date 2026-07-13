"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScoreRing } from "@repo/ui/score-ring";
import { cn } from "@/lib/utils";

interface AnalysisRevealProps {
  open: boolean;
  score: number;
  components: {
    hook: number;
    visual: number;
    structure: number;
    metadata: number;
    timing: number;
  };
  onComplete: () => void;
}

const BARS: Array<{ key: keyof AnalysisRevealProps["components"]; label: string }> = [
  { key: "hook", label: "Hook" },
  { key: "visual", label: "Visual" },
  { key: "structure", label: "Structure" },
  { key: "metadata", label: "Metadata" },
  { key: "timing", label: "Timing" },
];

/**
 * Full-screen dopamine moment after analysis completes.
 * Ring draws 1.2s → bars stagger → optional confetti at 85+ → collapses.
 */
export function AnalysisReveal({
  open,
  score,
  components,
  onComplete,
}: AnalysisRevealProps) {
  const [phase, setPhase] = useState<"ring" | "bars" | "done">("ring");
  const showConfetti = score >= 85;

  useEffect(() => {
    if (!open) {
      setPhase("ring");
      return;
    }
    const t1 = setTimeout(() => setPhase("bars"), 1200);
    const t2 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 2800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [open, onComplete]);

  return (
    <AnimatePresence>
  {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0F]/95 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-label={`Viral score ${score}`}
        >
          {showConfetti && <ConfettiBurst />}
          <div className="flex flex-col items-center gap-10 px-6">
            <ScoreRing
              score={score}
              size={200}
              label="Viral Score"
              components={{
                hook: components.hook * 5,
                visual: components.visual * 5,
                structure: components.structure * 5,
                metadata: components.metadata * 5,
                timing: components.timing * 5,
              }}
            />

            <div className="w-full max-w-sm space-y-3">
              {BARS.map((bar, i) => {
                const value = components[bar.key];
                const pct = (value / 20) * 100;
                const showBars = phase !== "ring";
                return (
                  <motion.div
                    key={bar.key}
                    initial={{ opacity: 0, x: -16 }}
                    animate={
                      showBars
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0, x: -16 }
                    }
                    transition={{
                      delay: i * 0.08,
                      duration: 0.35,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <div className="mb-1 flex justify-between text-xs text-[var(--text-secondary,#A0A0B8)]">
                      <span className="font-mono uppercase tracking-[0.08em]">
                        {bar.label}
                      </span>
                      <span className="font-mono tabular-nums">
                        {value}/20
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-[var(--accent,#7C5CFF)]"
                        initial={{ width: 0 }}
                        animate={showBars ? { width: `${pct}%` } : { width: 0 }}
                        transition={{
                          delay: i * 0.08 + 0.05,
                          duration: 0.5,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ConfettiBurst() {
  const pieces = Array.from({ length: 28 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((i) => (
        <span
          key={i}
          className={cn(
            "absolute top-1/2 left-1/2 h-2 w-2 rounded-sm",
            i % 3 === 0
              ? "bg-[var(--score-90,#34D399)]"
              : i % 3 === 1
                ? "bg-[var(--accent,#7C5CFF)]"
                : "bg-[var(--score-70,#A3E635)]",
          )}
          style={{
            animation: `vy-confetti 1.1s cubic-bezier(0.16,1,0.3,1) forwards`,
            animationDelay: `${(i % 7) * 30}ms`,
            transform: `rotate(${i * 13}deg)`,
            ["--dx" as string]: `${Math.cos((i / 28) * Math.PI * 2) * (120 + (i % 5) * 40)}px`,
            ["--dy" as string]: `${Math.sin((i / 28) * Math.PI * 2) * (90 + (i % 4) * 50) - 40}px`,
          }}
        />
      ))}
      <style>{`
        @keyframes vy-confetti {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.4) rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
}
