import type { Metadata } from "next";
import Link from "next/link";
import { getPublicAppPath, getPublicAppUrl } from "@repo/config";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { ImageSlot } from "@/components/marketing/image-slot";

export const metadata: Metadata = {
  title: "For creators",
  description: "Score your content, build a verified profile, and get hired on proof.",
};

export default function Page() {
  const appUrl = getPublicAppUrl();

  return (
    <MarketingShell>
      <div className="wrap">
        <section className="hero">
          <div>
            <p className="crumb"><Link href="/">Home</Link> / For creators</p>
            <span className="kicker">For creators</span>
            <h1 className="display">Grow your score. Get booked on proof.</h1>
            <p className="sub">Score every video before you post, fix what's holding it back, and turn your track record into a media kit brands trust.</p>
            <div className="row">
              <Link href={appUrl} className="btn btn-primary">Start scoring free</Link>
              <Link href="/kit/mayacooks" className="btn btn-ghost">See a sample media kit</Link>
            </div>
            <p className="fine">10 free scores a month, no card required.</p>
          </div>
          <div className="panel">
            <div className="panel-head"><span>morning-routine-v2.mp4</span><span>Score 77 → 89</span></div>
            <div className="pbar"><span className="pl">Hook</span><div className="pt"><div className="pf" style={{width: "52%", background: "var(--score-low)"}}></div></div><span className="pv">52</span></div>
            <div className="pbar"><span className="pl">Pacing</span><div className="pt"><div className="pf" style={{width: "81%", background: "var(--score-good)"}}></div></div><span className="pv">81</span></div>
            <div className="pbar"><span className="pl">Caption</span><div className="pt"><div className="pf" style={{width: "68%", background: "var(--score-mid)"}}></div></div><span className="pv">68</span></div>
            <div className="pbar"><span className="pl">Thumbnail</span><div className="pt"><div className="pf" style={{width: "90%", background: "var(--score-good)"}}></div></div><span className="pv">90</span></div>
            <div className="fixrow"><span>Fix: <b>lead with the result, not the setup</b></span><span className="pts">+12 pts</span></div>
          </div>
        </section>

        <section className="band" id="tools">
          <span className="kicker">Everything you need to grow</span>
          <div className="band-grid">
            <Link href={getPublicAppPath("/hook-lab")} className="band-card"><div className="ico2">Hk</div><h4>Hook tester</h4><p>Ten opening lines for your idea, ranked by predicted score.</p></Link>
            <Link href={getPublicAppPath("/caption-studio")} className="band-card"><div className="ico2">Tp</div><h4>Teleprompter</h4><p>Script feedback line by line while you record.</p></Link>
            <Link href={getPublicAppPath("/thumbnails")} className="band-card"><div className="ico2">Th</div><h4>Thumbnail tests</h4><p>See your thumbnail next to competitors at real feed size.</p></Link>
            <Link href="/kit/mayacooks" className="band-card"><div className="ico2">Mk</div><h4>Media kit builder</h4><p>A verified one-link profile brands can check in seconds.</p></Link>
            <Link href="/tools/engagement-calculator" className="band-card"><div className="ico2">Rt</div><h4>Rate calculator</h4><p>Suggested rates based on creators like you in your niche.</p></Link>
            <Link href="/blog" className="band-card"><div className="ico2">Ac</div><h4>Creator academy</h4><p>Short courses on what actually moves your score.</p></Link>
          </div>
        </section>

        <section className="split" id="profile">
          <div className="split-copy">
            <span className="kicker">Get discovered</span>
            <h2 className="split-title">A media kit that builds itself</h2>
            <p className="note">Real numbers pulled straight from TikTok, YouTube and Instagram. Nothing self-reported. One link, and brands see the truth.</p>
            <ul>
              <li>Verified numbers, taken directly from the platforms</li>
              <li>A suggested rate card based on creators like you</li>
              <li>One link to share: viralyz.com/kit/yourname</li>
            </ul>
          </div>
          <figure className="split-figure" style={{border: "none", padding: "0"}}>
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
          </figure>
        </section>

        <section className="quotes" id="stories">
          <h2>What creators say</h2>
          <div className="quotes-grid">
            <div className="quote-card">
              <blockquote>"I stopped guessing. The score showed me my openings were the problem. Two weeks later a brand booked me straight from my media kit."</blockquote>
              <figcaption><ImageSlot id="fc-quote-1" shape="circle" label="Photo" /><div className="who"><strong>Maya R.</strong><span>Food · 214K · Verified 2025</span></div></figcaption>
            </div>
            <div className="quote-card">
              <blockquote>"Verified numbers changed everything. Brands stopped asking me to prove my views. They could just see them."</blockquote>
              <figcaption><ImageSlot id="fc-quote-2" shape="circle" label="Photo" /><div className="who"><strong>Amara D.</strong><span>Beauty · 1.2M · Verified 2024</span></div></figcaption>
            </div>
            <div className="quote-card">
              <blockquote>"The rate calculator gave me a number I could actually stand behind in negotiations."</blockquote>
              <figcaption><ImageSlot id="fc-quote-3" shape="circle" label="Photo" /><div className="who"><strong>Owen G.</strong><span>Food · 128K</span></div></figcaption>
            </div>
          </div>
        </section>

        <section className="close">
          <div className="patch">
            <h3>Your next post already has a score</h3>
            <p className="sub">Find out what it is, and what it could be. No card required to start.</p>
            <div className="row">
              <Link href={appUrl} className="btn btn-primary">Score my first video</Link>
              <Link href="/pricing" className="btn btn-ghost">Browse pricing</Link>
            </div>
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
