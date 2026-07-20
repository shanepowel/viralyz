import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { JsonLd } from "@/components/seo/JsonLd";
import { Num } from "@/components/ui/Num";
import { flags } from "@/lib/flags";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Pricing",
  description: "Simple plans for creators and brands. Start free.",
  path: routes.pricing,
});

const FAQ = [
  {
    q: "Do brands pay to search creators?",
    a: flags.paymentsLive
      ? "Brands can browse profiles for free. A subscription unlocks the campaign manager and direct booking."
      : "Brands can browse profiles for free. A subscription unlocks the campaign manager and, at launch, direct booking with escrow.",
  },
  {
    q: "How is a score calculated?",
    a: "We analyze opening, visuals, pacing, words and timing against what performs in your niche, then combine them into a score out of 100.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Plans are month to month with no lock-in. Your public profile stays live on the free tier.",
  },
  {
    q: "Do you support agencies managing multiple creators?",
    a: "Yes, the Agency plan includes a shared dashboard for managing rosters and campaigns across clients.",
  },
] as const;

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function Page() {
  return (
    <MarketingShell>
      <JsonLd data={faqLd} />
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
              <Num>£0</Num>
              <span>/mo</span>
            </div>
            <p className="desc">Try scoring before you commit.</p>
            <ul>
              <li>
                <Num>10</Num> video scores a month
              </li>
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
              <Num>£19</Num>
              <span>/mo</span>
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
              <Num>£79</Num>
              <span>/mo</span>
            </div>
            <p className="desc">
              Manage rosters and campaigns for multiple clients.
            </p>
            <ul>
              <li>Everything in Creator Pro</li>
              <li>
                Up to <Num>25</Num> managed profiles
              </li>
              <li>Campaign manager &amp; team seats</li>
              <li>Dedicated support</li>
            </ul>
            <Link href={routes.contact} className="btn btn-ghost">
              Talk to sales
            </Link>
          </div>
        </div>

        <section className="close" style={{ paddingTop: "56px" }} id="faq">
          <h2
            className="split-title"
            style={{ textAlign: "center", marginBottom: 8, fontSize: 26 }}
          >
            Questions
          </h2>
          <div className="faq">
            {FAQ.map((item, i) => (
              <details key={item.q} open={i === 0}>
                <summary>
                  {item.q}
                  <span />
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
