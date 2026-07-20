import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { DemoBadge } from "@/components/marketing/demo-badge";
import { ImageSlot } from "@/components/marketing/image-slot";
import {
  creators,
  formatFollowers,
  formatViews,
  creatorInitials,
  CREATOR_NICHES,
} from "@/data/creators";
import { formatGBP } from "@/lib/currency";
import { pageMeta } from "@/lib/meta";
import { productStats, routes } from "@/lib/site";
import { flags } from "@/lib/flags";

export const metadata = pageMeta({
  title: "Viralyz",
  description:
    "Know how your content will do before you post it. Score every video out of 100 and build a record brands can trust.",
  path: "/",
});

const mosaicCreators = creators.slice(0, 4);
const gridCreators = creators;

export default function HomePage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <section className="hero">
          <div>
            <span className="kicker">The scored creator network</span>
            <h1 className="display">
              Know how your content will do. <em>Before</em> you post it.
            </h1>
            <p className="sub">
              Every video gets a score out of 100 and exactly what to fix. Post
              better content, build a record brands can trust, and get hired for
              it.
            </p>
            <div className="row">
              <Link href={routes.signup} className="btn btn-primary">
                Score your video, free
              </Link>
              <Link href={routes.creators} className="btn btn-ghost">
                Browse creators
              </Link>
            </div>
            <p className="fine">
              No signup to try it. Full breakdown free, 10 scores a month.
            </p>
          </div>
          <div className="mosaic">
            {mosaicCreators.map((c, i) => {
              const positions = [
                { left: "0", top: "0", transform: "rotate(-4deg)" },
                { left: "195px", top: "36px", transform: "rotate(3deg)" },
                { left: "5px", top: "210px", transform: "rotate(-2deg)" },
                { left: "190px", top: "250px", transform: "rotate(5deg)" },
              ];
              const pos = positions[i]!;
              return (
                <div
                  key={c.slug}
                  className="ccard"
                  style={{
                    left: pos.left,
                    top: pos.top,
                    transform: pos.transform,
                  }}
                >
                  <div className="face" style={{ background: c.face }}>
                    <span className="ini">{creatorInitials(c)}</span>
                  </div>
                  <div className="who">
                    <div>
                      <div className="name">
                        {c.name}{" "}
                        {c.demo && !flags.marketplaceLive ? (
                          <DemoBadge label="Example" />
                        ) : null}
                      </div>
                      <div className="niche">
                        {c.niche} · {formatFollowers(c.followers)}
                      </div>
                    </div>
                    <div className="miniring">
                      <svg width="40" height="40">
                        <circle
                          cx="20"
                          cy="20"
                          r="17"
                          fill="none"
                          stroke="var(--surface-3)"
                          strokeWidth="4"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r="17"
                          fill="none"
                          stroke="var(--score-good)"
                          strokeWidth="4"
                          strokeDasharray="106.8"
                          strokeDashoffset={106.8 - (106.8 * c.score) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="mn">{c.score}</span>
                    </div>
                  </div>
                  <div className="stat">
                    <span>Avg views</span>
                    <b>{formatViews(c.avgViews)}</b>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          <span>
            <b>Product preview</b>
          </span>
          <span>Hook scored: 52 → 74</span>
          <span>Thumbnail readable at feed size ✓</span>
          <span>Five areas scored in under 30s</span>
          <span>Caption rewrite ready</span>
          <span>Rescore after each fix</span>
          <span>
            <b>Product preview</b>
          </span>
          <span>Hook scored: 52 → 74</span>
          <span>Thumbnail readable at feed size ✓</span>
          <span>Five areas scored in under 30s</span>
          <span>Caption rewrite ready</span>
          <span>Rescore after each fix</span>
        </div>
      </div>

      <div className="wrap">
        <section className="trust">
          <div className="trust-copy">
            Founding creators onboarding now
            <span>Real accounts, real numbers from connected platforms</span>
          </div>
          <div className="logos-row">
            <span className="chip">TikTok</span>
            <span className="chip">YouTube</span>
            <span className="chip">Instagram</span>
            <span className="chip">X</span>
          </div>
        </section>

        <section className="categories">
          <div className="categories-head">
            <h2>Browse by category</h2>
            <Link href={routes.creators} className="signin">
              All categories →
            </Link>
          </div>
          <div className="cat-scroll">
            {CREATOR_NICHES.filter((n) =>
              ["Food", "Beauty", "Fitness", "Tech", "Travel", "Gaming"].includes(
                n,
              ),
            ).map((niche, i) => (
              <Link
                key={niche}
                href={`${routes.creators}?niche=${encodeURIComponent(niche)}`}
                className="cat-card"
              >
                <ImageSlot
                  id={`cat-${i + 1}`}
                  shape="rect"
                  label={`${niche} photo`}
                />
                <div className="label">{niche}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className="creators">
          <div className="creators-head">
            <h2>On the network right now</h2>
            <Link href={routes.creators} className="signin">
              Browse all creators →
            </Link>
          </div>
          {!flags.marketplaceLive ? (
            <div
              className="rounded-lg border p-4 text-sm"
              style={{
                borderColor: "var(--violet-soft)",
                background: "var(--violet-soft)",
                marginBottom: 20,
                borderRadius: 12,
                padding: 16,
                fontSize: 14,
              }}
            >
              These are example profiles showing how verified creator data will
              look. Real creators are onboarding now —{" "}
              <Link href={routes.forCreators} className="underline">
                join the founding roster
              </Link>
              .
            </div>
          ) : null}
          <div className="filter-row">
            <Link href={routes.creators} className="filter-pill active">
              All
            </Link>
            {["Food", "Beauty", "Fitness", "Tech", "Travel", "Gaming"].map(
              (n) => (
                <Link
                  key={n}
                  href={`${routes.creators}?niche=${encodeURIComponent(n)}`}
                  className="filter-pill"
                >
                  {n}
                </Link>
              ),
            )}
          </div>
          <div className="creators-grid">
            {gridCreators.map((c, i) => (
              <Link
                key={c.slug}
                href={`/kit/${c.slug}`}
                className="creator-card"
              >
                <div className="creator-photo">
                  <ImageSlot
                    id={`creator-photo-${i + 1}`}
                    shape="rect"
                    label="Content still"
                  />
                  <span className="plat">{c.platform}</span>
                </div>
                <div className="creator-body">
                  <div className="creator-top">
                    <div
                      className="kit-ava"
                      style={{
                        background: c.face,
                        width: 36,
                        height: 36,
                        fontSize: 12,
                      }}
                    >
                      {creatorInitials(c)}
                    </div>
                    <div>
                      <div className="creator-name">
                        {c.name}{" "}
                        {c.demo && !flags.marketplaceLive ? (
                          <DemoBadge />
                        ) : null}
                      </div>
                      <div className="creator-meta">
                        {c.niche} · {formatFollowers(c.followers)}
                      </div>
                    </div>
                  </div>
                  <div className="creator-stat">
                    <span className="num">{c.score}</span>
                    <span className="label">
                      Score · avg views {formatViews(c.avgViews)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="stats" aria-label="How Viralyz works">
          {productStats.map((s) => (
            <div className="stat" key={s.label}>
              <div className="num">{s.value}</div>
              <div className="label">{s.label}</div>
            </div>
          ))}
        </section>

        <section className="features" id="platform">
          <span className="kicker">How it works</span>
          <div className="features-grid">
            <div className="feature">
              <span className="num">01</span>
              <h3>Upload your content</h3>
              <p>
                Drop in a video or paste a link. In under 30 seconds you get a
                score out of 100.
              </p>
            </div>
            <div className="feature">
              <span className="num">02</span>
              <h3>See what to change</h3>
              <p>
                Every note comes with a fix and shows how many points it is
                worth. Apply it and score again.
              </p>
            </div>
            <div className="feature">
              <span className="num">03</span>
              <h3>Get hired on proof</h3>
              <p>
                Your history becomes a profile brands can see and book from —
                no self-reported numbers.
              </p>
            </div>
          </div>
        </section>

        <section className="split" id="brands">
          <div className="split-copy">
            <span className="kicker">What you get</span>
            <h2 className="split-title">
              Fix your content before anyone sees it
            </h2>
            <p className="note">
              Write stronger openings, test your thumbnails, and tidy your
              captions. Every suggestion shows how many points it adds to your
              score.
            </p>
            <ul>
              <li>
                <Link href="/platform/hook-lab">Hook Lab</Link> — ten opening
                lines for every idea, each one scored
              </li>
              <li>
                <Link href="/platform/thumbnail-studio">Thumbnail Studio</Link>{" "}
                — your thumbnail next to competitors, at real feed size
              </li>
              <li>
                <Link href="/platform/script-doctor">Script Doctor</Link> —
                line-by-line feedback, with a teleprompter built in
              </li>
            </ul>
          </div>
          <figure
            className="split-figure"
            style={{ border: "none", padding: "0" }}
          >
            <div className="panel">
              <div className="panel-head">
                <span>morning-routine-v2.mp4</span>
                <span>Score 77 → 89</span>
              </div>
              <div className="pbar">
                <span className="pl">Hook</span>
                <div className="pt">
                  <div
                    className="pf"
                    style={{ width: "52%", background: "var(--score-low)" }}
                  />
                </div>
                <span className="pv">52</span>
              </div>
              <div className="pbar">
                <span className="pl">Pacing</span>
                <div className="pt">
                  <div
                    className="pf"
                    style={{ width: "81%", background: "var(--score-good)" }}
                  />
                </div>
                <span className="pv">81</span>
              </div>
              <div className="pbar">
                <span className="pl">Caption</span>
                <div className="pt">
                  <div
                    className="pf"
                    style={{ width: "68%", background: "var(--score-mid)" }}
                  />
                </div>
                <span className="pv">68</span>
              </div>
              <div className="pbar">
                <span className="pl">Thumbnail</span>
                <div className="pt">
                  <div
                    className="pf"
                    style={{ width: "90%", background: "var(--score-good)" }}
                  />
                </div>
                <span className="pv">90</span>
              </div>
              <div className="fixrow">
                <span>
                  Fix: <b>lead with the result, not the setup</b>
                </span>
                <span className="pts">+12 pts</span>
              </div>
            </div>
          </figure>
        </section>

        <section className="split reverse" id="media-kit-preview">
          <figure
            className="split-figure"
            style={{ border: "none", padding: "0" }}
          >
            <div className="kit">
              <div className="kit-top">
                <div
                  className="kit-ava"
                  style={{ background: creators[0]!.face }}
                >
                  {creatorInitials(creators[0]!)}
                </div>
                <div>
                  <div className="kit-name">
                    {creators[0]!.name} <DemoBadge label="Example media kit" />
                  </div>
                  <div className="kit-verified">Example profile</div>
                </div>
              </div>
              <div className="kit-grid">
                <div className="kit-cell">
                  <div className="kv">
                    {formatFollowers(creators[0]!.followers)}
                  </div>
                  <div className="kl">Followers</div>
                </div>
                <div className="kit-cell">
                  <div className="kv">{creators[0]!.engagementPct}%</div>
                  <div className="kl">Engagement</div>
                </div>
                <div className="kit-cell">
                  <div className="kv">
                    {formatViews(creators[0]!.avgViews)}
                  </div>
                  <div className="kl">Avg views</div>
                </div>
                <div className="kit-cell">
                  <div className="kv">
                    {formatGBP(creators[0]!.suggestedRateGbp)}
                  </div>
                  <div className="kl">Suggested rate</div>
                </div>
              </div>
            </div>
          </figure>
          <div className="split-copy">
            <span className="kicker">Get discovered</span>
            <h2 className="split-title">A media kit that builds itself</h2>
            <p className="note">
              Numbers pulled from connected TikTok, YouTube and Instagram
              accounts — nothing self-reported. One link, and brands see the
              truth.
            </p>
            <ul>
              <li>Verified numbers, taken directly from the platforms</li>
              <li>A suggested rate card based on creators like you</li>
              <li>One link to share: viralyz.com/kit/yourname</li>
            </ul>
          </div>
        </section>

        <section className="sides" id="pricing">
          <span className="kicker">Two sides, one network</span>
          <h2>Creators bring the proof. Brands bring the work.</h2>
          <div className="sides-grid">
            <div className="side-card">
              <span className="tag">For creators</span>
              <h3>Grow your score. Get discovered.</h3>
              <ul>
                <li>Ten free scores a month on your own content</li>
                <li>A profile brands can search when the marketplace opens</li>
                <li>Paid briefs matched to your track record at launch</li>
              </ul>
              <Link href={routes.signup} className="btn btn-ghost">
                Start scoring free
              </Link>
            </div>
            <div className="side-card">
              <span className="tag">For brands</span>
              <h3>Hire creators who can prove it.</h3>
              <ul>
                <li>Search profiles by real performance</li>
                <li>See how content will score before it goes live</li>
                <li>Pay safely through the platform at launch</li>
              </ul>
              <Link href={routes.forBrands} className="btn btn-ghost">
                See how it works
              </Link>
            </div>
          </div>
        </section>

        <section className="close">
          <div className="patch">
            <h3>Your next post already has a score</h3>
            <p className="sub">
              Find out what it is, and what it could be. No card required to
              start.
            </p>
            <div className="row">
              <Link href={routes.signup} className="btn btn-primary">
                Score my first video
              </Link>
              <Link href={routes.contact} className="btn btn-ghost">
                Talk to sales
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
