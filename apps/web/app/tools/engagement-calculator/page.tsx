import type { Metadata } from "next";
import Link from "next/link";
import { EngagementCalculator } from "@/components/marketing/engagement-calculator";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { LinkScorer } from "@/components/marketing/link-scorer";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  title: "Engagement rate calculator",
  description:
    "Work out any account's true engagement rate in seconds. Free, no signup.",
  path: "/tools/engagement-calculator",
});

export default function EngagementCalculatorPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <p className="crumb">
            <Link href="/tools">Free tools</Link> / Engagement rate calculator
          </p>
          <span className="eyebrow">Free tool</span>
          <h1>Engagement rate calculator</h1>
          <p>
            Work out any account&apos;s true engagement rate in seconds. No
            account needed.
          </p>
        </div>
      </div>

      <section style={{ paddingTop: 8, paddingBottom: 48 }}>
        <div className="wrap">
          <EngagementCalculator />
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 22, marginBottom: 12 }}>
              Score a full video next
            </h2>
            <LinkScorer />
          </div>
        </div>
      </section>

      <FinalCta
        title="Engagement is one number. Score is the whole picture."
        subtitle="Ten free scores a month."
        cta="Start free"
      />
    </MarketingShell>
  );
}
