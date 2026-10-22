import type { Metadata } from "next";
import Link from "next/link";
import { FinalCtaBand } from "@/components/marketing/final-cta-band";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PageBuilder } from "@/components/page-builder/PageBuilder";
import { LoopDiagram } from "@/components/studio/LoopDiagram";
import { VariantMock } from "@/components/studio/VariantMock";
import { buttonClasses } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Num } from "@/components/ui/Num";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { pageMeta } from "@/lib/meta";
import { productFacts, productStats, routes } from "@/lib/site";
import { fetchSanity } from "@/sanity/lib/fetch";
import { PAGE_QUERY } from "@/sanity/lib/queries";

export const metadata: Metadata = pageMeta({
  title: "Ad creatives built from ads that are already working",
  description:
    "Find long-running ads in official ad libraries, turn their structure into on-brand variants for your product, check each one before you spend, and calibrate against your own results.",
  path: routes.home,
});

const SOURCES = [
  {
    name: "Meta Ad Library",
    detail: "EU and UK ads, through Meta's official API",
  },
  {
    name: "TikTok Commercial Content Library",
    detail: "Ads in TikTok's approved markets",
  },
  {
    name: "Your own references",
    detail: "Any ad or product page by link, or an uploaded screenshot",
  },
] as const;

const CHECK_GROUPS = [
  {
    heading: "Measured against the placement's spec",
    items: [
      "Text contrast",
      "Text-to-image area",
      "Safe-zone overlap",
      "Aspect ratio",
      "Headline and primary-text length",
    ],
  },
  {
    heading: "Restricted-claim checks",
    items: [
      "Before-and-after claims",
      "Health claims",
      "Income claims",
      "Personal-attribute claims",
    ],
  },
  {
    heading: "Shown separately, never scored",
    items: ["Hook clarity, assessed by AI"],
  },
] as const;

const PRINCIPLES = [
  {
    title: "No “winner” labels",
    body: "Libraries don't publish sales. We show what they do publish, how long an ad has run and how many variants it has, and let you judge.",
  },
  {
    title: "Blank beats wrong",
    body: `The pre-flight score stays empty until at least ${productFacts.minScoredChecks} checks could actually run. A number built on two checks would look precise and mean little.`,
  },
  {
    title: "Calibrated on your ads",
    body: `Once ${productFacts.calibrationMinAds} of your ads each pass ${productFacts.calibrationMinImpressions.toLocaleString("en-GB")} impressions, Results shows how closely our checks tracked your real click-through rate. Before that, it says so.`,
  },
] as const;

export default async function HomePage() {
  const page = await fetchSanity<{
    pageBuilder?: { _type: string; _key?: string; [k: string]: unknown }[];
  }>({
    query: PAGE_QUERY,
    params: { slug: "home" },
  });

  if (page?.pageBuilder?.length) {
    return (
      <MarketingShell>
        <PageBuilder blocks={page.pageBuilder} />
      </MarketingShell>
    );
  }

  return (
    <MarketingShell>
      <Section className="pt-14 md:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Eyebrow>Ad creative studio for online sellers</Eyebrow>
            <h1 className="mt-3 font-display text-[2.6rem] font-semibold leading-[1.04] tracking-tight text-ink md:text-6xl">
              Make ads from the ones that are already working.
            </h1>
            <p className="mt-5 max-w-prose text-base leading-relaxed text-ink-secondary md:text-lg">
              Find ads advertisers have kept paying for, borrow their
              structure, and get on-brand variants for your product. Every
              variant is checked before you spend, and your own results show
              how far to trust those checks.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={routes.signup}
                className={buttonClasses({ variant: "primary", size: "lg" })}
              >
                Start with {productFacts.signupCredits} free credits
              </a>
              <a
                href="#how-it-works"
                className={buttonClasses({ variant: "secondary", size: "lg" })}
              >
                See how it works
              </a>
            </div>
            <p className="mt-4 text-sm text-ink-tertiary">
              No card needed. One credit makes one variant.
            </p>
          </div>
          <VariantMock className="lg:ml-4" />
        </div>
      </Section>

      <section className="border-y border-line bg-sunken">
        <Container className="py-8">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">
            Where references come from
          </p>
          <ul className="mt-4 grid gap-5 md:grid-cols-3">
            {SOURCES.map((s) => (
              <li key={s.name}>
                <p className="font-semibold text-ink">{s.name}</p>
                <p className="mt-0.5 text-sm text-ink-secondary">{s.detail}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-ink-tertiary">
            Official sources only. They don&apos;t cover US-only ads, so we
            don&apos;t pretend to.
          </p>
        </Container>
      </section>

      <Section id="how-it-works">
        <SectionHeader
          eyebrow="How it works"
          title="Five steps, and the last one feeds the next round."
          lede="Each step lives on its own page in the app. Use the whole loop, or just the parts you need."
        />
        <LoopDiagram />
      </Section>

      <Section tone="sunken">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <SectionHeader
              className="mb-6"
              eyebrow="Pre-flight checks"
              title="Catch the fixable problems before you pay for impressions."
              lede="Unreadable text, copy that gets cut off, a headline hidden under the Stories reply bar, a claim the platform will reject. These are cheap to fix before launch and expensive after."
            />
            <p className="max-w-prose text-sm leading-relaxed text-ink-secondary">
              Specs come from each platform&apos;s published ad guidelines for
              Meta feed (1:1 and 4:5), Stories (9:16) and TikTok (9:16). The
              score is the share of checks that passed. It tells you whether
              an ad is fit to run, not how much it will sell.
            </p>
            <Link
              href="/platform/pre-flight"
              className="mt-5 inline-block text-sm font-medium text-accent underline underline-offset-4 hover:text-accent-hover"
            >
              How pre-flight works →
            </Link>
          </div>
          <div className="space-y-4">
            {CHECK_GROUPS.map((g) => (
              <div
                key={g.heading}
                className="rounded-md border border-line bg-raised p-5 shadow-sm"
              >
                <p className="text-sm font-semibold text-ink">{g.heading}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {g.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-line bg-bg px-3 py-1 text-[13px] text-ink-secondary"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeader
          eyebrow="How we measure"
          title="Numbers we won't make up."
          lede="Ad tools love confident scores. Ours are allowed to say “not enough data yet”."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {PRINCIPLES.map((p, i) => (
            <div key={p.title} className="border-t-2 border-accent pt-5">
              <p className="font-mono text-xs text-ink-tertiary">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold tracking-tight text-ink">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                {p.body}
              </p>
            </div>
          ))}
        </div>
        <Link
          href={routes.trust}
          className="mt-8 inline-block text-sm font-medium text-accent underline underline-offset-4 hover:text-accent-hover"
        >
          Read how we measure →
        </Link>
      </Section>

      <Section className="border-t border-line py-12 md:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {productStats.map((s) => (
            <div key={s.label}>
              <p className="font-mono text-3xl font-semibold tracking-tight text-ink">
                <Num>{s.value}</Num>
              </p>
              <p className="mt-1 text-sm text-ink-secondary">{s.label}</p>
            </div>
          ))}
        </div>
      </Section>

      <FinalCtaBand
        title="Make your next ad from one that's working"
        subtitle={`Start with ${productFacts.signupCredits} free credits. One credit makes one variant, and every variant comes with its pre-flight checks.`}
        cta="Start free"
        secondary={{ href: routes.pricing, label: "See pricing" }}
      />
    </MarketingShell>
  );
}
