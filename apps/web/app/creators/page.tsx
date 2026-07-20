import Link from "next/link";
import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { DemoBadge } from "@/components/marketing/demo-badge";
import {
  CREATOR_NICHES,
  creators,
  creatorInitials,
  formatFollowers,
  formatViews,
} from "@/data/creators";
import { flags } from "@/lib/flags";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Browse creators",
  description: "Search creator profiles by niche, score, and platform.",
  path: routes.creators,
});

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

  const list = creators.filter((c) => {
    if (niche && c.niche.toLowerCase() !== niche.toLowerCase()) return false;
    if (platform && c.platform.toLowerCase() !== platform.toLowerCase())
      return false;
    if (
      q &&
      !c.name.toLowerCase().includes(q) &&
      !c.handle.toLowerCase().includes(q) &&
      !c.niche.toLowerCase().includes(q)
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
            <Link href="/">Home</Link> /{" "}
            <Link href={routes.forBrands}>For brands</Link> / Search creators
          </p>
          <span className="kicker">Founding roster · example profiles</span>
          <h1 className="display">
            Find creators with the numbers to prove it
          </h1>
          <p className="sub">
            Profiles are verified against connected platform accounts. No
            self-reported stats.
          </p>
          <form className="searchbar" action={routes.creators} method="get">
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

        {!flags.marketplaceLive ? (
          <div
            style={{
              borderRadius: 12,
              border: "1px solid var(--violet-soft)",
              background: "var(--violet-soft)",
              padding: 16,
              fontSize: 14,
              marginBottom: 24,
            }}
          >
            These are example profiles showing how verified creator data will
            look. Real creators are onboarding now —{" "}
            <Link href={routes.forCreators} style={{ textDecoration: "underline" }}>
              join the founding roster
            </Link>
            .
          </div>
        ) : null}

        <div className="browse-layout">
          <aside className="sidebar">
            <div className="sidebar-group">
              <h5>Platform</h5>
              {PLATFORMS.map((p) => (
                <Link
                  key={p}
                  href={`${routes.creators}?platform=${encodeURIComponent(p)}${niche ? `&niche=${encodeURIComponent(niche)}` : ""}`}
                  className={
                    platform === p ? "filter-pill active" : "filter-pill"
                  }
                  style={{ marginBottom: 6 }}
                >
                  {p}
                </Link>
              ))}
            </div>
            <div className="sidebar-group">
              <h5>Category</h5>
              {CREATOR_NICHES.map((n) => (
                <Link
                  key={n}
                  href={`${routes.creators}?niche=${encodeURIComponent(n)}`}
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
            <Link href={routes.forBrands}>For brands overview</Link>
            <Link href={routes.pricing}>Pricing</Link>
            <Link href={routes.contact}>Talk to sales</Link>
          </aside>

          <div>
            <div className="creators-grid">
              {list.map((c) => (
                <Link
                  key={c.slug}
                  href={`/kit/${c.slug}`}
                  className="creator-card"
                >
                  <div
                    className="creator-photo"
                    style={{
                      background: c.face,
                      minHeight: 140,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 32,
                      fontWeight: 700,
                    }}
                  >
                    {creatorInitials(c)}
                    <span className="plat">{c.platform}</span>
                  </div>
                  <div className="creator-body">
                    <div className="creator-top">
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
            {list.length === 0 ? (
              <p style={{ marginTop: 24 }}>
                No profiles match.{" "}
                <Link href={routes.creators}>Clear filters</Link> or{" "}
                <Link href={routes.contact}>contact sales</Link>.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
