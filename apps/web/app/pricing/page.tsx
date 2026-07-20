import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { flags } from "@/lib/flags";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Pricing",
  description: "Simple plans for creators and brands. Start free.",
  path: routes.pricing,
});

export default function Page() {
  return (
    <MarketingShell>
      <div className="wrap">
        <section className="page-hero" style={{ textAlign: "center" }}>
          <span className="kicker" style={{ display: "block" }}>
            Pricing
          </span>
          <h1 className="display">
            Score for free. Pay when you are ready to grow.
          </h1>
          <p
            className="sub"
            style={{ marginLeft: "auto", marginRight: "auto" }}
          >
            No card required to start. Cancel anytime. Prices in GBP.
          </p>
        </section>

        <div className="price-grid">
          <div className="price-card">
            <h3>Starter</h3>
            <div className="price">
              £0<span>/mo</span>
            </div>
            <p className="desc">Try scoring before you commit.</p>
            <ul>
              <li>10 video scores a month</li>
              <li>Basic fix suggestions</li>
              <li>Public creator profile</li>
            </ul>
            <Link href={routes.signup} className="btn btn-ghost">
              Start free
            </Link>
          </div>
          <div className="price-card feat">
            <span className="plan-tag">Most popular</span>
            <h3>Creator Pro</h3>
            <div className="price">
              £19<span>/mo</span>
            </div>
            <p className="desc">
              For creators posting weekly and chasing brand deals.
            </p>
            <ul>
              <li>Unlimited video scores</li>
              <li>Hook Lab &amp; Script Doctor</li>
              <li>Media kit &amp; rate tools</li>
              <li>Priority in brand search at launch</li>
            </ul>
            <Link href={routes.signup} className="btn btn-primary">
              Start 14-day trial
            </Link>
          </div>
          <div className="price-card">
            <h3>Agency</h3>
            <div className="price">
              £79<span>/mo</span>
            </div>
            <p className="desc">
              Manage rosters and campaigns for multiple clients.
            </p>
            <ul>
              <li>Everything in Creator Pro</li>
              <li>Up to 25 managed profiles</li>
              <li>Campaign manager &amp; team seats</li>
              <li>Dedicated support</li>
            </ul>
            <Link href={routes.contact} className="btn btn-ghost">
              Talk to sales
            </Link>
          </div>
        </div>

        <section className="close" style={{ paddingTop: "56px" }}>
          <h2
            className="split-title"
            style={{ textAlign: "center", marginBottom: 8, fontSize: 26 }}
          >
            Questions
          </h2>
          <div className="faq">
            <details open>
              <summary>
                Do brands pay to search creators?<span />
              </summary>
              <p>
                Brands can browse profiles for free. A subscription unlocks the
                campaign manager
                {flags.paymentsLive
                  ? " and direct booking."
                  : " and, at launch, direct booking with escrow."}
              </p>
            </details>
            <details>
              <summary>
                How is a score calculated?<span />
              </summary>
              <p>
                We analyze opening, visuals, pacing, words and timing against
                what performs in your niche, then combine them into a score out
                of 100.
              </p>
            </details>
            <details>
              <summary>
                Can I cancel anytime?<span />
              </summary>
              <p>
                Yes. Plans are month to month with no lock-in. Your public
                profile stays live on the free tier.
              </p>
            </details>
            <details>
              <summary>
                Do you support agencies managing multiple creators?<span />
              </summary>
              <p>
                Yes, the Agency plan includes a shared dashboard for managing
                rosters and campaigns across clients.
              </p>
            </details>
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
