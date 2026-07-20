import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { ContactForm } from "@/components/marketing/contact-form";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { pageMeta } from "@/lib/meta";
import { routes } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Contact",
  description:
    "Questions, ideas, press, partnerships or problems. We reply within one working day.",
  path: routes.contact,
});

export default function ContactPage() {
  return (
    <MarketingShell>
      <div className="pt-12 md:pt-16 pb-20">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Contact" },
            ]}
          />
          <Eyebrow>Contact</Eyebrow>
          <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold tracking-tight text-ink">
            Talk to a human.
          </h1>
          <p className="mt-4 max-w-prose text-ink-secondary leading-relaxed">
            Questions, ideas, press, partnerships or problems. We read
            everything and reply within one working day.
          </p>

          <div
            id="help"
            className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]"
          >
            <Card className="p-6 md:p-8">
              <h2 className="text-lg font-semibold text-ink mb-5">
                Send us a message
              </h2>
              <ContactForm />
            </Card>
            <div className="space-y-4">
              {[
                {
                  h: "General",
                  p: (
                    <>
                      Email{" "}
                      <a
                        href="mailto:hello@viralyz.com"
                        className="text-accent hover:underline"
                      >
                        hello@viralyz.com
                      </a>
                      .
                    </>
                  ),
                },
                {
                  h: "Partnerships & brands",
                  p: (
                    <>
                      Email{" "}
                      <a
                        href="mailto:partnerships@viralyz.com"
                        className="text-accent hover:underline"
                      >
                        partnerships@viralyz.com
                      </a>{" "}
                      and we will set up a call.
                    </>
                  ),
                },
                {
                  h: "Help",
                  p: (
                    <>
                      Guides are coming. Until then, use this form or check{" "}
                      <Link href={routes.pricing} className="text-accent hover:underline">
                        pricing FAQ
                      </Link>
                      .
                    </>
                  ),
                },
              ].map((item) => (
                <Card key={item.h} className="p-5 bg-sunken border-transparent shadow-none">
                  <h3 className="text-base font-semibold text-ink">{item.h}</h3>
                  <p className="mt-1 text-sm text-ink-secondary">{item.p}</p>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </MarketingShell>
  );
}
