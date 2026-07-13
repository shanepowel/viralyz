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
}

const LABELS: Record<FixComponent, string> = {
  hook: "HOOK",
  visual: "VISUAL",
  structure: "STRUCTURE",
  metadata: "METADATA",
  timing: "TIMING",
};

/** Map component to a representative score color for the left border */
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
}: FixCardProps) {
  const border = componentBorder(component);
  const impactLabel =
    predictedImpact >= 0 ? `+${predictedImpact}` : `${predictedImpact}`;

  return (
    <article
      className={cn(
        "rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-card)]",
        className,
      )}
      style={{ borderLeftWidth: 3, borderLeftColor: border }}
      data-testid={`fix-card-${component}`}
    >
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <span className="font-[family-name:var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">
          {title ?? LABELS[component]}
        </span>
        <span className="font-[family-name:var(--font-mono)] text-[13px] tabular-nums text-[var(--score-90)]">
          {impactLabel} pts predicted
        </span>
      </header>

      <p className="mb-2 text-[15px] leading-relaxed text-[var(--text-primary)]">
        {diagnosis}
      </p>
      <p className="mb-5 text-[15px] leading-relaxed text-[var(--text-secondary)]">
        <span className="text-[var(--text-tertiary)]">Try: </span>
        &ldquo;{suggestion}&rdquo;
      </p>

      <div className="flex flex-wrap gap-2">
        {onApply && (
          <button
            type="button"
            disabled={busy}
            onClick={onApply}
            className="inline-flex h-9 items-center rounded-[var(--r-sm)] bg-[var(--accent)] px-3.5 text-[13px] font-medium text-[var(--accent-foreground)] transition-colors duration-[var(--dur-fast)] hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50"
          >
            Apply to script
          </button>
        )}
        {onGenerateMore && (
          <button
            type="button"
            disabled={busy}
            onClick={onGenerateMore}
            className="inline-flex h-9 items-center rounded-[var(--r-sm)] border border-[var(--border-subtle)] bg-transparent px-3.5 text-[13px] font-medium text-[var(--text-primary)] transition-colors duration-[var(--dur-fast)] hover:bg-[var(--bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50"
          >
            Generate 5 more
          </button>
        )}
        {onSkip && (
          <button
            type="button"
            disabled={busy}
            onClick={onSkip}
            className="inline-flex h-9 items-center rounded-[var(--r-sm)] px-3.5 text-[13px] font-medium text-[var(--text-tertiary)] transition-colors duration-[var(--dur-fast)] hover:text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-50"
          >
            Skip
          </button>
        )}
      </div>
    </article>
  );
}
