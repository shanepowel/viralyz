import Link from "next/link";
import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { ImageSlot } from "@/components/marketing/image-slot";
import { PUBLIC_KITS } from "@/lib/kits";

export const metadata: Metadata = {
  title: "Browse creators",
  description: "Search verified creators by niche, score, and platform.",
};

const NICHES = ["Food", "Beauty", "Fitness", "Tech", "Travel", "Gaming"] as const;
const PLATFORMS = ["TikTok", "Instagram", "YouTube", "X"] as const;

type SearchParams = Promise<{ niche?: string; q?: string; platform?: string }>;

export default async function CreatorsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = (await searchParams) ?? {};
  const niche = params.niche?.trim();
  const q = params.q?.trim().toLowerCase();
  const platform = params.platform?.trim();

  const kits = PUBLIC_KITS.filter((kit) => {
    if (niche && kit.niche.toLowerCase() !== niche.toLowerCase()) return false;
    if (
      q &&
      !kit.displayName.toLowerCase().includes(q) &&
      !kit.handle.toLowerCase().includes(q) &&
      !kit.niche.toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });

  return (
    <MarketingShell>
      <div className="wrap">
        <section className="page-hero">
          <p className="crumb">
            <Link href="/">Home</Link> / <Link href="/for-brands">For brands</Link>{" "}
            / Search creators
          </p>
          <span className="kicker">{PUBLIC_KITS.length} verified creators</span>
          <h1 className="display">Find creators with the numbers to prove it</h1>
          <p className="sub">
            Every profile is scored and verified hourly against TikTok, YouTube,
            Instagram and X. No self-reported stats.
          </p>
          <form className="searchbar" action="/creators" method="get">
            {niche ? <input type="hidden" name="niche" value={niche} /> : null}
            {platform ? (
              <input type="hidden" name="platform" value={platform} />
            ) : null}
            <input
              type="search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search by name, niche or @handle"
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </section>

        <div className="browse-layout">
          <aside className="sidebar">
            <div className="sidebar-group">
              <h5>Platform</h5>
              {PLATFORMS.map((p) => (
                <Link
                  key={p}
                  href={`/creators?platform=${encodeURIComponent(p)}${niche ? `&niche=${encodeURIComponent(niche)}` : ""}`}
                  className={platform === p ? "filter-pill active" : "filter-pill"}
                  style={{ marginBottom: 6 }}
                >
                  {p}
                </Link>
              ))}
            </div>
            <div className="sidebar-group">
              <h5>Category</h5>
              {NICHES.map((n) => (
                <Link
                  key={n}
                  href={`/creators?niche=${encodeURIComponent(n)}`}
                  className={
                    niche?.toLowerCase() === n.toLowerCase()
                      ? "filter-pill active"
                      : "filter-pill"
                  }
                  style={{ marginBottom: 6 }}
                >
                  {n}
                </Link>
              ))}
            </div>
            <div className="sidebar-group">
              <h5>Quick links</h5>
              <Link href="/for-brands">For brands overview</Link>
              <Link href="/pricing">Agency pricing</Link>
              <Link href="/contact">Talk to sales</Link>
              <Link href="/report">Viral Score Report</Link>
            </div>
            <Link href="/creators" className="btn btn-ghost btn-sm">
              Reset filters
            </Link>
          </aside>
          <div>
            <div className="results-head">
              <span>
                Showing {kits.length} of {PUBLIC_KITS.length} creators
                {niche ? ` in ${niche}` : ""}
                {q ? ` matching “${params.q}”` : ""}
              </span>
              <span>Sorted by score</span>
            </div>
            <div className="creators-grid">
              {kits.map((kit) => (
                <Link
                  key={kit.handle}
                  href={`/kit/${kit.handle}`}
                  className="creator-card"
                >
                  <div className="creator-photo">
                    <ImageSlot
                      id={`bc-photo-${kit.handle}`}
                      shape="rect"
                      label="Content still"
                    />
                    <span className="plat">{kit.niche}</span>
                  </div>
                  <div className="creator-body">
                    <div className="creator-top">
                      <ImageSlot
                        id={`bc-ava-${kit.handle}`}
                        shape="circle"
                        label="Photo"
                      />
                      <div>
                        <div className="creator-name">{kit.displayName}</div>
                        <div className="creator-meta">
                          {kit.niche} · {kit.followers}
                        </div>
                      </div>
                    </div>
                    <div className="creator-stat">
                      <span className="num">{kit.score}</span>
                      <span className="label">
                        Score · eng {kit.engagement}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {kits.length === 0 ? (
              <p className="sub" style={{ marginTop: 24 }}>
                No creators match those filters.{" "}
                <Link href="/creators">Clear filters</Link> or{" "}
                <Link href="/contact">contact sales</Link> for a custom shortlist.
              </p>
            ) : (
              <div className="pager">
                <Link href="/creators" className="btn btn-ghost btn-sm">
                  View all
                </Link>
                <Link href="/for-brands" className="btn btn-ghost btn-sm">
                  How hiring works
                </Link>
                <Link href="/contact" className="btn btn-primary btn-sm">
                  Talk to sales
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
