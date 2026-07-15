"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

type Platform = "TikTok" | "Instagram" | "YouTube" | "X";
type Creator = {
  name: string;
  platform: Platform;
  niche: string;
  followers: number;
  followersLabel: string;
  score: number;
  stat: string;
};

const CREATORS: Creator[] = [
  { name: "Maya R.", platform: "TikTok", niche: "Food", followers: 214000, followersLabel: "214K", score: 89, stat: "avg views 412K" },
  { name: "Jordan T.", platform: "Instagram", niche: "Fitness", followers: 88000, followersLabel: "88K", score: 81, stat: "avg views 120K" },
  { name: "Amara D.", platform: "YouTube", niche: "Beauty", followers: 1200000, followersLabel: "1.2M", score: 94, stat: "predictions right 91%" },
  { name: "Sam K.", platform: "X", niche: "Tech", followers: 340000, followersLabel: "340K", score: 74, stat: "this month ▲ +6" },
  { name: "Priya N.", platform: "TikTok", niche: "Travel", followers: 512000, followersLabel: "512K", score: 91, stat: "avg views 300K" },
  { name: "Leo B.", platform: "YouTube", niche: "Gaming", followers: 780000, followersLabel: "780K", score: 82, stat: "this month ▲ +3" },
  { name: "Nina F.", platform: "Instagram", niche: "Beauty", followers: 96000, followersLabel: "96K", score: 77, stat: "avg views 60K" },
  { name: "Owen G.", platform: "TikTok", niche: "Food", followers: 128000, followersLabel: "128K", score: 86, stat: "avg views 190K" },
  { name: "Dana W.", platform: "YouTube", niche: "Tech", followers: 210000, followersLabel: "210K", score: 79, stat: "avg views 95K" },
  { name: "Kira L.", platform: "Instagram", niche: "Travel", followers: 640000, followersLabel: "640K", score: 88, stat: "avg views 250K" },
  { name: "Theo M.", platform: "TikTok", niche: "Gaming", followers: 410000, followersLabel: "410K", score: 85, stat: "this month ▲ +2" },
  { name: "Ruth P.", platform: "YouTube", niche: "Fitness", followers: 155000, followersLabel: "155K", score: 83, stat: "avg views 70K" },
];

const PLATFORMS: Platform[] = ["TikTok", "Instagram", "YouTube", "X"];
const NICHES = ["Food", "Beauty", "Fitness", "Tech", "Travel", "Gaming"];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("");
}

export function CreatorsBrowser() {
  const [query, setQuery] = useState("");
  const [platforms, setPlatforms] = useState<Set<Platform>>(new Set());
  const [niches, setNiches] = useState<Set<string>>(new Set());
  const [minScore, setMinScore] = useState(70);

  const togglePlatform = (p: Platform) => {
    setPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const toggleNiche = (n: string) => {
    setNiches((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const results = useMemo(() => {
    return CREATORS.filter((c) => {
      if (platforms.size > 0 && !platforms.has(c.platform)) return false;
      if (niches.size > 0 && !niches.has(c.niche)) return false;
      if (c.score < minScore) return false;
      if (query.trim() && !c.name.toLowerCase().includes(query.trim().toLowerCase()) && !c.niche.toLowerCase().includes(query.trim().toLowerCase())) {
        return false;
      }
      return true;
    }).sort((a, b) => b.score - a.score);
  }, [query, platforms, niches, minScore]);

  return (
    <>
      <section className="relative overflow-hidden px-6 pt-24 pb-12 md:pt-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.15),_transparent_50%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            {CREATORS.length.toLocaleString()}+ verified creators
          </span>
          <h1 className="mb-6 mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Find creators with the <span className="gradient-text">numbers to prove it</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
            Every profile is scored and verified hourly against TikTok, YouTube, Instagram and X —
            no self-reported stats.
          </p>
          <div className="mx-auto flex max-w-xl items-center gap-2 rounded-xl border border-border bg-card p-2">
            <Search className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or niche"
              className="w-full bg-transparent px-1 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-6">
            <div>
              <h5 className="mb-3 text-sm font-semibold">Platform</h5>
              <div className="space-y-2">
                {PLATFORMS.map((p) => (
                  <label key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={platforms.has(p)}
                      onChange={() => togglePlatform(p)}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h5 className="mb-3 text-sm font-semibold">Category</h5>
              <div className="space-y-2">
                {NICHES.map((n) => (
                  <label key={n} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={niches.has(n)}
                      onChange={() => toggleNiche(n)}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    {n}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h5 className="mb-3 text-sm font-semibold">Minimum score</h5>
              <input
                type="range"
                min={0}
                max={100}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>{minScore}+</span>
                <span>100</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPlatforms(new Set());
                setNiches(new Set());
                setMinScore(70);
                setQuery("");
              }}
              className="text-sm text-primary hover:underline"
            >
              Reset filters
            </button>
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {results.length} of {CREATORS.length} creators
              </span>
              <span>Sorted by score</span>
            </div>

            {results.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
                No creators match those filters. Try widening your search.
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((c) => (
                  <div
                    key={c.name}
                    className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-accent text-sm font-bold text-primary-foreground">
                        {initials(c.name)}
                      </div>
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                        {c.platform}
                      </span>
                    </div>
                    <div className="mb-1 font-semibold">{c.name}</div>
                    <div className="mb-4 text-sm text-muted-foreground">
                      {c.niche} · {c.followersLabel}
                    </div>
                    <div className="flex items-end justify-between border-t border-border pt-3">
                      <div>
                        <div className="text-2xl font-bold gradient-text">{c.score}</div>
                        <div className="text-xs text-muted-foreground">Score · {c.stat}</div>
                      </div>
                      <Link
                        href={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000"}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
