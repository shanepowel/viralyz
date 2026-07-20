import type { Metadata } from "next";
import Link from "next/link";
import { EngagementCalculator } from "@/components/marketing/engagement-calculator";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { liveTools } from "@/data/tools";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Free tools",
  description:
    "Engagement rate calculator, thumbnail checker, and more. Useful on their own. Free forever. No signup.",
  path: routes.tools,
});

export default function ToolsPage() {
  const tools = liveTools();

  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <span className="eyebrow">Free tools</span>
          <h1>Useful on their own. Free forever.</h1>
          <p>
            No account needed for any of these. If you like them, the full
            platform gives you 10 free scores a month.
          </p>
        </div>
      </div>

      <section style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="tools-grid">
            {tools.map((t) => (
              <Link
                key={t.slug}
                href={`/tools/${t.slug}`}
                className="tcard"
              >
                <h3>{t.name}</h3>
                <p>{t.description}</p>
                <span className="t-free">Free · No signup</span>
              </Link>
            ))}
          </div>

          <div className="sec-head" style={{ marginTop: 72, marginBottom: 32 }}>
            <span className="eyebrow">Try one now</span>
            <h2>Engagement rate calculator</h2>
          </div>
          <EngagementCalculator />
          <p style={{ marginTop: 16, fontSize: 13.5, color: "var(--ink-3)" }}>
            Want the full suite?{" "}
            <Link
              href={routes.signup}
              style={{ color: "var(--violet-deep)", fontWeight: 600 }}
            >
              Start scoring free
            </Link>
            .
          </p>
        </div>
      </section>

      <FinalCta
        title="The tools are free. The score is the magic."
        subtitle="Ten free scores a month. See what these calculators cannot show you."
        cta="Start free"
        href={routes.signup}
      />
    </MarketingShell>
  );
}
