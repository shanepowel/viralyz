"use client";

import Link from "next/link";
import { useState } from "react";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
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

const CREATORS = [
  {
    ini: "MR",
    name: "Maya R.",
    niche: "Food · 214K · score 89",
    from: "£180",
    face: "linear-gradient(135deg,#F2994A,#EB5757)",
    tags: ["Food", "Under £250"],
  },
  {
    ini: "AD",
    name: "Amara D.",
    niche: "Beauty · 1.2M · score 94",
    from: "£950",
    face: "linear-gradient(135deg,#56CCF2,#2F80ED)",
    tags: ["Beauty"],
  },
  {
    ini: "SK",
    name: "Sam K.",
    niche: "Tech · 340K · score 74",
    from: "£420",
    face: "linear-gradient(135deg,#27AE60,#145A32)",
    tags: ["Tech"],
  },
  {
    ini: "JT",
    name: "Jordan T.",
    niche: "Fitness · 88K · score 81",
    from: "£120",
    face: "linear-gradient(135deg,#6C4CF1,#3D2A9E)",
    tags: ["Fitness", "Rising on TikTok", "Under £250"],
  },
  {
    ini: "LP",
    name: "Lena P.",
    niche: "UGC · 46K · score 86",
    from: "£95",
    face: "linear-gradient(135deg,#F857A6,#FF5858)",
    tags: ["UGC", "Under £250", "London"],
  },
  {
    ini: "OB",
    name: "Omar B.",
    niche: "Gaming · 520K · score 78",
    from: "£600",
    face: "linear-gradient(135deg,#8E2DE2,#4A00E0)",
    tags: ["Rising on TikTok"],
  },
  {
    ini: "NF",
    name: "Nia F.",
    niche: "Travel · 156K · score 83",
    from: "£240",
    face: "linear-gradient(135deg,#11998E,#38EF7D)",
    tags: ["Under £250", "London"],
  },
  {
    ini: "CW",
    name: "Chris W.",
    niche: "Fashion · 92K · score 71",
    from: "£150",
    face: "linear-gradient(135deg,#FC4A1A,#F7B733)",
    tags: ["Under £250"],
  },
];

export default function BrowsePage() {
  const [chip, setChip] = useState<(typeof CHIPS)[number]>("All");
  const appUrl = getPublicAppUrl();
  const list =
    chip === "All"
      ? CREATORS
      : CREATORS.filter((c) => c.tags.includes(chip));

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
            {list.map((c) => (
              <div className="bcard-creator" key={c.name}>
                <div className="face" style={{ background: c.face }}>
                  <span className="ini">{c.ini}</span>
                </div>
                <div className="name">
                  {c.name}{" "}
                  <span style={{ color: "var(--s90)", fontSize: 11 }}>✓</span>
                </div>
                <div className="niche">{c.niche}</div>
                <div className="brow">
                  <span className="from">
                    From
                    <b>{c.from}</b>
                  </span>
                  <Link
                    className="btn btn-outline"
                    style={{ padding: "7px 14px", fontSize: 12.5 }}
                    href={appUrl}
                  >
                    View kit
                  </Link>
                </div>
              </div>
            ))}
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
