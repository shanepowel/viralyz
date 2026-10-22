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
  description: "Free to start, credit-based after that. Pay only for what you generate.",
  path: routes.pricing,
});

const FAQ = [
  {
    q: "How do credits work?",
    a: "One credit generates one ad variant. Every variant is pre-flighted automatically — that check doesn't cost anything extra.",
  },
  {
    q: "What happens if a generation fails?",
    a: "You're refunded automatically. A failed or retried generation never costs you a credit.",
  },
  {
    q: "How do I get more credits?",
    a: flags.paymentsLive
      ? "Buy more credits directly from your account page, any time."
      : "Self-serve credit purchases aren't live yet — talk to sales and we'll sort you out.",
  },
  {
    q: "Is every variant really AI-generated?",
    a: "Yes, and it's labeled that way on every variant — no exceptions.",
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
            Free to start. Pay only for what you generate.
          </h1>
          <p
            className="sub"
            style={{ marginLeft: "auto", marginRight: "auto" }}
          >
            No subscription. No card required to start. 1 credit = 1 generated ad variant.
          </p>
        </section>

        <div className="price-grid">
          <div className="price-card feat">
            <span className="plan-tag">Start here</span>
            <h3>Free</h3>
            <div className="price">
              <Num>10</Num>
              <span>credits</span>
            </div>
            <p className="desc">Enough to try Discover, Brand, and Studio end to end.</p>
            <ul>
              <li>
                <Num>10</Num> free credits on signup
              </li>
              <li>Every variant pre-flighted, at no extra cost</li>
              <li>Failed generations are refunded automatically</li>
            </ul>
            <Link href={routes.signup} className="btn btn-primary">
              Start free
            </Link>
          </div>
          <div className="price-card">
            <h3>Need more credits?</h3>
            <div className="price">
              <Num>—</Num>
            </div>
            <p className="desc">
              Self-serve credit purchases aren&apos;t live yet. Talk to us and
              we&apos;ll get you set up.
            </p>
            <ul>
              <li>Same pre-flight checks on every variant</li>
              <li>No recurring subscription</li>
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
