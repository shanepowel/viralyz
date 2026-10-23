import type { Metadata } from "next";
import { FinalCtaBand } from "@/components/marketing/final-cta-band";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { FAQ } from "@/components/ui/FAQ";
import { PricingCard } from "@/components/ui/PricingCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { flags } from "@/lib/flags";
import { formatGbp } from "@/lib/format";
import { pageMeta } from "@/lib/meta";
import {
  creditCosts,
  creditPacks,
  productFacts,
  routes,
  vatNote,
} from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Pricing",
  description:
    "Viralyz runs on credits. Start free, top up when you need more, and never pay for a month you didn't use.",
  path: routes.pricing,
});

const { freeCredits, creditsPerVariant } = productFacts;

const FAQ_ITEMS = [
  {
    q: "How do credits work?",
    a: `${creditsPerVariant} credit generates one ad variant for one placement. Every variant is pre-flighted automatically, and that check doesn't cost anything extra.`,
  },
  {
    q: "Is there a subscription?",
    a: "No. You start with free credits and add more when you need them.",
  },
  {
    q: "What if a variant fails pre-flight?",
    a: "You see why, with a suggested fix. Pre-flight itself never costs credits.",
  },
  {
    q: "What happens if a generation fails?",
    a: "You're refunded automatically. A failed or retried generation never costs you a credit.",
  },
  {
    q: "How do I get more credits?",
    a: flags.paymentsLive
      ? "Buy more credits directly from your account page, any time."
      : "Self-serve credit purchases aren't live yet. Talk to sales and we'll sort you out.",
  },
  {
    q: "Is every variant really AI-generated?",
    a: "Yes, and it's labelled that way on every variant, with no exceptions.",
  },
] as const;

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function Page() {
  const packs = flags.paymentsLive ? creditPacks : [];

  return (
    <MarketingShell>
      <JsonLd data={faqLd} />

      <Container className="pb-12 pt-[clamp(48px,7vw,88px)]">
        <SectionHeader
          as="h1"
          eyebrow="Pricing"
          title="Pay for ads you make. Not for seats."
          lede="Viralyz runs on credits. Start free, top up when you need more, and never pay for a month you didn’t use."
          className="mb-0"
        />
      </Container>

      <Container className="pb-[88px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(250px,100%),1fr))] items-stretch gap-3">
          <PricingCard
            name="Free"
            price="£0"
            meta={`${freeCredits} credits to start`}
            description="Import your brand, generate a first set and see pre-flight on your own ads."
            cta={{ label: "Get started", href: routes.signup }}
          />
          {packs.length ? (
            packs.map((pack, i) => (
              <PricingCard
                key={pack.name}
                name={pack.name}
                price={formatGbp(pack.pricePence)}
                meta={`${pack.credits} credits · ${formatGbp(
                  Math.round(pack.pricePence / pack.credits),
                )} each`}
                description={pack.description}
                cta={{ label: "Buy credits", href: pack.href }}
                highlight={i === 1}
              />
            ))
          ) : (
            <PricingCard
              name="More credits"
              price="—"
              meta="Packs aren’t on sale yet"
              description="Self-serve credit packs aren’t live yet. Tell us what you need and we’ll set you up."
              cta={{ label: "Talk to sales", href: routes.contact }}
            />
          )}
        </div>
        {vatNote ? (
          <p className="mb-0 mt-4 text-center text-[13px] text-muted">
            Prices in GBP, {vatNote}.
          </p>
        ) : null}
      </Container>

      <Container className="pb-[88px]">
        <div className="flex flex-wrap gap-10 rounded-panel bg-panel p-[clamp(28px,5vw,64px)]">
          <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-3.5">
            <h2 className="m-0 font-display text-[clamp(30px,4vw,48px)]">
              What a credit buys
            </h2>
            <p className="m-0 text-muted">
              You see the cost before you run anything and your balance after.
              No hidden multipliers by placement.
            </p>
          </div>
          <dl className="m-0 min-w-0 flex-[1_1_520px] rounded-card border border-line bg-card px-[22px] py-2">
            {creditCosts.map((row, i) => (
              <div
                key={row.action}
                className={
                  "flex justify-between gap-4 py-4" +
                  (i < creditCosts.length - 1 ? " border-b border-line" : "")
                }
              >
                <dt>{row.action}</dt>
                <dd className="m-0 font-semibold tabular">
                  {row.credits === 0
                    ? "Included"
                    : `${row.credits} credit${row.credits === 1 ? "" : "s"}`}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>

      <Container className="max-w-[860px] pb-24" id="faq">
        <h2 className="m-0 mb-7 text-center font-display text-[clamp(30px,4vw,48px)]">
          Questions
        </h2>
        <FAQ items={FAQ_ITEMS} />
      </Container>

      <FinalCtaBand title={`Start with ${freeCredits} free credits`} />
    </MarketingShell>
  );
}
