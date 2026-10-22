import type { Metadata } from "next";
import Link from "next/link";
import { EngagementCalculator } from "@/components/marketing/engagement-calculator";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";

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
        </div>
      </section>

      <FinalCta
        title="Pre-flight your next ad before you spend"
        subtitle="10 free credits on signup."
        cta="Start free"
        href={routes.signup}
      />
    </MarketingShell>
  );
}
