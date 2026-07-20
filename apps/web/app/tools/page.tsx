import type { Metadata } from "next";
import Link from "next/link";
import { getPublicAppUrl } from "@repo/config";
import { EngagementCalculator } from "@/components/marketing/engagement-calculator";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "Free tools",
  description:
    "Engagement rate calculator, link scorer, and more. Useful on their own. Free forever. No account needed.",
};

const TOOLS = [
  {
    href: "/report",
    title: "Link scorer",
    body: "Paste any TikTok, Reel or YouTube link and get a Viral Score with one fix, instantly.",
  },
  {
    href: "/tools/engagement-calculator",
    title: "Engagement rate calculator",
    body: "Work out any account's true engagement rate in seconds. Try it below.",
  },
  {
    href: "/tools/fake-follower-checker",
    title: "Fake follower checker",
    body: "Check whether an account's audience is real before you work with them.",
  },
  {
    href: "/tools/influencer-price-calculator",
    title: "Influencer price calculator",
    body: "A fair price range for any creator, based on real booking data, not guesses.",
  },
  {
    href: "/tools/best-time-to-post",
    title: "Best time to post",
    body: "The best posting times for your platform and niche, updated monthly.",
  },
  {
    href: "/tools/thumbnail-checker",
    title: "Thumbnail checker",
    body: "See your thumbnail at real feed size and find out if anyone can read it.",
  },
] as const;

export default function ToolsPage() {
  const appUrl = getPublicAppUrl();

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
            {TOOLS.map((t) => (
              <Link key={t.title} href={t.href} className="tcard">
                <h3>{t.title}</h3>
                <p>{t.body}</p>
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
            <Link href={appUrl} style={{ color: "var(--violet-deep)", fontWeight: 600 }}>
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
      />
    </MarketingShell>
  );
}
