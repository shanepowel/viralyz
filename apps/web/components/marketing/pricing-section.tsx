import Link from "next/link";
import { MARKETING_PLANS } from "@repo/config";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000";

export function PricingSection() {
  return (
    <section id="pricing" className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mt-3 text-muted-foreground">Start free, upgrade when you&apos;re ready</p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {MARKETING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl p-8 ${
                plan.popular
                  ? "card-base card-pop border-primary/40"
                  : "card-base"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </span>
              )}
              <h3 className="font-display text-xl font-bold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-6 mb-6">
                <span className="font-display text-4xl font-bold">
                  {plan.priceMonthly === 0 ? "$0" : `$${plan.priceMonthly}`}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href={plan.id === "team" ? `${appUrl}/contact` : `${appUrl}/api/login`}>
                <Button
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
