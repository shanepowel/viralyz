import type { Metadata } from "next";
import Link from "next/link";
import { LinkScorer } from "@/components/marketing/link-scorer";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { ReportGateForm } from "@/components/marketing/report-gate-form";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Viral Score Report 2026",
  description:
    "What scored videos say about what actually works. Average scores by niche, fixes that move results, hook styles, posting times.",
  path: routes.report,
});

export default function ReportPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero" style={{ maxWidth: 720 }}>
          <span className="eyebrow">Data report</span>
          <h1>The Viral Score Report 2026.</h1>
          <p>
            Industry surveys tell you what people say. This report will show
            what scored content actually did — once we have enough measured
            data. Gate the PDF with your email to get it when it ships.
          </p>
        </div>

        <div className="report-layout">
          <div className="report-preview">
            <div className="proof-band" style={{ padding: 36 }}>
              <div className="proof-cell">
                <div className="pnum">5</div>
                <div className="plab">Areas in every score</div>
              </div>
              <div className="proof-cell">
                <div className="pnum">&lt;30s</div>
                <div className="plab">To a first score</div>
              </div>
              <div className="proof-cell">
                <div className="pnum">100</div>
                <div className="plab">Point scale</div>
              </div>
            </div>
            <div className="values" style={{ marginTop: 24 }}>
              {[
                [
                  "By niche",
                  "Average scores and view lift after fixes for food, fitness, beauty, tech, UGC and more.",
                ],
                [
                  "Fixes that pay",
                  "Which notes move scores the most, with honest sample sizes.",
                ],
                [
                  "Accuracy",
                  "Predicted versus actual — published when we have enough posts to measure.",
                ],
              ].map(([h, p]) => (
                <div className="value" key={h}>
                  <h4>{h}</h4>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <ReportGateForm />
            <p style={{ marginTop: 24, fontSize: 13.5, color: "var(--ink-3)" }}>
              Prefer to score a video now?{" "}
              <Link href={routes.tools} style={{ color: "var(--violet-deep)" }}>
                Try free tools
              </Link>
              .
            </p>
            <div style={{ marginTop: 24 }}>
              <LinkScorer />
            </div>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
