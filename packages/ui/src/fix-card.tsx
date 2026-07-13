"use client";

import { cn } from "./lib/cn";
import { scoreColor } from "./lib/score";

export type FixComponent =
  | "hook"
  | "visual"
  | "structure"
  | "metadata"
  | "timing";

export interface FixCardProps {
  component: FixComponent;
  title?: string;
  predictedImpact: number;
  diagnosis: string;
  suggestion: string;
  onApply?: () => void;
  onGenerateMore?: () => void;
  onSkip?: () => void;
  className?: string;
  busy?: boolean;
  /** When set, shows applied trail instead of action buttons */
  applied?: boolean;
  earnedPoints?: number;
}

const LABELS: Record<FixComponent, string> = {
  hook: "Opening",
  visual: "Visuals",
  structure: "Pacing",
  metadata: "Words",
  timing: "Timing",
};

function componentBorder(component: FixComponent): string {
  switch (component) {
    case "hook":
      return scoreColor(85);
    case "visual":
      return scoreColor(70);
    case "structure":
      return scoreColor(55);
    case "metadata":
      return scoreColor(45);
    case "timing":
      return scoreColor(30);
    default: {
      const _exhaustive: never = component;
      return _exhaustive;
    }
  }
}

export function FixCard({
  component,
  title,
  predictedImpact,
  diagnosis,
  suggestion,
  onApply,
  onGenerateMore,
  onSkip,
  className,
  busy = false,
  applied = false,
  earnedPoints,
}: FixCardProps) {
  const border = applied ? "var(--score-90)" : componentBorder(component);
  const impactLabel =
    predictedImpact >= 0 ? `+${predictedImpact}` : `${predictedImpact}`;
  const earned =
    earnedPoints != null
      ? earnedPoints >= 0
        ? `+${earnedPoints}`
        : `${earnedPoints}`
      : null;

  return (
    <article
      className={cn(
        "flex gap-4 border-b border-[var(--border-subtle)] px-5 py-[18px] last:border-b-0",
        applied && "bg-[var(--score-90-soft)]",
        className,
      )}
      style={{ borderLeftWidth: 0 }}
      data-testid={`fix-card-${component}${applied ? "-applied" : ""}`}
    >
      <div
        className="w-1 shrink-0 self-stretch rounded-full"
        style={{ background: border }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <header className="mb-1 flex flex-wrap items-center gap-2.5">
          <h4 className="font-[family-name:var(--font-display)] text-[14px] font-semibold text-[var(--text-primary)]">
            {title ?? LABELS[component]}
          </h4>
          {applied && earned != null ? (
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[var(--score-90)]">
              ✓ Applied · earned {earned}
            </span>
          ) : (
            <span className="font-[family-name:var(--font-mono)] text-[11.5px] font-semibold text-[var(--score-90)]">
              worth {impactLabel}
            </span>
          )}
        </header>

        <p className="mb-2.5 text-[13px] leading-snug text-[var(--text-secondary)]">
          {diagnosis}
        </p>
        <div
          className={cn(
            "mb-3 rounded-[var(--r-sm)] px-3.5 py-2.5 text-[13px] italic text-[var(--text-primary)]",
            applied ? "bg-white" : "bg-[var(--tint)]",
          )}
        >
          {suggestion}
        </div>

        {!applied && (
          <div className="flex flex-wrap gap-2">
            {onApply && (
              <button
                type="button"
                disabled={busy}
                onClick={onApply}
                className="inline-flex h-8 items-center rounded-full bg-[var(--accent)] px-3.5 text-[12.5px] font-semibold text-white transition-colors duration-[var(--dur-fast)] hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50"
              >
                Apply and score again
              </button>
            )}
            {onGenerateMore && (
              <button
                type="button"
                disabled={busy}
                onClick={onGenerateMore}
                className="inline-flex h-8 items-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3.5 text-[12.5px] font-semibold text-[var(--text-primary)] transition-colors duration-[var(--dur-fast)] hover:border-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50"
              >
                Generate more
              </button>
            )}
            {onSkip && (
              <button
                type="button"
                disabled={busy}
                onClick={onSkip}
                className="inline-flex h-8 items-center rounded-full px-3.5 text-[12.5px] font-semibold text-[var(--text-secondary)] transition-colors duration-[var(--dur-fast)] hover:bg-[var(--tint)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50"
              >
                Skip
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
