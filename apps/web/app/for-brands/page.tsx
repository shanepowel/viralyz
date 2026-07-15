import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, ListChecks, Search, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "For brands",
  description:
    "Search verified profiles by real performance, preview how content will score before it goes live, and book safely through the platform.",
};

const stats = [
  { value: "2,140", label: "Verified creators" },
  { value: "82%", label: "Prediction accuracy" },
  { value: "4.2×", label: "More views after fixes" },
  { value: "0%", label: "Self-reported stats" },
];

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Search & shortlist",
    description: "Filter by niche, score, platform and followers. Every number is verified, not self-reported.",
  },
  {
    icon: ListChecks,
    number: "02",
    title: "Brief & book",
    description: "Send a brief, agree scope and rate, and book directly — no back-and-forth over email.",
  },
  {
    icon: ShieldCheck,
    number: "03",
    title: "Score before it goes live",
    description: "Preview how content will perform before it's posted, and pay safely once it's delivered.",
  },
];

const cases = [
  {
    tag: "Food & bev",
    title: "3.1× ROAS from a 4-creator roster",
    description: "A snack brand booked four food creators through Viralyz and tracked return in real time.",
  },
  {
    tag: "Beauty",
    title: "Launch hit 1.2M views in a week",
    description: "Verified creator data let the team pick partners with proven hook strength.",
  },
  {
    tag: "Fitness app",
    title: "Cut creator sourcing time by 70%",
    description: "An agency used the campaign manager to run five clients' rosters from one dashboard.",
  },
];

export default function ForBrandsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden px-6 py-24 md:py-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.15),_transparent_50%)]" />
          <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
                For brands
              </span>
              <h1 className="mb-6 mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                Hire creators who can <span className="gradient-text">prove it</span>.
              </h1>
              <p className="mb-8 max-w-xl text-lg text-muted-foreground">
                Search verified profiles by real performance, see how content will score before it
                goes live, and pay safely through the platform.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/creators">
                  <Button size="lg" className="glow">
                    Search creators
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="#cases">
                  <Button variant="outline" size="lg">
                    See case studies
                  </Button>
                </a>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">2,140 verified creators, checked hourly.</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-accent text-sm font-bold text-primary-foreground">
                  MR
                </div>
                <div>
                  <div className="font-medium">Maya R.</div>
                  <div className="text-xs text-emerald-400">✓ Verified today</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Followers", value: "214K" },
                  { label: "Engagement", value: "6.8%" },
                  { label: "Avg views", value: "412K" },
                  { label: "Suggested rate", value: "$850" },
                ].map((cell) => (
                  <div key={cell.label} className="rounded-lg border border-border bg-background/50 p-3">
                    <div className="text-lg font-bold">{cell.value}</div>
                    <div className="text-xs text-muted-foreground">{cell.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border px-6 py-16">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold md:text-4xl">
                  <span className="gradient-text">{stat.value}</span>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <span className="text-sm font-medium text-primary">How campaigns work</span>
              <h2 className="mb-4 mt-2 text-3xl font-bold md:text-4xl">
                Brief, book, and pay in one place
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number}>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="mb-1 text-sm font-mono text-muted-foreground">{step.number}</div>
                  <h3 className="mb-2 font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cases" className="border-t border-border px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <span className="text-sm font-medium text-primary">Case studies</span>
              <h2 className="mb-4 mt-2 text-3xl font-bold md:text-4xl">Real campaign results</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {cases.map((c) => (
                <div key={c.title} className="rounded-2xl border border-border bg-card p-6">
                  <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {c.tag}
                  </span>
                  <h3 className="mb-2 font-semibold">{c.title}</h3>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Book your first creator <span className="gradient-text">this week</span>
            </h2>
            <p className="mb-8 text-muted-foreground">
              Search verified profiles and brief your first campaign in minutes.
            </p>
            <Link href="/creators">
              <Button size="lg">
                Search creators
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
