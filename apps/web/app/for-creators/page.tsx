import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { DemoBadge } from "@/components/marketing/demo-badge";
import { creators, creatorInitials, formatFollowers } from "@/data/creators";
import { formatGBP } from "@/lib/currency";
import { flags } from "@/lib/flags";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "For creators",
  description:
    "Score your content, build a verified track record, and get discovered by brands.",
  path: routes.forCreators,
});

const sample = creators[0]!;

export default function ForCreatorsPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <p className="crumb">
            <Link href="/">Home</Link> / For creators
          </p>
          <span className="eyebrow">For creators</span>
          <h1>Post better. Prove it. Get hired.</h1>
          <p>
            Score every video before you post. Build a track record from
            connected accounts. Share one media kit brands can trust.
          </p>
          <div className="hero-actions" style={{ marginTop: 28 }}>
            <Link href={routes.signup} className="btn btn-primary">
              Start scoring free
            </Link>
            <Link href={`/kit/${sample.slug}`} className="btn btn-ghost">
              See an example media kit
            </Link>
          </div>
        </div>
      </div>

      <section style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="tool-grid">
            <Link href="/platform/viral-score" className="band-card">
              <div className="ico2">Sc</div>
              <h4>Viral Score</h4>
              <p>Score out of 100 with a fix for each weak area.</p>
            </Link>
            <Link href="/platform/hook-lab" className="band-card">
              <div className="ico2">Hk</div>
              <h4>Hook Lab</h4>
              <p>Ten opening lines for your idea, ranked by predicted score.</p>
            </Link>
            <Link href="/platform/script-doctor" className="band-card">
              <div className="ico2">Sd</div>
              <h4>Script Doctor</h4>
              <p>
                Line-by-line feedback, with a teleprompter built in while you
                record.
              </p>
            </Link>
            <Link href={`/kit/${sample.slug}`} className="band-card">
              <div className="ico2">Mk</div>
              <h4>Media kit</h4>
              <p>A verified one-link profile brands can check in seconds.</p>
            </Link>
            <Link href="/tools/engagement-calculator" className="band-card">
              <div className="ico2">Rt</div>
              <h4>Rate calculator</h4>
              <p>Engagement rate in seconds — free, no signup.</p>
            </Link>
            <Link href={routes.blog} className="band-card">
              <div className="ico2">Bl</div>
              <h4>Blog</h4>
              <p>Teardowns and honest pricing data.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="band" id="profile" style={{ marginTop: 48 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Verified profile</span>
            <h2>Real numbers from connected accounts</h2>
            <p>
              Connect TikTok, YouTube, Instagram or X. Followers, engagement and
              score history come from the platform — not a spreadsheet you
              typed.
            </p>
          </div>
        </div>
      </section>

      <section className="band" id="media-kit">
        <div className="wrap">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
              gap: 48,
              alignItems: "center",
            }}
          >
            <div className="kit">
              <div className="kit-top">
                <div className="kit-ava" style={{ background: sample.face }}>
                  {creatorInitials(sample)}
                </div>
                <div>
                  <div className="kit-name">
                    {sample.name}{" "}
                    {!flags.marketplaceLive ? (
                      <DemoBadge label="Example media kit" />
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
            <div>
              <span className="eyebrow">Media kit</span>
              <h2>One link brands can trust</h2>
              <p>
                Packages, rates and score history in one place. Share
                viralyz.com/kit/yourname when you are ready.
              </p>
              <Link href={`/kit/${sample.slug}`} className="btn btn-ghost">
                See an example media kit
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FinalCta
        title="Join the founding roster"
        subtitle="Ten free scores a month. Build your track record before brands arrive."
        cta="Start free"
        href={routes.signup}
      />
    </MarketingShell>
  );
}
