import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { ImageSlot } from "@/components/marketing/image-slot";

export const metadata: Metadata = {
  title: "For brands",
  description: "Hire creators who can prove their performance with verified scores.",
};

export default function Page() {
  return (
    <MarketingShell>
      <div className="wrap">
        <section className="hero">
          <div>
            <p className="crumb"><Link href="/">Home</Link> / For brands</p>
            <span className="kicker">For brands</span>
            <h1 className="display">Hire creators who can prove it.</h1>
            <p className="sub">Search verified profiles by real performance, see how content will score before it goes live, and pay safely through the platform.</p>
            <div className="row">
              <Link href="/creators" className="btn btn-primary">Search creators</Link>
              <Link href="#cases" className="btn btn-ghost">See case studies</Link>
            </div>
            <p className="fine">2,140 verified creators, checked hourly.</p>
          </div>
          <div className="kit">
            <div className="kit-top">
              <div className="kit-ava">MR</div>
              <div><div className="kit-name">Maya R.</div><div className="kit-verified">✓ Verified today</div></div>
            </div>
            <div className="kit-grid">
              <div className="kit-cell"><div className="kv">214K</div><div className="kl">Followers</div></div>
              <div className="kit-cell"><div className="kv">6.8%</div><div className="kl">Engagement</div></div>
              <div className="kit-cell"><div className="kv">412K</div><div className="kl">Avg views</div></div>
              <div className="kit-cell"><div className="kv">$850</div><div className="kl">Suggested rate</div></div>
            </div>
          </div>
        </section>

        <section className="stats" aria-label="Viralyz for brands, by the numbers">
          <div className="stat"><div className="num">2,140</div><div className="label">Verified creators</div></div>
          <div className="stat"><div className="num">82%</div><div className="label">Prediction accuracy</div></div>
          <div className="stat"><div className="num">4.2×</div><div className="label">More views after fixes</div></div>
          <div className="stat"><div className="num">0%</div><div className="label">Self-reported stats</div></div>
        </section>

        <section className="band" id="campaigns">
          <span className="kicker">How campaigns work</span>
          <div className="features-grid" style={{marginTop: "24px"}}>
            <div className="feature">
              <span className="num">01</span>
              <h3>Search &amp; shortlist</h3>
              <p>Filter by niche, score, platform and followers. Every number is verified, not self-reported.</p>
            </div>
            <div className="feature">
              <span className="num">02</span>
              <h3>Brief &amp; book</h3>
              <p>Send a brief, agree scope and rate, and book directly. No back-and-forth over email.</p>
            </div>
            <div className="feature">
              <span className="num">03</span>
              <h3>Score before it goes live</h3>
              <p>Preview how content will perform before it's posted, and pay safely once it's delivered.</p>
            </div>
          </div>
        </section>

        <section className="band" id="cases">
          <span className="kicker">Case studies</span>
          <h2 className="split-title" style={{margin: 0}}>Real campaign results</h2>
          <div className="case-grid">
            <div className="case-card">
              <div className="cs-fig"><ImageSlot id="case-1" shape="rect" label="Campaign photo" /></div>
              <div className="cs-body"><span className="cs-tag">Food &amp; bev</span><h4>3.1× ROAS from a 4-creator roster</h4><p>A snack brand booked four food creators through Viralyz and tracked return in real time.</p></div>
            </div>
            <div className="case-card">
              <div className="cs-fig"><ImageSlot id="case-2" shape="rect" label="Campaign photo" /></div>
              <div className="cs-body"><span className="cs-tag">Beauty</span><h4>Launch hit 1.2M views in a week</h4><p>Verified creator data let the team pick partners with proven hook strength.</p></div>
            </div>
            <div className="case-card">
              <div className="cs-fig"><ImageSlot id="case-3" shape="rect" label="Campaign photo" /></div>
              <div className="cs-body"><span className="cs-tag">Fitness app</span><h4>Cut creator sourcing time by 70%</h4><p>An agency used the campaign manager to run five clients' rosters from one dashboard.</p></div>
            </div>
          </div>
        </section>

        <section className="close">
          <div className="patch">
            <h3>Book your first creator this week</h3>
            <p className="sub">Search verified profiles and brief your first campaign in minutes.</p>
            <div className="row">
              <Link href="/creators" className="btn btn-primary">Search creators</Link>
              <Link href="/contact" className="btn btn-ghost">Talk to sales</Link>
            </div>
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
