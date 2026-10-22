import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { ThumbnailChecker } from "@/app/tools/thumbnail-checker/Checker";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";

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
        </div>
      </section>

      <FinalCta
        title="Readability is only one pre-flight check."
        subtitle="Generate and pre-flight your first ad variant free."
        cta="Start free"
        href={routes.signup}
      />
    </MarketingShell>
  );
}
