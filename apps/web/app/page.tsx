import Link from "next/link";
import { getPublicAppUrl } from "@repo/config";
import { CreatorMosaic } from "@/components/marketing/creator-mosaic";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";

const TICKER = [
  <span key="a">
    <b>2.1 million</b> videos scored
  </span>,
  <span key="b">
    views after fixes <b className="tick-up">▲ 4.2× higher</b>
  </span>,
  <span key="c">
    works with <b>TikTok · YouTube · Instagram · X</b>
  </span>,
  <span key="d">
    results in <b>under 30 seconds</b>
  </span>,
  <span key="e">
    we show our accuracy: <b>82%</b>
  </span>,
];

export default function HomePage() {
  const appUrl = getPublicAppUrl();

  return (
    <MarketingShell>
      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">The scored creator network</span>
            <h1>
              Know how your content will do. <em>Before</em> you post it.
            </h1>
            <p className="lede">
              Viralyz gives every video a score out of 100 and tells you exactly
              what to fix. Post better content, build a track record brands can
              trust, and get hired for it.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-violet btn-lg" href={appUrl}>
                Score your content free
              </Link>
              <Link className="btn btn-outline btn-lg" href="/brands">
                I want to hire creators
              </Link>
            </div>
            <p className="hero-note">
              <b>Free to start.</b> 10 scores a month. No card needed.
            </p>
          </div>
          <CreatorMosaic />
        </div>
      </header>

      <div className="ticker" aria-hidden>
        <div className="ticker-track">
          {[...TICKER, ...TICKER]}
        </div>
      </div>

      <section>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">How it works</span>
            <h2>Four steps. From guessing to getting paid.</h2>
            <p>
              Most creators post and hope. On Viralyz, every post makes you
              better and builds your record.
            </p>
          </div>
          <div className="journey">
            <div className="jstep">
              <div className="num">01</div>
              <span className="jtag">Score</span>
              <h3>Upload your content</h3>
              <p>
                Drop in a video or paste a link. In under 30 seconds you get a
                score out of 100.
              </p>
            </div>
            <div className="jstep">
              <div className="num">02</div>
              <span className="jtag">Fix</span>
              <h3>See what to change</h3>
              <p>
                Every problem comes with a fix and shows how many points it is
                worth. Apply it and score again.
              </p>
            </div>
            <div className="jstep">
              <div className="num">03</div>
              <span className="jtag">Learn</span>
              <h3>It learns your audience</h3>
              <p>
                We track how your posts really perform. Your scores get sharper
                with every post.
              </p>
            </div>
            <div className="jstep">
              <div className="num">04</div>
              <span className="jtag">Earn</span>
              <h3>Get hired on proof</h3>
              <p>
                Your history becomes a verified profile. Brands can see you
                deliver, so they book you.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">What you get</span>
            <h2>Tools that make your content better. A score that proves it.</h2>
          </div>

          <div className="band">
            <div>
              <span className="eyebrow">Create</span>
              <h3>Fix your content before anyone sees it</h3>
              <p>
                Write stronger openings, test your thumbnails, and tidy your
                captions. Every suggestion shows how many points it adds to your
                score.
              </p>
              <ul>
                <li>
                  <span className="tick">✓</span>Ten opening lines for every
                  idea, each one scored
                </li>
                <li>
                  <span className="tick">✓</span>See your thumbnail next to
                  competitors, at real feed size
                </li>
                <li>
                  <span className="tick">✓</span>Script feedback line by line,
                  with a teleprompter built in
                </li>
              </ul>
            </div>
            <div className="band-visual">
              <div className="panel">
                <div className="panel-head">
                  <span>morning-routine-v2.mp4</span>
                  <span
                    className="mono"
                    style={{ color: "var(--s90)", fontWeight: 600 }}
                  >
                    READY
                  </span>
                </div>
                {[
                  ["Opening", "95%", "19/20", "var(--s90)"],
                  ["Visuals", "90%", "18/20", "var(--s90)"],
                  ["Pacing", "85%", "17/20", "var(--s70)"],
                  ["Words", "90%", "18/20", "var(--s90)"],
                  ["Timing", "85%", "17/20", "var(--s70)"],
                ].map(([label, width, pts, color]) => (
                  <div className="pbar" key={label}>
                    <span className="pl">{label}</span>
                    <div className="pt">
                      <div
                        className="pf"
                        style={{ width, background: color }}
                      />
                    </div>
                    <span className="pv">{pts}</span>
                  </div>
                ))}
                <div className="fixrow">
                  <span>
                    <b>One fix left:</b> trim the pause at 0:41
                  </span>
                  <span className="pts">+3</span>
                </div>
              </div>
            </div>
          </div>

          <div className="band flip">
            <div>
              <span className="eyebrow">Grow</span>
              <h3>Post when your audience is actually watching</h3>
              <p>
                The calendar learns your audience&apos;s habits and schedules
                your posts into the best slots. It also shows you what is
                trending in your niche, and when a trend is dying.
              </p>
              <ul>
                <li>
                  <span className="tick">✓</span>Best posting times, learned from
                  your real results
                </li>
                <li>
                  <span className="tick">✓</span>Trend alerts that tell you when
                  to jump in and when to skip
                </li>
                <li>
                  <span className="tick">✓</span>See why competitor posts worked,
                  then make your own version
                </li>
              </ul>
            </div>
            <div className="band-visual">
              <div className="cal">
                {[
                  ["TUE 18:00", "Kitchen hacks pt.3", "87", true, "var(--s90)"],
                  ["WED 12:30", "Q&A reel", "72", false, "var(--s70)"],
                  ["THU 18:00", "Brand collab draft", "91", true, "var(--s90)"],
                  ["SAT 10:00", "Behind the scenes", "58", false, "var(--s50)"],
                ].map(([day, title, score, peak, color]) => (
                  <div className="cal-row" key={String(day)}>
                    <span className="cal-day">{day}</span>
                    <div className={`cal-item${peak ? " peak" : ""}`}>
                      <span>{title}</span>
                      <span className="sc" style={{ color: String(color) }}>
                        {score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="band">
            <div>
              <span className="eyebrow">Earn</span>
              <h3>A media kit that builds itself</h3>
              <p>
                Your profile fills with real numbers pulled straight from the
                platforms. Nothing self-reported, nothing inflated. Share one
                link and brands see the truth.
              </p>
              <ul>
                <li>
                  <span className="tick">✓</span>Verified numbers, taken directly
                  from TikTok, YouTube and Instagram
                </li>
                <li>
                  <span className="tick">✓</span>A suggested rate card based on
                  creators like you
                </li>
                <li>
                  <span className="tick">✓</span>One link to share:
                  viralyz.com/kit/yourname
                </li>
              </ul>
            </div>
            <div className="band-visual">
              <div className="kit">
                <div className="kit-top">
                  <div className="kit-ava">MR</div>
                  <div>
                    <div className="kit-name">Maya R. · @mayacooks</div>
                    <span className="kit-verified">✓ Viralyz Verified</span>
                  </div>
                </div>
                <div className="kit-grid">
                  <div className="kit-cell">
                    <div className="kv" style={{ color: "var(--s90)" }}>
                      89
                    </div>
                    <div className="kl">Score</div>
                  </div>
                  <div className="kit-cell">
                    <div className="kv">214K</div>
                    <div className="kl">Followers</div>
                  </div>
                  <div className="kit-cell">
                    <div className="kv">7.4%</div>
                    <div className="kl">Engagement</div>
                  </div>
                  <div className="kit-cell">
                    <div className="kv tick-up">▲ +11</div>
                    <div className="kl">Last 90 days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Two sides, one network</span>
            <h2>Creators bring the proof. Brands bring the work.</h2>
          </div>
          <div className="split">
            <div className="split-card creators">
              <span className="eyebrow">For creators</span>
              <h3>Grow your score. Get discovered.</h3>
              <p>
                Use the tools free. Build a verified record. Let brand work come
                to you instead of chasing it.
              </p>
              <Link
                className="btn"
                style={{ background: "#fff", color: "var(--ink)" }}
                href={appUrl}
              >
                Start scoring free
              </Link>
              <span className="ghost-num">01</span>
            </div>
            <div className="split-card brands">
              <span className="eyebrow">For brands</span>
              <h3>Hire creators who can prove it.</h3>
              <p>
                Search verified profiles. See how content will score before it
                goes live. Pay safely through the platform.
              </p>
              <Link className="btn btn-violet" href="/brands">
                See how it works
              </Link>
              <span className="ghost-num">02</span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Results</span>
            <h2>The numbers behave when the content does.</h2>
          </div>
          <div className="proof-band">
            <div className="proof-cell">
              <div className="pnum" style={{ color: "var(--s30)" }}>
                34{" "}
                <span style={{ fontSize: 22, color: "var(--ink-3)" }}>→</span>{" "}
                <span style={{ color: "var(--s90)" }}>89</span>
              </div>
              <div className="plab">One video. One afternoon of fixes.</div>
            </div>
            <div className="proof-cell">
              <div className="pnum">368×</div>
              <div className="plab">
                More views on that video: 2.3K became 847K
              </div>
            </div>
            <div className="proof-cell">
              <div className="pnum">82%</div>
              <div className="plab">
                How often our predictions are right. Shown on every profile.
              </div>
            </div>
          </div>
          <div className="proof-quote">
            <div className="pq-ava">MR</div>
            <div>
              <blockquote>
                &ldquo;I stopped guessing. The score showed me my openings were
                the problem. Two weeks later a brand booked me straight from my
                media kit.&rdquo;
              </blockquote>
              <cite>
                <b>Maya R.</b> · Food creator, 214K followers · Verified since
                2025
              </cite>
            </div>
          </div>
        </div>
      </section>

      <FinalCta
        title="Your next post already has a score."
        subtitle="Find out what it is. And what it could be."
        cta="Score your first video free"
      />
    </MarketingShell>
  );
}
