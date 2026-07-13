import Link from "next/link";
import { Button } from "@repo/ui/button";
import { PLANS } from "@repo/config";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000";

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="scroll-mt-20 border-t border-[var(--border-subtle)] px-6 py-24 md:py-[var(--s-24)]"
    >
      <div className="mx-auto max-w-6xl">
        <p className="text-micro mb-4 text-[var(--text-tertiary)]">Pricing</p>
        <h2 className="text-display mb-3 max-w-2xl text-[28px] font-semibold leading-tight md:text-[40px]">
          Western pricing. Outcome-first.
        </h2>
        <p className="mb-12 max-w-xl text-[15px] leading-relaxed text-[var(--text-secondary)]">
          Annual = 2 months free. Free tier includes credit top-ups when you need
          more analyses.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-[var(--r-lg)] border p-6 ${
                plan.popular
                  ? "border-[var(--accent)] bg-[var(--bg-surface)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-surface)]"
              }`}
            >
              {plan.popular && (
                <span className="text-micro absolute -top-2.5 left-6 bg-[var(--bg-base)] px-2 text-[var(--accent)]">
                  Popular
                </span>
              )}
              <h3 className="text-display mb-1 text-lg font-semibold">{plan.name}</h3>
              <p className="mb-5">
                <span className="text-display text-3xl font-semibold">
                  {plan.priceMonthly === 0 ? "Free" : `$${plan.priceMonthly}`}
                </span>
                {plan.priceMonthly > 0 && (
                  <span className="text-[var(--text-tertiary)]">/mo</span>
                )}
              </p>
              <ul className="mb-6 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="text-[13px] leading-snug text-[var(--text-secondary)]"
                  >
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.popular ? "default" : "outline"}
                className="w-full"
                asChild
              >
                <Link href={APP_URL}>
                  {plan.priceMonthly === 0 ? "Get started" : "Subscribe"}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
