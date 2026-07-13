import { CASE_STUDIES } from "@repo/config";
import { MomentumSparkline } from "@repo/ui/momentum-sparkline";

const SAMPLE_SCORES = [
  [54, 58, 61, 63, 70, 74, 78, 82, 85, 87],
  [48, 52, 55, 60, 64, 68, 72, 75, 79, 84],
  [62, 60, 65, 68, 71, 73, 76, 80, 83, 88],
];

export function CasesSection() {
  return (
    <section
      id="cases"
      className="scroll-mt-20 border-t border-[var(--border-subtle)] px-6 py-24 md:py-[var(--s-24)]"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-micro mb-4 text-[var(--text-tertiary)]">Proof</p>
        <h2 className="text-display mb-3 max-w-2xl text-[28px] font-semibold leading-tight md:text-[40px]">
          Three creators. Verified outcomes.
        </h2>
        <p className="mb-12 max-w-xl text-[15px] leading-relaxed text-[var(--text-secondary)]">
          No testimonial wall — just score momentum and what changed.
        </p>

        <ul className="grid gap-10 md:grid-cols-3">
          {CASE_STUDIES.map((c, i) => (
            <li key={c.handle}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-display font-semibold">{c.handle}</p>
                  <p className="text-sm text-[var(--text-tertiary)]">{c.niche}</p>
                </div>
                <MomentumSparkline scores={SAMPLE_SCORES[i]!} width={72} height={24} />
              </div>
              <p className="mb-3 font-mono text-[13px] text-[var(--score-90)]">
                {c.result}
              </p>
              <blockquote className="text-[15px] leading-relaxed text-[var(--text-secondary)]">
                &ldquo;{c.quote}&rdquo;
              </blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
