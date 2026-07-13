import type { Metadata } from "next";
import Link from "next/link";
import { getPublicAppUrl } from "@repo/config";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free. Upgrade when it pays for itself. Simple creator plans with no surprises.",
};

const FAQS = [
  {
    q: "How accurate is the score?",
    a: "Right now our predictions are correct about 82% of the time, and we show you that number rather than hiding it. The more you post through Viralyz, the more it learns your audience and the sharper your scores get.",
  },
  {
    q: "Which platforms does it work with?",
    a: "TikTok, YouTube, Instagram and X. Each platform is scored differently, because what works on TikTok is not what works on YouTube.",
  },
  {
    q: "Do you post for me?",
    a: "Only if you want us to. You can schedule posts through the calendar for platforms that allow it, or we can remind you when it is time to post yourself. You always stay in control of your accounts.",
  },
  {
    q: "Can I score a video again after making changes?",
    a: "Yes, as many times as you like. You will see exactly which fixes moved your score and by how much.",
  },
  {
    q: "What happens to my data?",
    a: "Your content and numbers belong to you. You can export or delete everything at any time. We never sell your data, and brands only see what you choose to publish on your media kit.",
  },
] as const;

export default function PricingPage() {
  const appUrl = getPublicAppUrl();

  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <span className="eyebrow">Pricing</span>
          <h1>Start free. Upgrade when it pays for itself.</h1>
          <p>
            Simple plans, no surprises. Cancel any time and keep access until
            the end of your billing period.
          </p>
        </div>
      </div>

      <section style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="price-grid">
            <div className="plan">
              <h3>Free</h3>
              <p className="sub">See how it works</p>
              <div className="amount">
                £0<span>/month</span>
              </div>
              <ul>
                <li>
                  <span className="tick">✓</span>10 scores a month
                </li>
                <li>
                  <span className="tick">✓</span>1 platform connected
                </li>
                <li>
                  <span className="tick">✓</span>Full score breakdown with fixes
                </li>
                <li>
                  <span className="tick">✓</span>Track 3 competitors
                </li>
                <li>
                  <span className="tick">✓</span>Basic BioPage
                </li>
              </ul>
              <Link className="btn btn-outline" href={appUrl}>
                Start free
              </Link>
            </div>

            <div className="plan hot">
              <h3>Creator</h3>
              <p className="sub">For creators posting every week</p>
              <div className="amount">
                £25<span>/month</span>
              </div>
              <ul>
                <li>
                  <span className="tick">✓</span>Unlimited scores
                </li>
                <li>
                  <span className="tick">✓</span>All platforms
                </li>
                <li>
                  <span className="tick">✓</span>Performance tracking that learns
                  your audience
                </li>
                <li>
                  <span className="tick">✓</span>Track 30 competitors, refreshed
                  every 6 hours
                </li>
                <li>
                  <span className="tick">✓</span>DM automation for 1 account
                </li>
                <li>
                  <span className="tick">✓</span>Full BioPage with analytics
                </li>
                <li>
                  <span className="tick">✓</span>Verified media kit
                </li>
              </ul>
              <Link className="btn btn-violet" href={appUrl}>
                Go Creator
              </Link>
            </div>

            <div className="plan">
              <h3>Studio</h3>
              <p className="sub">For teams and agencies</p>
              <div className="amount">
                £69<span>/month</span>
              </div>
              <ul>
                <li>
                  <span className="tick">✓</span>Everything in Creator
                </li>
                <li>
                  <span className="tick">✓</span>5 team seats
                </li>
                <li>
                  <span className="tick">✓</span>Track 100 competitors, refreshed
                  hourly
                </li>
                <li>
                  <span className="tick">✓</span>DM automation for 3 accounts
                </li>
                <li>
                  <span className="tick">✓</span>API access
                </li>
                <li>
                  <span className="tick">✓</span>Media kits with your own
                  branding
                </li>
              </ul>
              <Link className="btn btn-outline" href={appUrl}>
                Start Studio
              </Link>
            </div>
          </div>
          <p
            style={{
              textAlign: "center",
              marginTop: 24,
              fontSize: 13.5,
              color: "var(--ink-3)",
            }}
          >
            Pay yearly and get two months free.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Questions</span>
            <h2>Fair questions, straight answers.</h2>
          </div>
          <div className="faq">
            {FAQS.map((item) => (
              <div className="faq-item" key={item.q}>
                <h4>{item.q}</h4>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCta
        title="Ten free scores are waiting."
        subtitle="No card. No catch. See your first score in under a minute."
        cta="Start free"
      />
    </MarketingShell>
  );
}
