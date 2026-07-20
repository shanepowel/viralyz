import type { Metadata } from "next";
import Link from "next/link";
import { AffiliateApplyForm } from "@/components/marketing/affiliate-apply-form";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Affiliate programme",
  description:
    "Earn 30% recurring for 12 months when creators you refer upgrade. Creators talking to creators.",
  path: routes.affiliates,
});

export default function AffiliatesPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <span className="eyebrow">Affiliates</span>
          <h1>Creators talking to creators is our cheapest channel.</h1>
          <p>
            Earn 30% of paid plan revenue for 12 months on every signup that
            converts through your link. BioPage users are already a ready-made
            army.
          </p>
        </div>
      </div>

      <section style={{ paddingTop: 24, paddingBottom: 40 }}>
        <div className="wrap">
          <div className="split">
            <div>
              <div className="sec-head" style={{ marginBottom: 28 }}>
                <span className="eyebrow">How it works</span>
                <h2>Three steps. Paid when they pay.</h2>
              </div>
              <div className="journey" style={{ gridTemplateColumns: "1fr" }}>
                {[
                  ["01", "Apply", "Get a unique code and referral link."],
                  [
                    "02",
                    "Share",
                    "Put it on your BioPage, videos, or newsletter.",
                  ],
                  [
                    "03",
                    "Earn",
                    "30% recurring for 12 months when they upgrade to Creator or Studio.",
                  ],
                ].map(([num, title, body]) => (
                  <div className="jstep" key={num} style={{ padding: "0 0 28px" }}>
                    <div className="num">{num}</div>
                    <span className="jtag">{title}</span>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 14, color: "var(--ink-2)", maxWidth: 480 }}>
                We do not pay for fake signups. Self-referrals are out. Full terms
                ship with the first payouts. Questions?{" "}
                <Link href="/contact" style={{ color: "var(--violet-deep)" }}>
                  Talk to us
                </Link>
                .
              </p>
            </div>
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--line)",
                borderRadius: "var(--r-lg)",
                padding: 36,
                boxShadow: "var(--shadow)",
                alignSelf: "start",
              }}
            >
              <h3 style={{ fontSize: 20, marginBottom: 8 }}>Join free</h3>
              <p style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 20 }}>
                No fee to join. Approval is usually same day while we are in early
                access.
              </p>
              <AffiliateApplyForm />
            </div>
          </div>
        </div>
      </section>

      <FinalCta
        title="Score content. Share the link. Get paid."
        subtitle="The product is the pitch. Your audience already trusts you."
        cta="Start scoring free"
      />
    </MarketingShell>
  );
}
