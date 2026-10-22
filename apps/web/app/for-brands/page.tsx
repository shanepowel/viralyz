import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { pageMeta } from "@/lib/meta";
import { productStats, routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "For sellers",
  description:
    "Discover what's working, confirm your brand once, generate on-brand ad variants, and know they'll pass before you spend a penny on them.",
  path: routes.forBrands,
});

const STEPS = [
  {
    n: "01",
    title: "Discover",
    body: "Browse real running ads in your category, pulled from Meta's and TikTok's own ad libraries. Pick a reference angle before you generate anything.",
  },
  {
    n: "02",
    title: "Brand",
    body: "Paste your store URL — we pull your colors, logo, and products automatically. Confirm it once; every variant after that reuses it.",
  },
  {
    n: "03",
    title: "Studio",
    body: "Pick a placement and an angle — offer, problem, proof, or demo — and generate on-brand variants against your reference.",
  },
  {
    n: "04",
    title: "Pre-flight",
    body: "Every variant is checked for contrast, safe zone, aspect ratio, character limits, and policy issues before you ever see it.",
  },
  {
    n: "05",
    title: "Results",
    body: "Import your ad spend export and see which pre-flight checks actually predicted performance — once you have enough matched ads to say so honestly.",
  },
] as const;

export default function ForBrandsPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <p className="crumb">
            <Link href="/">Home</Link> / For sellers
          </p>
          <span className="eyebrow">For sellers</span>
          <h1>Ad creative that&apos;s checked before you spend.</h1>
          <p>
            Viralyz is built for sellers running paid ads on Meta and TikTok —
            not a creator marketplace. Discover what&apos;s working, confirm
            your brand once, and generate variants that are pre-flighted before
            they ever reach you.
          </p>
          <div className="hero-actions" style={{ marginTop: 28 }}>
            <a href={routes.signup} className="btn btn-primary">
              Start free with 10 credits
            </a>
            <Link href="#how-it-works" className="btn btn-ghost">
              See how it works
            </Link>
          </div>
        </div>
      </div>

      <section style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="stats" aria-label="Product truths">
            {productStats.map((s) => (
              <div className="stat" key={s.label}>
                <div className="num">{s.value}</div>
                <div className="label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="how-it-works">
        <div className="wrap">
          <div className="sec-head" style={{ marginBottom: 28 }}>
            <span className="eyebrow">How it works</span>
            <h2>Five steps, in order.</h2>
            <p>
              Each step feeds the next — you can&apos;t generate without a
              confirmed brand, and you can&apos;t see a calibration number
              until there&apos;s enough real data to back it.
            </p>
          </div>
          <div className="tool-grid">
            {STEPS.map((s) => (
              <div className="tool" key={s.n}>
                <span className="t-tag">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <a href={routes.signup} className="btn btn-primary">
              Start free with 10 credits
            </a>{" "}
            <Link href={routes.contact} className="btn btn-ghost">
              Talk to sales
            </Link>
          </div>
        </div>
      </section>

      <FinalCta
        title="Ready to generate your first variant?"
        subtitle="10 free credits on signup. No card required."
        cta="Start free with 10 credits"
        href={routes.signup}
      />
    </MarketingShell>
  );
}
