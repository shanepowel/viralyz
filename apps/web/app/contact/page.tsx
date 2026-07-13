import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions, ideas, press, partnerships or problems. We reply within one working day.",
};

export default function ContactPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <span className="eyebrow">Contact</span>
          <h1>Talk to a human.</h1>
          <p>
            Questions, ideas, press, partnerships or problems. We read everything
            and reply within one working day.
          </p>
        </div>
      </div>
      <section style={{ paddingTop: 24, paddingBottom: 80 }}>
        <div className="wrap">
          <div className="split">
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--line)",
                borderRadius: "var(--r-lg)",
                padding: 44,
              }}
            >
              <h3 style={{ fontSize: 22, marginBottom: 20 }}>Send us a message</h3>
              <form
                className="flex flex-col gap-3.5"
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
                action="mailto:hello@viralyz.com"
                method="get"
              >
                <input
                  className="c-input"
                  type="text"
                  name="subject"
                  placeholder="Your name"
                  aria-label="Your name"
                  required
                />
                <input
                  className="c-input"
                  type="email"
                  name="email"
                  placeholder="Your email"
                  aria-label="Your email"
                  required
                />
                <select className="c-input" aria-label="What is this about" defaultValue="">
                  <option value="" disabled>
                    What is this about?
                  </option>
                  <option>Help with my account</option>
                  <option>I am a brand</option>
                  <option>Press and media</option>
                  <option>Partnerships</option>
                  <option>Something else</option>
                </select>
                <textarea
                  className="c-input"
                  name="body"
                  rows={5}
                  placeholder="Tell us what you need"
                  aria-label="Your message"
                  required
                />
                <button
                  type="submit"
                  className="btn btn-violet"
                  style={{ alignSelf: "flex-start" }}
                >
                  Send message
                </button>
                <p style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
                  We only use your details to reply to you. See our{" "}
                  <Link href="/privacy" style={{ color: "var(--violet-deep)" }}>
                    privacy policy
                  </Link>
                  .
                </p>
              </form>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                {
                  h: "Support",
                  p: "Already a member? The fastest route is the chat bubble inside the app. Or email support@viralyz.com.",
                },
                {
                  h: "Brands and partnerships",
                  p: "Want to hire creators or work with us? Email brands@viralyz.com and we will set up a call.",
                },
                {
                  h: "Company",
                  p: "terms" as const,
                },
              ].map((item) => (
                <div
                  key={item.h}
                  style={{
                    background: "var(--tint)",
                    borderRadius: "var(--r-lg)",
                    padding: 32,
                  }}
                >
                  <h4 style={{ fontSize: 16, marginBottom: 6 }}>{item.h}</h4>
                  <p style={{ fontSize: 14, color: "var(--ink-2)" }}>
                    {item.p === "terms" ? (
                      <>
                        Viralyz is built by Digiteq Holdings Limited, Windsor,
                        United Kingdom. Company details are on our{" "}
                        <Link href="/terms" style={{ color: "var(--violet-deep)" }}>
                          terms page
                        </Link>
                        .
                      </>
                    ) : (
                      item.p
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
