import type { Metadata } from "next";
import Link from "next/link";
import { FinalCtaBand } from "@/components/marketing/final-cta-band";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonClasses } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Num } from "@/components/ui/Num";
import { Section } from "@/components/ui/Section";
import { pageMeta } from "@/lib/meta";
import { CONTACT, productFacts, routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Pricing",
  description: `Pay per variant with credits. Start with ${productFacts.signupCredits} free credits, no card needed.`,
  path: routes.pricing,
});

const FREE = [
  "Discover: search official ad libraries and save your own references",
  "Brand kit: import and confirm your product details",
  "Results: import ad results and see calibration",
] as const;

const PAID = [
  "Studio: each generated variant, including its copy and image",
  "Regenerating a variant",
] as const;

const FAQ = [
  {
    q: "What does a credit buy?",
    a: `One generated variant: headline, primary text, call to action and image, composed for the placement you chose, with its pre-flight checks. At current pricing that's ${productFacts.creditsPerVariant} credit per variant.`,
  },
  {
    q: "What happens if a generation fails?",
    a: "Credits are reserved when you start a run, and the credit for any variant that fails is refunded automatically. You only pay for variants you get.",
  },
  {
    q: "How do I get more credits?",
    a: `Paid credit packs aren't on sale yet. If you run out, email ${CONTACT.hello} and we'll sort it out while we finish billing.`,
  },
  {
    q: "Is signup open?",
    a: "We're onboarding sellers in small groups while the product settles. If the app asks for an invite code, get in touch and we'll send one.",
  },
  {
    q: "Do I need Meta or TikTok ad accounts?",
    a: "Not to use Viralyz. Discover reads public ad libraries, and Results works from a CSV you export from Ads Manager.",
  },
] as const;

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function PricingPage() {
  return (
    <MarketingShell>
      <JsonLd data={faqLd} />
      <Section className="pt-14 md:pt-24">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Pricing</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            Pay for what you generate. Nothing else.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-secondary">
            Viralyz runs on credits. Finding references, setting up your brand
            and measuring results are free. Generating variants uses credits.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border-2 border-accent bg-raised p-6 shadow-md md:p-8">
            <p className="text-sm font-medium text-accent">To start</p>
            <p className="mt-3 flex items-baseline gap-2">
              <span className="font-mono text-5xl font-semibold tracking-tight text-ink">
                <Num>{productFacts.signupCredits}</Num>
              </span>
              <span className="text-ink-secondary">free credits</span>
            </p>
            <p className="mt-2 text-sm text-ink-secondary">
              Enough for {productFacts.signupCredits / productFacts.creditsPerVariant}{" "}
              variants at current pricing. No card needed.
            </p>
            <a
              href={routes.signup}
              className={buttonClasses({ variant: "primary", size: "lg" }) + " mt-6 w-full"}
            >
              Start free
            </a>
          </div>
          <div className="space-y-4">
            <div className="rounded-md border border-line bg-raised p-5 shadow-sm">
              <p className="text-sm font-semibold text-ink">Always free</p>
              <ul className="mt-3 space-y-2 text-sm text-ink-secondary">
                {FREE.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-line bg-raised p-5 shadow-sm">
              <p className="text-sm font-semibold text-ink">
                Uses credits ({productFacts.creditsPerVariant} per variant)
              </p>
              <ul className="mt-3 space-y-2 text-sm text-ink-secondary">
                {PAID.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="sunken" id="faq">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            Questions
          </h2>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {FAQ.map((item, i) => (
              <details key={item.q} open={i === 0} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                  {item.q}
                  <span
                    className="text-ink-tertiary transition-transform group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-sm text-ink-tertiary">
            Something else?{" "}
            <Link href={routes.contact} className="text-accent underline underline-offset-4">
              Ask us
            </Link>
            .
          </p>
        </div>
      </Section>

      <FinalCtaBand
        title="Make your first variants free"
        subtitle={`${productFacts.signupCredits} credits on signup. Discover, Brand kit and Results stay free.`}
        cta="Start free"
      />
    </MarketingShell>
  );
}
