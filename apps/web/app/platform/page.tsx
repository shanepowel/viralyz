import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { features } from "@/data/features";
import { flags } from "@/lib/flags";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Platform",
  description:
    "Every tool feeds one score. Viralyz connects everything to a single Viral Score.",
  path: routes.platform,
});

const OVERVIEW = [
  ...features.map((f) => ({
    tag: "Feature",
    name: f.name,
    body: f.tagline,
    href: `/platform/${f.slug}`,
  })),
  {
    tag: "Publish",
    name: "Smart Calendar",
    body: "Plan posts around your audience's best hours. Every scheduled post can show its score.",
    href: routes.signup,
  },
  {
    tag: "Engage",
    name: "DM Automation",
    body: "Keyword comments get your link by DM, within platform rules.",
    href: routes.signup,
  },
  {
    tag: "Earn",
    name: "Media Kit",
    body: "Your profile, packages and score history in one link brands can trust.",
    href: `${routes.forCreators}#media-kit`,
  },
] as const;

export default function PlatformPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <span className="eyebrow">Platform</span>
          <h1>Every tool feeds one score.</h1>
          <p>
            Other toolkits give you ten separate gadgets. Viralyz connects
            everything to a single score, so each tool makes the next one
            smarter.
          </p>
        </div>
      </div>

      <section style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="tool-grid">
            {OVERVIEW.map((tool) => (
              <Link
                className="tool"
                key={tool.name}
                href={tool.href}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="t-tag">{tool.tag}</span>
                <h3>{tool.name}</h3>
                <p>{tool.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="band" id="integrations" style={{ marginTop: 48 }}>
        <div className="wrap">
          <div className="sec-head" style={{ marginBottom: 28 }}>
            <span className="eyebrow">Integrations</span>
            <h2>TikTok, YouTube, Instagram, and X.</h2>
            <p>
              Connect the accounts you already post on. Scores and track records
              stay tied to the real handle, not a self-reported spreadsheet.
            </p>
          </div>
          <div className="tool-grid">
            {["TikTok", "YouTube Shorts", "Instagram Reels", "X"].map(
              (name) => (
                <div className="tool" key={name}>
                  <span className="t-tag">Connect</span>
                  <h3>{name}</h3>
                  <p>
                    Pull posts and engagement into your Viral Score history from
                    connected accounts.
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <section
        className="band"
        id="api"
        style={{ marginTop: 24, paddingBottom: 24 }}
      >
        <div className="wrap">
          <div className="sec-head" style={{ marginBottom: 16 }}>
            <span className="eyebrow">API</span>
            <h2>Pull scores into your own tools.</h2>
            {flags.apiDocsLive ? (
              <p>
                Public docs are available for partner teams.{" "}
                <Link href="/docs/api">Read the API docs</Link>.
              </p>
            ) : (
              <p>
                API access is in private preview —{" "}
                <Link
                  href={routes.contact}
                  style={{ color: "var(--violet-deep)", fontWeight: 600 }}
                >
                  contact partnerships
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </section>

      <FinalCta
        title="Try every tool free."
        subtitle="10 scores a month, no card needed. Upgrade when it pays for itself."
        cta="Start free"
        href={routes.signup}
      />
    </MarketingShell>
  );
}
