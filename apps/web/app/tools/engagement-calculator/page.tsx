import type { Metadata } from "next";
import Link from "next/link";
import { EngagementCalculator } from "@/components/marketing/engagement-calculator";
import { LinkScorer } from "@/components/marketing/link-scorer";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "Engagement rate calculator",
  description:
    "Work out any account's true engagement rate in seconds. Free, no signup.",
};

export default function EngagementCalculatorPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <span className="eyebrow">Free tools</span>
          <h1>Engagement rate calculator</h1>
          <p>
            Enter followers, average likes and comments. Get a plain-language
            read on how the account compares.
          </p>
        </div>
        <EngagementCalculator />

        <div className="sec-head" style={{ marginTop: 72, marginBottom: 24 }}>
          <span className="eyebrow">Next</span>
          <h2>Score a real piece of content</h2>
          <p>
            Engagement rate is only one signal. Paste a link and see what will
            actually work.
          </p>
        </div>
        <LinkScorer />
        <p style={{ marginTop: 28, fontSize: 13.5, color: "var(--ink-3)" }}>
          <Link href="/tools" style={{ color: "var(--violet-deep)" }}>
            ← All free tools
          </Link>
        </p>
      </div>
    </MarketingShell>
  );
}
