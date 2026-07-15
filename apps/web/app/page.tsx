import Link from "next/link";
import { getPublicAppUrl } from "@repo/config";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { ImageSlot } from "@/components/marketing/image-slot";

export default function HomePage() {
  const appUrl = getPublicAppUrl();

  return (
    <MarketingShell>
      <div className="wrap">
        <section className="hero">
          <div>
            <span className="kicker">The scored creator network</span>
            <h1 className="display">Know how your content will do. <em>Before</em> you post it.</h1>
            <p className="sub">Every video gets a score out of 100 and exactly what to fix. Post better content, build a track record brands can trust, and get hired for it.</p>
            <div className="row">
              <Link href={appUrl} className="btn btn-primary">Score your video, free</Link>
              <Link href="/creators" className="btn btn-ghost">Browse creators</Link>
            </div>
            <p className="fine">No signup to try it. Full breakdown free, 10 scores a month.</p>
          </div>
          <div className="mosaic">
            <div className="ccard" style={{left: "0", top: "0", transform: "rotate(-4deg)"}}>
              <div className="face" style={{background: "linear-gradient(135deg,#F2994A,#EB5757)"}}><span className="ini">MR</span></div>
              <div className="who"><div><div className="name">Maya R.</div><div className="niche">Food · 214K</div></div>
                <div className="miniring"><svg width="40" height="40"><circle cx="20" cy="20" r="17" fill="none" stroke="var(--surface-3)" strokeWidth="4"></circle><circle cx="20" cy="20" r="17" fill="none" stroke="var(--score-good)" strokeWidth="4" strokeDasharray="106.8" strokeDashoffset="11.8" strokeLinecap="round"></circle></svg><span className="mn">89</span></div>
              </div>
              <div className="stat"><span>Avg views</span><b>412K</b></div>
            </div>
            <div className="ccard" style={{left: "195px", top: "36px", transform: "rotate(3deg)"}}>
              <div className="face" style={{background: "linear-gradient(135deg,#56CCF2,#2F80ED)"}}><span className="ini">LB</span></div>
              <div className="who"><div><div className="name">Leo B.</div><div className="niche">Gaming · 780K</div></div>
                <div className="miniring"><svg width="40" height="40"><circle cx="20" cy="20" r="17" fill="none" stroke="var(--surface-3)" strokeWidth="4"></circle><circle cx="20" cy="20" r="17" fill="none" stroke="var(--score-good)" strokeWidth="4" strokeDasharray="106.8" strokeDashoffset="19.9" strokeLinecap="round"></circle></svg><span className="mn">82</span></div>
              </div>
              <div className="stat"><span>This month</span><b>▲ +3</b></div>
            </div>
            <div className="ccard analyzing" style={{left: "5px", top: "210px", transform: "rotate(-2deg)"}}>
              <div className="scan" />
              <div className="face" style={{background: "linear-gradient(135deg,#9B51E0,#6C4CF1)"}}><span className="ini">JT</span></div>
              <div className="who"><div><div className="name">Jordan T.</div><div className="niche">Fitness · 88K</div></div></div>
              <div className="status-line">Analyzing hook &amp; pacing…</div>
            </div>
            <div className="ccard" style={{left: "190px", top: "250px", transform: "rotate(5deg)"}}>
              <div className="face" style={{background: "linear-gradient(135deg,#0FA968,#56CCF2)"}}><span className="ini">PN</span></div>
              <div className="who"><div><div className="name">Priya N.</div><div className="niche">Travel · 512K</div></div>
                <div className="miniring"><svg width="40" height="40"><circle cx="20" cy="20" r="17" fill="none" stroke="var(--surface-3)" strokeWidth="4"></circle><circle cx="20" cy="20" r="17" fill="none" stroke="var(--score-good)" strokeWidth="4" strokeDasharray="106.8" strokeDashoffset="9.6" strokeLinecap="round"></circle></svg><span className="mn">91</span></div>
              </div>
              <div className="stat"><span>Avg views</span><b>300K</b></div>
            </div>
            <div className="badge-float" style={{left: "190px", top: "450px"}}><span className="dot"></span>Amara D. just booked a brand deal</div>
          </div>
        </section>

        <section className="logostrip">
          <p className="lbl">Trusted by teams at</p>
          <div className="logostrip-row">
            <ImageSlot id="logo-1" shape="rect" label="Logo" />
            <ImageSlot id="logo-2" shape="rect" label="Logo" />
            <ImageSlot id="logo-3" shape="rect" label="Logo" />
            <ImageSlot id="logo-4" shape="rect" label="Logo" />
            <ImageSlot id="logo-5" shape="rect" label="Logo" />
            <ImageSlot id="logo-6" shape="rect" label="Logo" />
          </div>
        </section>
      </div>
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          <span><b>Maya R.</b> scored 89 <span className="tick-up">▲</span></span>
          <span><b>Sam K.</b> scored 74 <span className="tick-up">▲ +6</span></span>
          <span><b>2,140</b> videos scored today</span>
          <span><b>Amara D.</b> booked a brand deal</span>
          <span><b>Leo B.</b> scored 82 <span className="tick-up">▲ +3</span></span>
          <span><b>Priya N.</b> scored 91</span>
          <span><b>Owen G.</b> media kit viewed by 3 brands</span>
          <span><b>Maya R.</b> scored 89 <span className="tick-up">▲</span></span>
          <span><b>Sam K.</b> scored 74 <span className="tick-up">▲ +6</span></span>
          <span><b>2,140</b> videos scored today</span>
          <span><b>Amara D.</b> booked a brand deal</span>
          <span><b>Leo B.</b> scored 82 <span className="tick-up">▲ +3</span></span>
          <span><b>Priya N.</b> scored 91</span>
          <span><b>Owen G.</b> media kit viewed by 3 brands</span>
        </div>
      </div>
      <div className="wrap">


        <section className="trust">
          <div className="trust-avatars">
            <ImageSlot id="avatar-1" shape="circle" label="Creator photo" />
            <ImageSlot id="avatar-2" shape="circle" label="Creator photo" />
            <ImageSlot id="avatar-3" shape="circle" label="Creator photo" />
            <ImageSlot id="avatar-4" shape="circle" label="Creator photo" />
          </div>
          <div className="trust-copy">2,140 creators scored today<span>Real accounts, real numbers, checked hourly</span></div>
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
            <a href="/creators" className="signin">All categories →</a>
          </div>
          <div className="cat-scroll">
            <div className="cat-card"><ImageSlot id="cat-1" shape="rect" label="Food photo" /><div className="label">Food<span>4,120 creators</span></div></div>
            <div className="cat-card"><ImageSlot id="cat-2" shape="rect" label="Beauty photo" /><div className="label">Beauty<span>6,340 creators</span></div></div>
            <div className="cat-card"><ImageSlot id="cat-3" shape="rect" label="Fitness photo" /><div className="label">Fitness<span>3,780 creators</span></div></div>
            <div className="cat-card"><ImageSlot id="cat-4" shape="rect" label="Tech photo" /><div className="label">Tech<span>2,210 creators</span></div></div>
            <div className="cat-card"><ImageSlot id="cat-5" shape="rect" label="Travel photo" /><div className="label">Travel<span>2,960 creators</span></div></div>
            <div className="cat-card"><ImageSlot id="cat-6" shape="rect" label="Gaming photo" /><div className="label">Gaming<span>1,830 creators</span></div></div>
          </div>
        </section>

        <section className="creators">
          <div className="creators-head">
            <h2>On the network right now</h2>
            <a href="/creators" className="signin">Browse all creators →</a>
          </div>
          <div className="filter-row">
            <button type="button" className="filter-pill active">All</button>
            <button type="button" className="filter-pill">Food</button>
            <button type="button" className="filter-pill">Beauty</button>
            <button type="button" className="filter-pill">Fitness</button>
            <button type="button" className="filter-pill">Tech</button>
            <button type="button" className="filter-pill">Travel</button>
            <button type="button" className="filter-pill">Gaming</button>
          </div>
          <div className="creators-grid">
            <div className="creator-card">
              <div className="creator-photo"><ImageSlot id="creator-photo-1" shape="rect" label="Content still" /><span className="plat">TikTok</span></div>
              <div className="creator-body">
                <div className="creator-top"><ImageSlot id="creator-1" shape="circle" label="Photo" /><div><div className="creator-name">Maya R.</div><div className="creator-meta">Food · 214K</div></div></div>
                <div className="creator-stat"><span className="num">89</span><span className="label">Score · avg views 412K</span></div>
              </div>
            </div>
            <div className="creator-card">
              <div className="creator-photo"><ImageSlot id="creator-photo-2" shape="rect" label="Content still" /><span className="plat">Instagram</span></div>
              <div className="creator-body">
                <div className="creator-top"><ImageSlot id="creator-2" shape="circle" label="Photo" /><div><div className="creator-name">Jordan T.</div><div className="creator-meta">Fitness · 88K</div></div></div>
                <div className="creator-stat"><span className="num">···</span><span className="label">Checking the hook</span></div>
              </div>
            </div>
            <div className="creator-card">
              <div className="creator-photo"><ImageSlot id="creator-photo-3" shape="rect" label="Content still" /><span className="plat">YouTube</span></div>
              <div className="creator-body">
                <div className="creator-top"><ImageSlot id="creator-3" shape="circle" label="Photo" /><div><div className="creator-name">Amara D.</div><div className="creator-meta">Beauty · 1.2M</div></div></div>
                <div className="creator-stat"><span className="num">94</span><span className="label">Predictions right 91%</span></div>
              </div>
            </div>
            <div className="creator-card">
              <div className="creator-photo"><ImageSlot id="creator-photo-4" shape="rect" label="Content still" /><span className="plat">X</span></div>
              <div className="creator-body">
                <div className="creator-top"><ImageSlot id="creator-4" shape="circle" label="Photo" /><div><div className="creator-name">Sam K.</div><div className="creator-meta">Tech · 340K</div></div></div>
                <div className="creator-stat"><span className="num">74</span><span className="label">This month ▲ +6</span></div>
              </div>
            </div>
            <div className="creator-card">
              <div className="creator-photo"><ImageSlot id="creator-photo-5" shape="rect" label="Content still" /><span className="plat">TikTok</span></div>
              <div className="creator-body">
                <div className="creator-top"><ImageSlot id="creator-5" shape="circle" label="Photo" /><div><div className="creator-name">Priya N.</div><div className="creator-meta">Travel · 512K</div></div></div>
                <div className="creator-stat"><span className="num">91</span><span className="label">Score · avg views 300K</span></div>
              </div>
            </div>
            <div className="creator-card">
              <div className="creator-photo"><ImageSlot id="creator-photo-6" shape="rect" label="Content still" /><span className="plat">YouTube</span></div>
              <div className="creator-body">
                <div className="creator-top"><ImageSlot id="creator-6" shape="circle" label="Photo" /><div><div className="creator-name">Leo B.</div><div className="creator-meta">Gaming · 780K</div></div></div>
                <div className="creator-stat"><span className="num">82</span><span className="label">This month ▲ +3</span></div>
              </div>
            </div>
            <div className="creator-card">
              <div className="creator-photo"><ImageSlot id="creator-photo-7" shape="rect" label="Content still" /><span className="plat">Instagram</span></div>
              <div className="creator-body">
                <div className="creator-top"><ImageSlot id="creator-7" shape="circle" label="Photo" /><div><div className="creator-name">Nina F.</div><div className="creator-meta">Beauty · 96K</div></div></div>
                <div className="creator-stat"><span className="num">77</span><span className="label">Score · avg views 60K</span></div>
              </div>
            </div>
            <div className="creator-card">
              <div className="creator-photo"><ImageSlot id="creator-photo-8" shape="rect" label="Content still" /><span className="plat">TikTok</span></div>
              <div className="creator-body">
                <div className="creator-top"><ImageSlot id="creator-8" shape="circle" label="Photo" /><div><div className="creator-name">Owen G.</div><div className="creator-meta">Food · 128K</div></div></div>
                <div className="creator-stat"><span className="num">86</span><span className="label">Score · avg views 190K</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="stats" aria-label="Viralyz, by the numbers">
          <div className="stat"><div className="num">2.1M</div><div className="label">Videos scored</div></div>
          <div className="stat"><div className="num">4.2×</div><div className="label">More views after fixes</div></div>
          <div className="stat"><div className="num">82%</div><div className="label">Prediction accuracy</div></div>
          <div className="stat"><div className="num">&lt;30s</div><div className="label">To your first score</div></div>
        </section>

        <section className="features" id="platform">
          <span className="kicker">How it works</span>
          <div className="features-grid">
            <div className="feature">
              <span className="num">01</span>
              <h3>Upload your content</h3>
              <p>Drop in a video or paste a link. In under 30 seconds you get a score out of 100.</p>
            </div>
            <div className="feature">
              <span className="num">02</span>
              <h3>See what to change</h3>
              <p>Every note comes with a fix and shows how many points it's worth. Apply it and score again.</p>
            </div>
            <div className="feature">
              <span className="num">03</span>
              <h3>Get hired on proof</h3>
              <p>Your history becomes a verified profile brands can see and book from  -  no self-reported numbers.</p>
            </div>
          </div>
        </section>

        <section className="split" id="brands">
          <div className="split-copy">
            <span className="kicker">What you get</span>
            <h2 className="split-title">Fix your content before anyone sees it</h2>
            <p className="note">Write stronger openings, test your thumbnails, and tidy your captions. Every suggestion shows how many points it adds to your score.</p>
            <ul>
              <li>Ten opening lines for every idea, each one scored</li>
              <li>Your thumbnail next to competitors, at real feed size</li>
              <li>Script feedback line by line, with a teleprompter built in</li>
            </ul>
          </div>
          <figure className="split-figure" style={{border: "none", padding: "0"}}>
            <div className="panel">
              <div className="panel-head"><span>morning-routine-v2.mp4</span><span>Score 77 → 89</span></div>
              <div className="pbar"><span className="pl">Hook</span><div className="pt"><div className="pf" style={{width: "52%", background: "var(--score-low)"}}></div></div><span className="pv">52</span></div>
              <div className="pbar"><span className="pl">Pacing</span><div className="pt"><div className="pf" style={{width: "81%", background: "var(--score-good)"}}></div></div><span className="pv">81</span></div>
              <div className="pbar"><span className="pl">Caption</span><div className="pt"><div className="pf" style={{width: "68%", background: "var(--score-mid)"}}></div></div><span className="pv">68</span></div>
              <div className="pbar"><span className="pl">Thumbnail</span><div className="pt"><div className="pf" style={{width: "90%", background: "var(--score-good)"}}></div></div><span className="pv">90</span></div>
              <div className="fixrow"><span>Fix: <b>lead with the result, not the setup</b></span><span className="pts">+12 pts</span></div>
            </div>
          </figure>
        </section>

        <section className="split reverse">
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
          <div className="split-copy">
            <span className="kicker">Get discovered</span>
            <h2 className="split-title">A media kit that builds itself</h2>
            <p className="note">Real numbers pulled straight from TikTok, YouTube and Instagram  -  nothing self-reported. One link, and brands see the truth.</p>
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
                <li>Unlimited scores on your own content</li>
                <li>A verified profile brands can search</li>
                <li>Paid briefs matched to your track record</li>
              </ul>
              <Link href={appUrl} className="btn btn-ghost">Start scoring free</Link>
            </div>
            <div className="side-card">
              <span className="tag">For brands</span>
              <h3>Hire creators who can prove it.</h3>
              <ul>
                <li>Search verified profiles by real performance</li>
                <li>See how content will score before it goes live</li>
                <li>Pay safely through the platform</li>
              </ul>
              <Link href="/for-brands" className="btn btn-ghost">See how it works</Link>
            </div>
          </div>
        </section>

        <section className="quotes">
          <h2>What the network says</h2>
          <div className="quotes-grid">
            <div className="quote-card">
              <blockquote>"I stopped guessing. The score showed me my openings were the problem. Two weeks later a brand booked me straight from my media kit."</blockquote>
              <figcaption><ImageSlot id="quote-1" shape="circle" label="Photo" /><div className="who"><strong>Maya R.</strong><span>Food · 214K · Verified 2025</span></div></figcaption>
            </div>
            <div className="quote-card">
              <blockquote>"Verified numbers changed everything. Brands stopped asking me to prove my views  -  they could just see them."</blockquote>
              <figcaption><ImageSlot id="quote-2" shape="circle" label="Photo" /><div className="who"><strong>Amara D.</strong><span>Beauty · 1.2M · Verified 2024</span></div></figcaption>
            </div>
            <div className="quote-card">
              <blockquote>"We hired three creators off their score history alone. No calls, no guessing. The data spoke for itself."</blockquote>
              <figcaption><ImageSlot id="quote-3" shape="circle" label="Photo" /><div className="who"><strong>Dana W.</strong><span>Brand partnerships lead</span></div></figcaption>
            </div>
          </div>
        </section>

        <section className="close">
          <div className="patch">
            <h3>Your next post already has a score</h3>
            <p className="sub">Find out what it is, and what it could be. No card required to start.</p>
            <div className="row">
              <Link href={appUrl} className="btn btn-primary">Score my first video</Link>
              <Link href="/contact" className="btn btn-ghost">Talk to sales</Link>
            </div>
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
