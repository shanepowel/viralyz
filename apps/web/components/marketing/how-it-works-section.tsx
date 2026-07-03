import { MARKETING_STEPS } from "@repo/config";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">How It Works</h2>
          <p className="mt-3 text-muted-foreground">Three simple steps to viral content</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {MARKETING_STEPS.map((step) => (
            <div key={step.step} className="card-base card-hover rounded-2xl p-8 text-center">
              <div className="mb-4 text-4xl">{step.emoji}</div>
              <p className="text-eyebrow mb-2">{step.step}</p>
              <h3 className="font-display mb-3 text-xl font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
