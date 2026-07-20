import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { ThumbnailChecker } from "@/app/tools/thumbnail-checker/Checker";
import { LinkScorer } from "@/components/marketing/link-scorer";
import { pageMeta } from "@/lib/meta";

export const metadata: Metadata = pageMeta({
  title: "Thumbnail checker",
  description:
    "See your thumbnail at real feed size and find out if anyone can read it. Free, no signup.",
  path: "/tools/thumbnail-checker",
});

export default function ThumbnailCheckerPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <p className="crumb">
            <Link href="/tools">Free tools</Link> / Thumbnail checker
          </p>
          <span className="eyebrow">Free tool</span>
          <h1>Thumbnail checker</h1>
          <p>
            See your thumbnail at real feed size and find out if anyone can
            read it.
          </p>
        </div>
      </div>

      <section style={{ paddingTop: 8, paddingBottom: 48 }}>
        <div className="wrap">
          <ThumbnailChecker />
          <div style={{ marginTop: 48 }}>
            <h2 style={{ fontSize: 22, marginBottom: 12 }}>
              Score a full video next
            </h2>
            <LinkScorer />
          </div>
        </div>
      </section>

      <FinalCta
        title="Readable thumbnails are only one factor."
        subtitle="Score the whole post free on Viralyz."
        cta="Start free"
      />
    </MarketingShell>
  );
}
