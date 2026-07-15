import Link from "next/link";
import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { ImageSlot } from "@/components/marketing/image-slot";

export const metadata: Metadata = {
  title: "Browse creators",
  description: "Search verified creators by niche, score, and platform.",
};

export default function CreatorsPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <section className="page-hero">
          <p className="crumb"><Link href="/">Home</Link> / <Link href="/for-brands">For brands</Link> / Search creators</p>
          <span className="kicker">2,140 verified creators</span>
          <h1 className="display">Find creators with the numbers to prove it</h1>
          <p className="sub">Every profile is scored and verified hourly against TikTok, YouTube, Instagram and X. No self-reported stats.</p>
          <div className="searchbar">
            <input type="text" placeholder="Search by name, niche or @handle" />
            <button type="button" className="btn btn-primary">Search</button>
          </div>
        </section>

        <div className="browse-layout">
          <aside className="sidebar">
            <div className="sidebar-group">
              <h5>Platform</h5>
              <label><input type="checkbox" defaultChecked /> TikTok</label>
              <label><input type="checkbox" defaultChecked /> Instagram</label>
              <label><input type="checkbox" /> YouTube</label>
              <label><input type="checkbox" /> X</label>
            </div>
            <div className="sidebar-group">
              <h5>Category</h5>
              <label><input type="checkbox" /> Food</label>
              <label><input type="checkbox" /> Beauty</label>
              <label><input type="checkbox" /> Fitness</label>
              <label><input type="checkbox" /> Tech</label>
              <label><input type="checkbox" /> Travel</label>
              <label><input type="checkbox" /> Gaming</label>
            </div>
            <div className="sidebar-group">
              <h5>Minimum score</h5>
              <input type="range" min="0" max="100" defaultValue="70" />
              <div className="range-vals"><span>0</span><span>70+</span><span>100</span></div>
            </div>
            <div className="sidebar-group">
              <h5>Followers</h5>
              <label><input type="checkbox" /> Under 100K</label>
              <label><input type="checkbox" defaultChecked /> 100K - 500K</label>
              <label><input type="checkbox" /> 500K+</label>
            </div>
            <button type="button" className="btn btn-ghost btn-sm">Reset filters</button>
          </aside>
          <div>
            <div className="results-head"><span>Showing 12 of 2,140 creators</span><span>Sorted by score</span></div>
            <div className="creators-grid">
            <div className="creator-card">
              <div className="creator-photo"><ImageSlot id="bc-photo-1" shape="rect" label="Content still" /><span className="plat">TikTok</span></div>
              <div className="creator-body">
                <div className="creator-top"><ImageSlot id="bc-ava-1" shape="circle" label="Photo" /><div><div className="creator-name">Maya R.</div><div className="creator-meta">Food · 214K</div></div></div>
                <div className="creator-stat"><span className="num">89</span><span className="label">Score · avg views 412K</span></div>
              </div>
            </div>
            <div className="creator-card">
              <div className="creator-photo"><ImageSlot id="bc-photo-2" shape="rect" label="Content still" /><span className="plat">Instagram</span></div>
              <div className="creator-body">
                <div className="creator-top"><ImageSlot id="bc-ava-2" shape="circle" label="Photo" /><div><div className="creator-name">Jordan T.</div><div className="creator-meta">Fitness · 88K</div></div></div>
                <div className="creator-stat"><span className="num">81</span><span className="label">Score · avg views 120K</span></div>
              </div>
            </div>
            <div className="creator-card">
              <div className="creator-photo"><ImageSlot id="bc-photo-3" shape="rect" label="Content still" /><span className="plat">YouTube</span></div>
              <div className="creator-body">
                <div className="creator-top"><ImageSlot id="bc-ava-3" shape="circle" label="Photo" /><div><div className="creator-name">Amara D.</div><div className="creator-meta">Beauty · 1.2M</div></div></div>
                <div className="creator-stat"><span className="num">94</span><span className="label">Predictions right 91%</span></div>
              </div>
            </div>
            <div className="creator-card">
              <div className="creator-photo"><ImageSlot id="bc-photo-4" shape="rect" label="Content still" /><span className="plat">X</span></div>
              <div className="creator-body">
                <div className="creator-top"><ImageSlot id="bc-ava-4" shape="circle" label="Photo" /><div><div className="creator-name">Sam K.</div><div className="creator-meta">Tech · 340K</div></div></div>
                <div className="creator-stat"><span className="num">74</span><span className="label">This month ▲ +6</span></div>
              </div>
            </div>
            <div className="creator-card">
              <div className="creator-photo"><ImageSlot id="bc-photo-5" shape="rect" label="Content still" /><span className="plat">TikTok</span></div>
              <div className="creator-body">
                <div className="creator-top"><ImageSlot id="bc-ava-5" shape="circle" label="Photo" /><div><div className="creator-name">Priya N.</div><div className="creator-meta">Travel · 512K</div></div></div>
                <div className="creator-stat"><span className="num">91</span><span className="label">Score · avg views 300K</span></div>
              </div>
            </div>
            <div className="creator-card">
              <div className="creator-photo"><ImageSlot id="bc-photo-6" shape="rect" label="Content still" /><span className="plat">YouTube</span></div>
              <div className="creator-body">
                <div className="creator-top"><ImageSlot id="bc-ava-6" shape="circle" label="Photo" /><div><div className="creator-name">Leo B.</div><div className="creator-meta">Gaming · 780K</div></div></div>
                <div className="creator-stat"><span className="num">82</span><span className="label">This month ▲ +3</span></div>
              </div>
            </div>
            <div className="creator-card">
              <div className="creator-photo"><ImageSlot id="bc-photo-7" shape="rect" label="Content still" /><span className="plat">Instagram</span></div>
              <div className="creator-body">
                <div className="creator-top"><ImageSlot id="bc-ava-7" shape="circle" label="Photo" /><div><div className="creator-name">Nina F.</div><div className="creator-meta">Beauty · 96K</div></div></div>
                <div className="creator-stat"><span className="num">77</span><span className="label">Score · avg views 60K</span></div>
              </div>
            </div>
            <div className="creator-card">
              <div className="creator-photo"><ImageSlot id="bc-photo-8" shape="rect" label="Content still" /><span className="plat">TikTok</span></div>
              <div className="creator-body">
                <div className="creator-top"><ImageSlot id="bc-ava-8" shape="circle" label="Photo" /><div><div className="creator-name">Owen G.</div><div className="creator-meta">Food · 128K</div></div></div>
                <div className="creator-stat"><span className="num">86</span><span className="label">Score · avg views 190K</span></div>
              </div>
            </div>
            <div className="creator-card">
              <div className="creator-photo"><ImageSlot id="bc-photo-9" shape="rect" label="Content still" /><span className="plat">YouTube</span></div>
              <div className="creator-body">
                <div className="creator-top"><ImageSlot id="bc-ava-9" shape="circle" label="Photo" /><div><div className="creator-name">Dana W.</div><div className="creator-meta">Tech · 210K</div></div></div>
                <div className="creator-stat"><span className="num">79</span><span className="label">Score · avg views 95K</span></div>
              </div>
            </div>
            <div className="creator-card">
              <div className="creator-photo"><ImageSlot id="bc-photo-10" shape="rect" label="Content still" /><span className="plat">Instagram</span></div>
              <div className="creator-body">
                <div className="creator-top"><ImageSlot id="bc-ava-10" shape="circle" label="Photo" /><div><div className="creator-name">Kira L.</div><div className="creator-meta">Travel · 640K</div></div></div>
                <div className="creator-stat"><span className="num">88</span><span className="label">Score · avg views 250K</span></div>
              </div>
            </div>
            <div className="creator-card">
              <div className="creator-photo"><ImageSlot id="bc-photo-11" shape="rect" label="Content still" /><span className="plat">TikTok</span></div>
              <div className="creator-body">
                <div className="creator-top"><ImageSlot id="bc-ava-11" shape="circle" label="Photo" /><div><div className="creator-name">Theo M.</div><div className="creator-meta">Gaming · 410K</div></div></div>
                <div className="creator-stat"><span className="num">85</span><span className="label">This month ▲ +2</span></div>
              </div>
            </div>
            <div className="creator-card">
              <div className="creator-photo"><ImageSlot id="bc-photo-12" shape="rect" label="Content still" /><span className="plat">YouTube</span></div>
              <div className="creator-body">
                <div className="creator-top"><ImageSlot id="bc-ava-12" shape="circle" label="Photo" /><div><div className="creator-name">Ruth P.</div><div className="creator-meta">Fitness · 155K</div></div></div>
                <div className="creator-stat"><span className="num">83</span><span className="label">Score · avg views 70K</span></div>
              </div>
            </div>
            </div>
            <div className="pager">
              <button type="button" className="active">1</button>
              <button type="button">2</button>
              <button type="button">3</button>
              <button type="button">···</button>
              <button type="button">42</button>
            </div>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
