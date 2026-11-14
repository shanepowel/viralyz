import type { Metadata } from "next";
import Link from "next/link";
import { FinalCtaBand } from "@/components/marketing/final-cta-band";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { PageBuilder } from "@/components/page-builder/PageBuilder";
import {
  HaldenAd,
  NordlysAd,
  OstraAd,
  PepaAd,
  RoveStoryAd,
} from "@/components/studio/ExampleAds";
import { ProofDemo } from "@/components/studio/ProofDemo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { InversePanel } from "@/components/ui/InversePanel";
import { LockedReading } from "@/components/ui/LockedReading";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { VariantCard } from "@/components/ui/VariantCard";
import { pageMeta } from "@/lib/meta";
import {
  calibration,
  placements,
  productFacts,
  routes,
  SITE_URL,
} from "@/lib/site";
import { fetchSanity } from "@/sanity/lib/fetch";
import { PAGE_QUERY } from "@/sanity/lib/queries";

export const metadata: Metadata = pageMeta({
  title: "Make the ad. Check it. Then spend on it.",
  description:
    "Viralyz generates on-brand ad variants for every placement and checks each one for contrast, safe zones, ratio, copy length, policy and hook before you put budget behind it.",
  path: routes.home,
});

const LOOP = [
  {
    title: "Discover",
    href: "/platform/discover",
    body: "See ads that are live now in the Meta and TikTok libraries, grouped by how they open.",
  },
  {
    title: "Brand",
    href: "/platform/brand",
    body: "Paste your shop link once. Colours, logo and products carry into every ad.",
  },
  {
    title: "Studio",
    href: "/platform/studio",
    body: "Make a batch across placements and angles. One credit per ad.",
  },
  {
    title: "Pre-flight",
    href: "/platform/pre-flight",
    body: "Five measured rules and one estimate on every ad, marked on the proof.",
  },
  {
    title: "Results",
    href: "/platform/results",
    body: "Import your Ads Manager export and see whether the checks held up.",
  },
];

const TRUST = [
  {
    title: "No borrowed stars",
    body: "When there are reviews, they will link to where they were left.",
  },
  {
    title: "No invented customers",
    body: "No stock faces, no made-up job titles, no user counts we cannot show.",
  },
  {
    title: "No scores before data",
    body: "Locked states show how much more data is needed.",
  },
  {
    title: "Examples say so",
    body: "Anything made up for illustration is labelled, every time.",
  },
];

export default async function HomePage() {
  // The coded page below is the homepage. A Sanity "home" document only
  // replaces it when SANITY_HOME=1, so stale CMS content can never take
  // over the front page by accident.
  const page =
    process.env.SANITY_HOME === "1"
      ? await fetchSanity<{
          pageBuilder?: { _type: string; _key?: string; [k: string]: unknown }[];
        }>({
          query: PAGE_QUERY,
          params: { slug: "home" },
        })
      : null;

  if (page?.pageBuilder?.length) {
    return (
      <MarketingShell>
        <PageBuilder blocks={page.pageBuilder} />
      </MarketingShell>
    );
  }

  const { freeCredits, calibrationThreshold } = productFacts;

  return (
    <MarketingShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Viralyz",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: SITE_URL,
          description:
            "Makes on-brand ad creative for Meta and TikTok and checks every ad against the placement's rules before any budget is spent.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "GBP", description: `${freeCredits} free credits on signup` },
        }}
      />
      {/* Hero: the claim on the left, the product doing it on the right. */}
      <Container className="grid grid-cols-1 items-start gap-x-12 gap-y-10 pb-16 pt-[clamp(40px,6vw,80px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
        <div className="min-w-0">
          <p className="kicker m-0">Ad creative for Meta and TikTok, checked before you spend</p>
          <h1 className="m-0 mt-4 font-display text-[clamp(42px,5.4vw,72px)]">
            Make the ad. Mark it up. Then spend on it.
          </h1>
          <p className="m-0 mt-6 max-w-[540px] text-[19px] text-ink-2">
            Viralyz makes on-brand ads for every placement and measures each
            one against the placement&apos;s rules. Anything that must change
            is marked on the ad, with the reason, before any budget goes
            behind it.
          </p>
          <form
            action={routes.signup}
            method="get"
            className="mt-8 flex w-full max-w-[540px] flex-wrap gap-2"
          >
            <label htmlFor="store" className="sr-only">
              Your shop or product link
            </label>
            <input
              id="store"
              name="store"
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="Paste your shop or product link"
              className="min-h-13 min-w-0 flex-[1_1_260px] rounded-inner border border-rule bg-card px-3.5 text-base text-ink"
            />
            <button
              type="submit"
              className="min-h-13 flex-none cursor-pointer rounded-inner border border-btn bg-btn px-[22px] text-[15px] font-semibold text-btn-ink hover:opacity-85"
            >
              Make and check
            </button>
          </form>
          <p className="m-0 mt-3 font-mono text-[12px] text-muted">
            {freeCredits} free credits / one credit per ad / no subscription
          </p>
        </div>
        <ProofDemo />
      </Container>

      {/* A batch, as a contact sheet */}
      <Container className="pb-20">
        <SectionHeader
          eyebrow="One batch"
          title="Every placement, each with its verdict"
          lede="A batch comes back as a contact sheet. Green is cleared. Red says what to change. Nothing is hidden behind a score."
        />
        <div className="grid grid-cols-2 items-end gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
          <VariantCard ratio="4:5" placement="Feed" check={{ state: "pass" }}>
            <HaldenAd />
          </VariantCard>
          <VariantCard ratio="9:16" placement="Story" check={{ state: "warn", label: "1 to fix" }}>
            <RoveStoryAd />
          </VariantCard>
          <VariantCard ratio="1:1" placement="Feed" check={{ state: "pass" }}>
            <PepaAd />
          </VariantCard>
          <VariantCard ratio="9:16" placement="TikTok" check={{ state: "fail", label: "Blocked: weight claim" }}>
            <OstraAd />
          </VariantCard>
          <VariantCard ratio="4:5" placement="Feed" check={{ state: "warn", label: "1 to fix" }}>
            <NordlysAd />
          </VariantCard>
        </div>
        <p className="mb-0 mt-5 font-mono text-[11px] text-muted">
          Example output for fictional brands. Supported placements:{" "}
          {placements.join(", ")}.
        </p>
      </Container>

      {/* How it works */}
      <Container className="pb-20">
        <SectionHeader
          eyebrow="How it works"
          title="Five steps, and the check sits in the middle"
          lede="Between making the ad and paying for it. That is the step other tools skip."
        />
        <div className="grid grid-cols-1 gap-x-8 md:grid-cols-[200px_1fr]">
          <span className="hidden md:block" />
          <ol className="m-0 list-none border-t border-rule p-0">
            {LOOP.map((step, i) => (
              <li
                key={step.title}
                className="grid grid-cols-[32px_1fr] gap-x-4 gap-y-1 border-b border-line py-4 sm:grid-cols-[32px_180px_1fr_auto]"
              >
                <span className="font-mono text-[13px] text-muted">{i + 1}</span>
                <Link href={step.href} className="font-display text-[22px] hover:underline hover:underline-offset-4">
                  {step.title}
                </Link>
                <span className="col-start-2 text-ink-2 sm:col-start-auto">{step.body}</span>
                {i === 3 ? (
                  <span className="col-start-2 self-center font-mono text-[11px] uppercase tracking-[0.06em] text-mark sm:col-start-auto">
                    The step others skip
                  </span>
                ) : (
                  <span className="hidden sm:block" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </Container>

      {/* Results — the page's one inverse panel */}
      <InversePanel className="flex flex-wrap items-center gap-12">
        <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-[18px]">
          <Eyebrow tone="inverse">Results</Eyebrow>
          <h2 className="m-0 font-display text-[clamp(34px,4.6vw,56px)]">
            No chart until there’s data to draw it.
          </h2>
          <p className="m-0 text-inv-muted">
            We match your real spend back to the variants you made. Once
            enough are matched, you see how pre-flight scores relate to
            performance in your account. Until then, you see exactly how far
            there is to go.
          </p>
        </div>
        <LockedReading
          tone="inverse"
          label="Pre-flight score vs CTR"
          matched={calibration.matched}
          threshold={calibrationThreshold}
          value={calibration.rho}
          className="min-w-0 flex-[1_1_420px]"
        />
      </InversePanel>

      {/* Trust */}
      <Container id="trust" className="py-20">
        <SectionHeader eyebrow="Trust" title="Every number here has a source" />
        <div className="grid grid-cols-1 gap-x-8 md:grid-cols-[200px_1fr]">
          <span className="hidden md:block" />
          <ul className="m-0 grid list-none grid-cols-1 gap-x-8 border-t border-rule p-0 sm:grid-cols-2">
            {TRUST.map((t) => (
              <li key={t.title} className="flex flex-col gap-1 border-b border-line py-4">
                <strong className="font-semibold">{t.title}</strong>
                <span className="text-[15px] text-ink-2">{t.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <FinalCtaBand
        tone="panel"
        title="Stop paying to find out an ad was broken."
        subtitle={`Start with ${freeCredits} free credits. Top up when you need more.`}
        secondary={{ href: routes.pricing, label: "See pricing" }}
      />
    </MarketingShell>
  );
}
