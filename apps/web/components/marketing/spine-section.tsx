import { FixCard } from "@repo/ui/fix-card";

export function SpineSection() {
  return (
    <section id="spine" className="scroll-mt-20 border-t border-[var(--border-subtle)] px-6 py-24 md:py-[var(--s-24)]">
      <div className="mx-auto max-w-6xl">
        <p className="text-micro mb-4 text-[var(--text-tertiary)]">The spine</p>
        <h2 className="text-display mb-3 max-w-2xl text-[28px] font-semibold leading-tight md:text-[40px]">
          One score. Every tool writes to it.
        </h2>
        <p className="mb-12 max-w-xl text-[15px] leading-relaxed text-[var(--text-secondary)]">
          Competitors ship ten disconnected tools. Viralyz hangs creation,
          analysis, and publishing off a single content graph — so re-scores
          prove which fixes actually moved the needle.
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          <FixCard
            component="hook"
            predictedImpact={12}
            diagnosis="Your first line buries the payoff."
            suggestion="I lost £40K before I learned this"
          />
          <div className="flex flex-col justify-center gap-4 rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
            <p className="text-micro text-[var(--text-tertiary)]">Re-score diff</p>
            <div className="flex items-end gap-6">
              <div>
                <p className="font-mono text-sm text-[var(--text-tertiary)]">Before</p>
                <p className="text-display text-4xl font-semibold text-[var(--score-50)]">
                  61
                </p>
              </div>
              <span className="mb-2 text-[var(--text-tertiary)]">→</span>
              <div>
                <p className="font-mono text-sm text-[var(--text-tertiary)]">After</p>
                <p className="text-display text-4xl font-semibold text-[var(--score-90)]">
                  87
                </p>
              </div>
            </div>
            <p className="text-[15px] text-[var(--text-secondary)]">
              Hook +12 · Structure +8 · Timing +6. Predicted impact delivered.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
