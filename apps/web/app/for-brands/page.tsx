import type { Metadata } from "next";
import Link from "next/link";
import { EarlyAccess } from "@/components/marketing/early-access";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { DemoBadge } from "@/components/marketing/demo-badge";
import { creators, creatorInitials, formatFollowers } from "@/data/creators";
import { formatGBP } from "@/lib/currency";
import { flags } from "@/lib/flags";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "For brands",
  description:
    "Hire creators who can prove it. Verified track records and score gates before content goes live.",
  path: routes.forBrands,
});

const sample = creators[0]!;

export default function ForBrandsPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <p className="crumb">
            <Link href="/">Home</Link> / For brands
          </p>
          <span className="eyebrow">For brands</span>
          <h1>Hire creators who can prove it.</h1>
          <p>
            Follower counts do not tell you if a campaign will work. On Viralyz,
            every creator has a track record from connected accounts, and you
            can see how content scores before it goes live.
          </p>
          <div className="hero-actions" style={{ marginTop: 28 }}>
            <Link href={routes.creators} className="btn btn-primary">
              Browse creators
            </Link>
            <Link href="#campaigns" className="btn btn-ghost">
              How campaigns work
            </Link>
          </div>
          <p className="fine">Founding creator roster now onboarding.</p>
        </div>
      </div>

      <section style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="kit" style={{ maxWidth: 420, marginBottom: 48 }}>
            <div className="kit-top">
              <div className="kit-ava" style={{ background: sample.face }}>
                {creatorInitials(sample)}
              </div>
              <div>
                <div className="kit-name">
                  {sample.name}{" "}
                  {!flags.marketplaceLive ? (
                    <DemoBadge label="Example" />
                  ) : null}
                </div>
                <div className="kit-verified">Example profile</div>
              </div>
            </div>
            <div className="kit-grid">
              <div className="kit-cell">
                <div className="kv">{formatFollowers(sample.followers)}</div>
                <div className="kl">Followers</div>
              </div>
              <div className="kit-cell">
                <div className="kv">{sample.engagementPct}%</div>
                <div className="kl">Engagement</div>
              </div>
              <div className="kit-cell">
                <div className="kv">{sample.score}</div>
                <div className="kl">Viral Score</div>
              </div>
              <div className="kit-cell">
                <div className="kv">{formatGBP(sample.suggestedRateGbp)}</div>
                <div className="kl">Suggested rate</div>
              </div>
            </div>
          </div>

          <div className="stats" aria-label="Product truths">
            <div className="stat">
              <div className="num">100</div>
              <div className="label">Point score per video</div>
            </div>
            <div className="stat">
              <div className="num">5</div>
              <div className="label">Areas analyzed</div>
            </div>
            <div className="stat">
              <div className="num">&lt;30s</div>
              <div className="label">To a first score</div>
            </div>
            <div className="stat">
              <div className="num">10%</div>
              <div className="label">Brand fee at launch</div>
            </div>
          </div>
        </div>
      </section>

      <section className="band" id="campaigns">
        <div className="wrap">
          <div className="sec-head" style={{ marginBottom: 28 }}>
            <span className="eyebrow">Campaigns</span>
            <h2>How campaigns will work</h2>
            <p>
              Brief, book, and pay in one place when payments go live. Until
              then, talk to us for early-access campaigns with founding
              creators.
            </p>
          </div>
          <div className="tool-grid">
            <div className="tool">
              <span className="t-tag">01</span>
              <h3>Brief</h3>
              <p>
                Set niche, score floor, and deliverables. Creators see the brief
                before they accept.
              </p>
            </div>
            <div className="tool">
              <span className="t-tag">02</span>
              <h3>Book</h3>
              <p>
                Fixed package prices. Creators keep 100% of the listed price;
                brands pay a 10% platform fee on top.
              </p>
            </div>
            <div className="tool">
              <span className="t-tag">03</span>
              <h3>Approve</h3>
              <p>
                At launch, escrow holds payment until you approve the
                deliverable. Score gates optional before content goes live.
              </p>
            </div>
          </div>
          <div style={{ marginTop: 28 }}>
            <Link href={routes.creators} className="btn btn-primary">
              Browse creators
            </Link>{" "}
            <Link href={routes.contact} className="btn btn-ghost">
              Talk to sales
            </Link>
          </div>
        </div>
      </section>

      <EarlyAccess />

      <FinalCta
        title="Ready to hire on proof?"
        subtitle="Apply for early access or browse example creator profiles."
        cta="Talk to sales"
        href={routes.contact}
      />
    </MarketingShell>
  );
}
