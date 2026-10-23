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
import { PreflightDemoCompact } from "@/components/studio/PreflightDemo";
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
  "Discover a working angle",
  "Import your brand once",
  "Generate variants per placement",
  "Pre-flight every variant",
  "Match real spend in Results",
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

  const { freeCredits, calibrationThreshold } = productFacts;

  return (
    <MarketingShell>
      {/* Hero */}
      <Container className="flex flex-col items-center gap-[22px] pb-10 pt-[clamp(48px,7vw,88px)] text-center">
        <Eyebrow className="gap-2 py-1.5 pl-2 pr-3.5 text-sm">
          <span className="inline-flex items-center gap-1 rounded-full bg-pass-bg px-2 py-0.5 text-xs font-semibold text-pass">
            <span aria-hidden="true">✓</span> Pre-flight
          </span>
          for Meta and TikTok ads
        </Eyebrow>
        <h1 className="m-0 max-w-[1100px] font-display text-[clamp(42px,6.4vw,84px)]">
          Make the ad. Check it.
          <br />
          Then spend on it.
        </h1>
        <p className="m-0 max-w-[600px] text-[19px] text-muted">
          Viralyz generates on-brand variants for every placement and checks
          each one for contrast, safe zones, ratio, copy length, policy and
          hook before you put budget behind it.
        </p>
        <form
          action={routes.signup}
          method="get"
          className="mt-2 box-border flex w-full max-w-[620px] flex-wrap items-center gap-2 rounded-card border border-line bg-card p-2 shadow-float"
        >
          <label htmlFor="store" className="sr-only">
            Your store URL
          </label>
          <input
            id="store"
            name="store"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="Paste your store URL"
            className="min-h-12 min-w-0 flex-[1_1_260px] border-0 bg-transparent px-3.5 text-base text-ink outline-none focus-visible:outline-none"
          />
          <button
            type="submit"
            className="min-h-12 flex-none cursor-pointer rounded-[14px] border-0 bg-btn px-[22px] text-[15px] font-semibold text-btn-ink hover:opacity-85"
          >
            Generate and check
          </button>
        </form>
        <p className="m-0 text-[13px] text-muted tabular">
          {freeCredits} free credits · No subscription
        </p>
      </Container>

      {/* Example variants */}
      <section
        aria-label="Example variants"
        className="px-[clamp(16px,3vw,32px)] pb-4 pt-6"
      >
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 items-end gap-3.5 md:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          <VariantCard
            ratio="4:5"
            placement="Feed"
            check={{ state: "pass", label: "6/6 passed" }}
          >
            <HaldenAd />
          </VariantCard>
          <VariantCard
            ratio="9:16"
            placement="Story"
            check={{ state: "warn", label: "CTA in safe zone" }}
          >
            <RoveStoryAd />
          </VariantCard>
          <VariantCard
            ratio="1:1"
            placement="Square"
            check={{ state: "pass", label: "6/6 passed" }}
          >
            <PepaAd />
          </VariantCard>
          <VariantCard
            ratio="9:16"
            placement="TikTok"
            check={{ state: "fail", label: "Policy: weight claim" }}
          >
            <OstraAd />
          </VariantCard>
          <VariantCard
            ratio="4:5"
            placement="Feed"
            check={{ state: "warn", label: "Text truncates" }}
            className="col-span-2 mx-auto w-1/2 md:col-span-1 md:mx-0 md:w-full"
          >
            <NordlysAd />
          </VariantCard>
        </div>
        <p className="mx-auto mb-0 mt-3.5 max-w-[1400px] text-center text-xs text-muted">
          Example output for fictional brands. Real customer variants replace
          these at launch.
        </p>
      </section>

      {/* Placements */}
      <Container className="py-14">
        <ul
          aria-label="Supported placements"
          className="m-0 flex list-none flex-wrap justify-center gap-2.5 p-0"
        >
          {placements.map((p) => (
            <li
              key={p}
              className="rounded-full border border-line px-[18px] py-2.5 text-[15px]"
            >
              {p}
            </li>
          ))}
        </ul>
      </Container>

      {/* How it works */}
      <Container className="flex flex-col items-center gap-9 pb-24 pt-12">
        <SectionHeader
          eyebrow="How it works"
          title="One loop, from a working idea to real results"
          lede="Pre-flight sits in the middle, between making the ad and paying for it. That is the step every other tool skips."
          className="mb-0"
        />
        <div className="flex w-full flex-wrap overflow-hidden rounded-3xl border border-line bg-panel">
          <div className="flex min-w-0 flex-[1_1_320px] flex-col justify-between gap-8 bg-bg p-8">
            <div className="flex flex-col gap-2.5">
              <h3 className="m-0 font-display text-[28px]">Pre-flight</h3>
              <p className="m-0 text-base text-muted">
                Every variant is checked the moment it is generated. Problems
                come with a one-click fix, so you never upload a broken ad.
              </p>
            </div>
            <ol className="m-0 flex list-none flex-col gap-1 p-0 text-base">
              {LOOP.map((step, i) => {
                const current = i === 3;
                return (
                  <li
                    key={step}
                    aria-current={current ? "step" : undefined}
                    className={
                      current
                        ? "-ml-3 rounded-[10px] bg-panel px-3 py-2 font-semibold"
                        : "py-2 text-muted"
                    }
                  >
                    <span className="tabular">
                      {String(i + 1).padStart(2, "0")}
                    </span>{" "}
                    · {step}
                  </li>
                );
              })}
            </ol>
          </div>
          <div className="dots flex min-w-0 flex-[2_1_560px] items-center justify-center p-[clamp(20px,4vw,48px)]">
            <PreflightDemoCompact />
          </div>
        </div>
        <p className="-mt-4 mb-0 text-xs text-muted">
          Product UI shown with a fictional brand.
        </p>
      </Container>

      {/* Features */}
      <Container className="pb-24">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4">
          <Link href="/platform/discover" className="group flex flex-col gap-3.5">
            <div
              className="dots flex aspect-[4/3] items-center justify-center gap-2.5 rounded-card bg-panel p-6"
              aria-hidden="true"
            >
              {[
                ["bg-[#2F5D50]", "41"],
                ["bg-[#E8A33D]", "28"],
                ["bg-[#6B5BD6]", "63"],
              ].map(([bg, days]) => (
                <div
                  key={days}
                  className={`relative aspect-[4/5] flex-1 rounded-[10px] ${bg}`}
                >
                  <span className="absolute bottom-2 left-2 rounded-full bg-white px-2 py-[3px] text-[10px] font-semibold text-black tabular">
                    {days} days live
                  </span>
                </div>
              ))}
            </div>
            <div>
              <strong className="font-semibold group-hover:underline">
                Discover →
              </strong>
              <p className="m-0 mt-0.5 text-[15px] text-muted">
                Ads running now in Meta and TikTok libraries, sorted by how
                long they have survived.
              </p>
            </div>
          </Link>
          <Link href="/platform/brand" className="group flex flex-col gap-3.5">
            <div
              className="dots flex aspect-[4/3] items-center justify-center rounded-card bg-panel p-6"
              aria-hidden="true"
            >
              <div className="flex w-full max-w-[280px] flex-col gap-3 rounded-[14px] border border-line bg-card p-4">
                <span className="text-xs text-muted">halden.co</span>
                <div className="flex gap-1.5">
                  <span className="h-[34px] flex-1 rounded-lg bg-[#1E3A2A]" />
                  <span className="h-[34px] flex-1 rounded-lg bg-[#D5E5D8]" />
                  <span className="h-[34px] flex-1 rounded-lg border border-line bg-[#F4F1EA]" />
                  <span className="h-[34px] flex-1 rounded-lg bg-[#B5835A]" />
                </div>
                <span className="text-[13px]">
                  Logo, 4 colours, 12 products imported
                </span>
              </div>
            </div>
            <div>
              <strong className="font-semibold group-hover:underline">
                Brand →
              </strong>
              <p className="m-0 mt-0.5 text-[15px] text-muted">
                Paste your store URL once. Colours, logo and catalogue carry
                into every variant.
              </p>
            </div>
          </Link>
          <Link href="/platform/results" className="group flex flex-col gap-3.5">
            <div
              className="dots flex aspect-[4/3] items-center justify-center rounded-card bg-panel p-6"
              aria-hidden="true"
            >
              <div className="flex w-full max-w-[280px] flex-col gap-2.5 rounded-[14px] border border-line bg-card p-4">
                <span className="text-xs text-muted">
                  Score vs CTR · your account
                </span>
                <div className="flex h-[70px] items-center justify-center border-b border-l border-line">
                  <span className="text-[13px] text-muted tabular">
                    Unlocks at {calibrationThreshold} matches
                  </span>
                </div>
                <div className="flex gap-[3px]">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 flex-1 rounded-[3px] bg-line"
                    />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <strong className="font-semibold group-hover:underline">
                Results →
              </strong>
              <p className="m-0 mt-0.5 text-[15px] text-muted">
                Import your Ads Manager export and see whether the checks held
                up with real spend.
              </p>
            </div>
          </Link>
        </div>
        <p className="mb-0 mt-4 text-center text-xs text-muted">
          Illustrations use fictional brands and data.
        </p>
      </Container>

      {/* Results — the page's one inverse panel */}
      <InversePanel className="flex flex-wrap items-center gap-12 py-[clamp(40px,7vw,96px)]">
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
      <Container
        id="trust"
        className="flex flex-col items-center gap-9 py-24"
      >
        <SectionHeader
          eyebrow="Trust"
          title="Every number here has a source"
          className="mb-0"
        />
        <ul className="m-0 grid w-full list-none grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-3 p-0">
          {TRUST.map((t) => (
            <li
              key={t.title}
              className="flex flex-col gap-2 rounded-card bg-panel p-6"
            >
              <strong className="font-semibold">{t.title}</strong>
              <span className="text-[15px] text-muted">{t.body}</span>
            </li>
          ))}
        </ul>
      </Container>

      <FinalCtaBand
        tone="panel"
        title="Stop paying to find out an ad was broken"
        subtitle={`Start with ${freeCredits} free credits. Top up when you need more.`}
        secondary={{ href: routes.pricing, label: "See pricing" }}
      />
    </MarketingShell>
  );
}
