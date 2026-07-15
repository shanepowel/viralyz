import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Image as ImageIcon,
  Mic2,
  Wallet,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "For creators",
  description: "Score every video before you post, fix what's holding it back, and turn your track record into a media kit brands trust.",
};

const scoreBars = [
  { label: "Hook", value: 52, tone: "bg-rose-500" },
  { label: "Pacing", value: 81, tone: "bg-emerald-500" },
  { label: "Caption", value: 68, tone: "bg-amber-500" },
  { label: "Thumbnail", value: 90, tone: "bg-emerald-500" },
];

const features = [
  {
    icon: Zap,
    title: "Hook tester",
    description: "Ten opening lines for your idea, ranked by predicted score.",
  },
  {
    icon: Mic2,
    title: "Teleprompter",
    description: "Script feedback line by line while you record.",
  },
  {
    icon: ImageIcon,
    title: "Thumbnail tests",
    description: "See your thumbnail next to competitors at real feed size.",
  },
  {
    icon: Wallet,
    title: "Media kit builder",
    description: "A verified one-link profile brands can check in seconds.",
  },
  {
    icon: Calculator,
    title: "Rate calculator",
    description: "Suggested rates based on creators like you in your niche.",
  },
  {
    icon: BookOpen,
    title: "Creator academy",
    description: "Short courses on what actually moves your score.",
  },
];

const quotes = [
  {
    quote:
      "I stopped guessing. The score showed me my openings were the problem. Two weeks later a brand booked me straight from my media kit.",
    name: "Maya R.",
    meta: "Food · 214K",
  },
  {
    quote:
      "Verified numbers changed everything. Brands stopped asking me to prove my views — they could just see them.",
    name: "Amara D.",
    meta: "Beauty · 1.2M",
  },
  {
    quote: "The rate calculator gave me a number I could actually stand behind in negotiations.",
    name: "Owen G.",
    meta: "Food · 128K",
  },
];

export default function ForCreatorsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden px-6 py-24 md:py-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.15),_transparent_50%)]" />
          <div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
                For creators
              </span>
              <h1 className="mb-6 mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                Grow your <span className="gradient-text">score</span>. Get booked on proof.
              </h1>
              <p className="mb-8 max-w-xl text-lg text-muted-foreground">
                Score every video before you post, fix what&apos;s holding it back, and turn your
                track record into a media kit brands trust.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000"}>
                  <Button size="lg" className="glow">
                    Start scoring free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/#pricing">
                  <Button variant="outline" size="lg">
                    See pricing
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Free analyses every month. No card required.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="font-medium">morning-routine-v2.mp4</span>
                <span className="text-muted-foreground">
                  Score <span className="text-foreground">77 → 89</span>
                </span>
              </div>
              <div className="space-y-3">
                {scoreBars.map((bar) => (
                  <div key={bar.label} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-sm text-muted-foreground">{bar.label}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full ${bar.tone}`}
                        style={{ width: `${bar.value}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm text-muted-foreground">{bar.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2 text-sm">
                <span className="text-muted-foreground">
                  Fix: <span className="text-foreground">lead with the result, not the setup</span>
                </span>
                <span className="font-semibold text-primary">+12 pts</span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Everything you need <span className="gradient-text">to grow</span>
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border px-6 py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-sm font-medium text-primary">Get discovered</span>
              <h2 className="mb-4 mt-2 text-3xl font-bold md:text-4xl">
                A media kit that builds itself
              </h2>
              <p className="mb-6 text-muted-foreground">
                Real numbers pulled straight from TikTok, YouTube and Instagram — nothing
                self-reported. One link, and brands see the truth.
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">✓</span>
                  Verified numbers, taken directly from the platforms
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">✓</span>
                  A suggested rate card based on creators like you
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 text-primary">✓</span>
                  One link to share with any brand
                </li>
              </ul>
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

        <section className="border-t border-border px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
              What creators say
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {quotes.map((q) => (
                <div key={q.name} className="rounded-2xl border border-border bg-card p-6">
                  <blockquote className="mb-6 text-sm text-muted-foreground">
                    &ldquo;{q.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-accent text-xs font-bold text-primary-foreground">
                      {q.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{q.name}</div>
                      <div className="text-xs text-muted-foreground">{q.meta}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Your next post already has a <span className="gradient-text">score</span>
            </h2>
            <p className="mb-8 text-muted-foreground">
              Find out what it is, and what it could be. No card required to start.
            </p>
            <Link href={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000"}>
              <Button size="lg">
                Score my first video
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
