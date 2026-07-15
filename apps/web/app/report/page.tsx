import type { Metadata } from "next";
import Link from "next/link";
import { LinkScorer } from "@/components/marketing/link-scorer";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { ReportGateForm } from "@/components/marketing/report-gate-form";

export const metadata: Metadata = {
  title: "Viral Score Report 2026",
  description:
    "What scored videos say about what actually works. Average scores by niche, fixes that move results, hook styles, posting times.",
};

export default function ReportPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero" style={{ maxWidth: 720 }}>
          <span className="eyebrow">Data report</span>
          <h1>The Viral Score Report 2026.</h1>
          <p>
            Industry surveys tell you what people say. Transaction reports tell
            you what people paid. This report shows what scored content actually
            did. Gate the PDF with your email.
          </p>
        </div>

        <div className="report-layout">
          <div className="report-preview">
            <div className="proof-band" style={{ padding: 36 }}>
              <div className="proof-cell">
                <div className="pnum">2.1M+</div>
                <div className="plab">Videos in the scoring set (target)</div>
              </div>
              <div className="proof-cell">
                <div className="pnum">5</div>
                <div className="plab">Components in every score</div>
              </div>
              <div className="proof-cell">
                <div className="pnum">82%</div>
                <div className="plab">Shown accuracy, never hidden</div>
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
                  "Which suggested changes moved re-scores and real performance most.",
                ],
                [
                  "Hooks and timing",
                  "Opening styles by platform, and posting-time effects from tracked results.",
                ],
              ].map(([h, p]) => (
                <div className="value" key={h}>
                  <h4>{h}</h4>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="report-card">
            <h3 style={{ fontSize: 20, marginBottom: 8 }}>Get the PDF</h3>
            <p style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 18 }}>
              First edition compiles as scoring volume grows. Leave your email
              for the drop, and see the outline now.
            </p>
            <ReportGateForm />
          </div>
        </div>

        <div style={{ marginTop: 72, marginBottom: 80, maxWidth: 560 }}>
          <div className="sec-head" style={{ marginBottom: 20 }}>
            <span className="eyebrow">While you wait</span>
            <h2>Score one of your own videos.</h2>
          </div>
          <LinkScorer />
          <p style={{ marginTop: 20, fontSize: 13.5, color: "var(--ink-3)" }}>
            Prefer tools?{" "}
            <Link href="/tools" style={{ color: "var(--violet-deep)" }}>
              Free calculators
            </Link>
            .
          </p>
        </div>
      </div>
    </MarketingShell>
  );
}
