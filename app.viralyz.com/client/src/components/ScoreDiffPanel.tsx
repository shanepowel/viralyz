import type { ScoreDiff } from "@repo/score-engine";
import { cn } from "@/lib/utils";

interface ScoreDiffPanelProps {
  diff: ScoreDiff;
  className?: string;
}

export function ScoreDiffPanel({ diff, className }: ScoreDiffPanelProps) {
  const up = diff.deltaViral >= 0;

  return (
    <div
      className={cn(
        "rounded-[var(--r-md,12px)] border border-[var(--border-subtle,#26263A)] bg-[var(--bg-surface,#12121A)] p-5",
        className,
      )}
      data-testid="score-diff-panel"
    >
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary,#64647A)]">
        Re-score diff
      </p>
      <div className="mb-5 flex items-end gap-6">
        <div>
          <p className="font-mono text-sm text-[var(--text-tertiary,#64647A)]">Before</p>
          <p className="text-display text-4xl font-semibold text-[var(--score-50,#FBBF24)] tabular-nums">
            {diff.beforeViral}
          </p>
        </div>
        <span className="mb-2 text-[var(--text-tertiary,#64647A)]">→</span>
        <div>
          <p className="font-mono text-sm text-[var(--text-tertiary,#64647A)]">After</p>
          <p
            className={cn(
              "text-display text-4xl font-semibold tabular-nums",
              up ? "text-[var(--score-90,#34D399)]" : "text-[var(--score-30,#F87171)]",
            )}
          >
            {diff.afterViral}
          </p>
        </div>
        <div className="mb-1 ml-auto font-mono text-sm tabular-nums text-[var(--text-secondary,#A0A0B8)]">
          {up ? "+" : ""}
          {diff.deltaViral} pts
        </div>
      </div>

      <ul className="space-y-2">
        {diff.components.map((c) => (
          <li
            key={c.component}
            className="flex items-center justify-between text-sm"
          >
            <span className="capitalize text-[var(--text-secondary,#A0A0B8)]">
              {c.component}
            </span>
            <span className="font-mono tabular-nums text-[var(--text-primary,#F4F4F8)]">
              {c.before} → {c.after}{" "}
              <span
                className={
                  c.delta > 0
                    ? "text-[var(--score-90,#34D399)]"
                    : c.delta < 0
                      ? "text-[var(--score-30,#F87171)]"
                      : "text-[var(--text-tertiary,#64647A)]"
                }
              >
                ({c.delta > 0 ? "+" : ""}
                {c.delta})
              </span>
            </span>
          </li>
        ))}
      </ul>

      {diff.deliveredFixes.length > 0 && (
        <div className="mt-4 border-t border-[var(--border-subtle,#26263A)] pt-4">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary,#64647A)]">
            Fix impact
          </p>
          <ul className="space-y-1.5">
            {diff.deliveredFixes.map((f) => (
              <li
                key={f.issue}
                className="flex justify-between gap-3 text-sm text-[var(--text-secondary,#A0A0B8)]"
              >
                <span className="truncate">{f.issue}</span>
                <span className="shrink-0 font-mono tabular-nums">
                  pred +{f.predictedImpact} · obs {f.observedDelta >= 0 ? "+" : ""}
                  {f.observedDelta}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
