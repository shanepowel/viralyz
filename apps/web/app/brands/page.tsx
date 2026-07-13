import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "For brands",
  description:
    "Hire creators who can prove it. Verified track records and score gates before content goes live.",
};

const WAITLIST = "mailto:hello@viralyz.com?subject=Brand%20waitlist";

export default function BrandsPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <span className="eyebrow">For brands</span>
          <h1>Hire creators who can prove it.</h1>
          <p>
            Follower counts do not tell you if a campaign will work. On Viralyz,
            every creator has a verified track record, and you can see how the
            content scores before it ever goes live.
          </p>
          <div className="hero-actions" style={{ marginTop: 28 }}>
            <Link className="btn btn-violet btn-lg" href={WAITLIST}>
              Join the brand waitlist
            </Link>
          </div>
        </div>
      </div>

      <section style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="band">
            <div>
              <span className="eyebrow">Find</span>
              <h3>Search by proof, not promises</h3>
              <p>
                Every profile shows numbers pulled straight from the platforms.
                Audience, engagement, score history and how reliably they
                deliver. Nothing self-reported.
              </p>
              <ul>
                <li>
                  <span className="tick">✓</span>Filter by niche, audience,
                  location and budget
                </li>
                <li>
                  <span className="tick">✓</span>See each creator&apos;s real
                  score trend, not a screenshot
                </li>
                <li>
                  <span className="tick">✓</span>Delivery record shown on every
                  profile
                </li>
              </ul>
            </div>
            <div className="band-visual">
              <div className="kit">
                <div className="kit-top">
                  <div
                    className="kit-ava"
                    style={{
                      background: "linear-gradient(135deg,#56CCF2,#2F80ED)",
                    }}
                  >
                    AD
                  </div>
                  <div>
                    <div className="kit-name">Amara D. · @amaraglow</div>
                    <span className="kit-verified">✓ Viralyz Verified</span>
                  </div>
                </div>
                <div className="kit-grid">
                  <div className="kit-cell">
                    <div className="kv" style={{ color: "var(--s90)" }}>
                      94
                    </div>
                    <div className="kl">Score</div>
                  </div>
                  <div className="kit-cell">
                    <div className="kv">1.2M</div>
                    <div className="kl">Followers</div>
                  </div>
                  <div className="kit-cell">
                    <div className="kv">100%</div>
                    <div className="kl">On time</div>
                  </div>
                  <div className="kit-cell">
                    <div className="kv">91%</div>
                    <div className="kl">Predictions right</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="band flip">
            <div>
              <span className="eyebrow">Run</span>
              <h3>See the score before the post goes live</h3>
              <p>
                This is the part nobody else can offer. Campaign content runs
                through our scoring engine before it posts. You can even set a
                minimum score in the brief, so quality is agreed up front, not
                argued about later.
              </p>
              <ul>
                <li>
                  <span className="tick">✓</span>Set a minimum score for
                  deliverables in your brief
                </li>
                <li>
                  <span className="tick">✓</span>Approve content in the platform,
                  with a clear revision count
                </li>
                <li>
                  <span className="tick">✓</span>We check the live post matches
                  what you approved
                </li>
              </ul>
            </div>
            <div className="band-visual">
              <div className="panel">
                <div className="panel-head">
                  <span>Campaign: Spring launch</span>
                  <span
                    className="mono"
                    style={{ color: "var(--violet-deep)", fontWeight: 600 }}
                  >
                    SCORE GATE: 75
                  </span>
                </div>
                <div className="pbar">
                  <span className="pl">Draft 1</span>
                  <div className="pt">
                    <div
                      className="pf"
                      style={{ width: "68%", background: "var(--s50)" }}
                    />
                  </div>
                  <span className="pv">68</span>
                </div>
                <div className="pbar">
                  <span className="pl">Draft 2</span>
                  <div className="pt">
                    <div
                      className="pf"
                      style={{ width: "84%", background: "var(--s90)" }}
                    />
                  </div>
                  <span className="pv">84</span>
                </div>
                <div className="fixrow" style={{ background: "var(--s90-soft)" }}>
                  <span>
                    <b>Draft 2 cleared the gate.</b> Ready for your approval.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="band">
            <div>
              <span className="eyebrow">Pay</span>
              <h3>Money held safely until the work is done</h3>
              <p>
                Your budget sits in escrow and is released in stages: when you
                approve the content, when it goes live, and when the results are
                in. Creators get paid within three days of each stage. Everyone
                stays happy.
              </p>
              <ul>
                <li>
                  <span className="tick">✓</span>Payment released in stages you
                  approve
                </li>
                <li>
                  <span className="tick">✓</span>Flat fee, performance based, or
                  a mix of both
                </li>
                <li>
                  <span className="tick">✓</span>Ad disclosure rules checked
                  automatically on every post
                </li>
              </ul>
            </div>
            <div className="band-visual">
              <div className="cal">
                <div className="cal-row">
                  <span className="cal-day">STAGE 1</span>
                  <div className="cal-item">
                    <span>Content approved</span>
                    <span className="sc" style={{ color: "var(--s90)" }}>
                      ✓ Paid
                    </span>
                  </div>
                </div>
                <div className="cal-row">
                  <span className="cal-day">STAGE 2</span>
                  <div className="cal-item">
                    <span>Post is live</span>
                    <span className="sc" style={{ color: "var(--s90)" }}>
                      ✓ Paid
                    </span>
                  </div>
                </div>
                <div className="cal-row">
                  <span className="cal-day">STAGE 3</span>
                  <div className="cal-item peak">
                    <span>Results window closes</span>
                    <span className="sc" style={{ color: "var(--violet-deep)" }}>
                      14 days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FinalCta
        title="Stop buying reach. Start buying results."
        subtitle="The brand side opens soon. Founding brands get six months with no platform fees."
        cta="Join the waitlist"
        href={WAITLIST}
      />
    </MarketingShell>
  );
}
