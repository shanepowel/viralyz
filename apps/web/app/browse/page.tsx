"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { formatGbp, PUBLIC_KITS } from "@/lib/kits";
import { getPublicAppUrl } from "@repo/config";

const CHIPS = [
  "All",
  "Rising on TikTok",
  "Under £250",
  "Food",
  "Fitness",
  "Beauty",
  "Tech",
  "UGC",
  "London",
] as const;

export default function BrowsePage() {
  const [chip, setChip] = useState<(typeof CHIPS)[number]>("All");
  const appUrl = getPublicAppUrl();
  const list = useMemo(() => {
    if (chip === "All") return PUBLIC_KITS;
    if (chip === "Under £250") {
      return PUBLIC_KITS.filter((k) =>
        k.packages.some((p) => p.priceCents <= 25000),
      );
    }
    return PUBLIC_KITS.filter(
      (k) =>
        k.tags.includes(chip) ||
        k.niche === chip ||
        (chip === "London" && k.city === "London"),
    );
  }, [chip]);

  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <span className="eyebrow">Browse creators</span>
          <h1>Every creator here has receipts.</h1>
          <p>
            Verified numbers, live scores, and upfront prices. Browse free, book
            safely, and pay only when the work is approved. Creators keep 100% of
            their price.
          </p>
        </div>
      </div>

      <section style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="chips" role="tablist" aria-label="Browse filters">
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip${chip === c ? " on" : ""}`}
                onClick={() => setChip(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="browse-grid">
            {list.map((c) => {
              const from = Math.min(...c.packages.map((p) => p.priceCents));
              return (
                <Link
                  key={c.handle}
                  href={`/kit/${c.handle}`}
                  className="bcard-creator"
                >
                  <div className="face" style={{ background: c.face }}>
                    <span className="ini">{c.initials}</span>
                  </div>
                  <div className="name">
                    {c.displayName}{" "}
                    <span style={{ color: "var(--s90)", fontSize: 11 }}>✓</span>
                  </div>
                  <div className="niche">
                    {c.niche} · {c.followers} · score {c.score}
                  </div>
                  <div className="brow">
                    <span className="from">
                      From
                      <b>{formatGbp(from)}</b>
                    </span>
                    <span
                      className="btn btn-outline"
                      style={{ padding: "7px 14px", fontSize: 12.5 }}
                    >
                      View kit
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          <p
            style={{
              textAlign: "center",
              marginTop: 28,
              fontSize: 13.5,
              color: "var(--ink-3)",
            }}
          >
            Are you a creator?{" "}
            <Link
              href={appUrl}
              style={{ color: "var(--violet-deep)", fontWeight: 600 }}
            >
              Get verified and list your packages free.
            </Link>
          </p>
        </div>
      </section>

      <FinalCta
        title="Book proof, not promises."
        subtitle="Money is held safely until you approve the work. Creators keep 100%."
        cta="See how booking works"
        href="/brands"
      />
    </MarketingShell>
  );
}
