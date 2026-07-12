import { MARKETING_RESULTS } from "@repo/config";
import { ArrowRight } from "lucide-react";

export function ResultsSection() {
  const { before, after } = MARKETING_RESULTS;

  return (
    <section className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Real Results</h2>
          <p className="mt-3 text-muted-foreground">See what happens when you fix what&apos;s broken</p>
        </div>

        <div className="grid items-stretch gap-8 md:grid-cols-[1fr_auto_1fr]">
          <div className="card-base rounded-2xl p-8">
            <p className="text-eyebrow mb-6 text-rose-300/80">Before Viralyz</p>
            <div className="font-display mb-6 text-6xl font-bold text-rose-300/90">{before.score}</div>
            <p className="mb-1 text-sm font-medium text-muted-foreground">Viral Score</p>
            <ul className="mb-8 space-y-2">
              {before.issues.map((issue) => (
                <li key={issue} className="text-sm text-muted-foreground">
                  {issue}
                </li>
              ))}
            </ul>
            <p className="text-lg font-semibold text-muted-foreground">{before.views}</p>
          </div>

          <div className="hidden items-center justify-center md:flex">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
              <ArrowRight className="h-5 w-5 text-primary" />
            </div>
          </div>

          <div className="card-base card-pop rounded-2xl border-primary/30 p-8">
            <p className="text-eyebrow mb-6 text-emerald-300/80">After Viralyz</p>
            <div className="font-display mb-6 text-6xl font-bold text-emerald-300">{after.score}</div>
            <p className="mb-1 text-sm font-medium text-muted-foreground">Viral Score</p>
            <ul className="mb-8 space-y-2">
              {after.improvements.map((item) => (
                <li key={item} className="text-sm text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-lg font-semibold">{after.views}</p>
            <p className="mt-2 text-sm font-semibold text-emerald-400">{after.multiplier}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
