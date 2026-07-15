import Link from "next/link";
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_TAGLINE,
  PLANS,
  TOOLS,
} from "@repo/config";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  ArrowRight,
  Calendar,
  FileText,
  Hash,
  Image,
  MessageCircle,
  Store,
  TrendingUp,
  UserCircle,
  Users,
  Video,
  Zap,
} from "lucide-react";

const iconMap = {
  TrendingUp,
  FileText,
  Users,
  Video,
  UserCircle,
  Hash,
  Image,
  Calendar,
  MessageCircle,
  Store,
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden px-6 py-24 md:py-32">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.15),_transparent_50%)]" />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-primary" />
              Trusted by 20,000+ creators
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              <span className="gradient-text">{APP_TAGLINE}</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
              {APP_DESCRIPTION}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000"}>
              <Button size="lg" className="glow">
                Open Viralyz App
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
              <a href="#tools">
                <Button variant="outline" size="lg">
                  Explore Tools
                </Button>
              </a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required. Start with free credits.
            </p>
          </div>
        </section>

        <section className="border-t border-border px-6 py-16">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
            <Link
              href="/for-creators"
              className="group rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/50"
            >
              <span className="text-sm font-medium text-primary">For creators</span>
              <h3 className="mt-2 text-2xl font-bold">Grow your score. Get booked on proof.</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Score every video before you post, and turn your track record into a media kit
                brands trust.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Explore for creators
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="/for-brands"
              className="group rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/50"
            >
              <span className="text-sm font-medium text-primary">For brands</span>
              <h3 className="mt-2 text-2xl font-bold">Hire creators who can prove it.</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Search verified profiles by real performance and book campaigns safely through the
                platform.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Explore for brands
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </section>

        <section id="tools" className="border-t border-border px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                10 Tools. <span className="gradient-text">In One Place.</span>
              </h2>
              <p className="text-muted-foreground">
                Everything you need to create, analyze, grow, and monetize.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {TOOLS.map((tool) => {
                const Icon = iconMap[tool.icon as keyof typeof iconMap];
                return (
                  <div
                    key={tool.id}
                    className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 font-semibold">{tool.name}</h3>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="pricing" className="border-t border-border px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Simple, <span className="gradient-text">creator-first</span> pricing
              </h2>
              <p className="text-muted-foreground">
                Start free. Upgrade when you&apos;re ready to scale.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-6 ${
                    plan.popular
                      ? "border-primary bg-card glow"
                      : "border-border bg-card"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                      Most Popular
                    </span>
                  )}
                  <h3 className="mb-1 text-lg font-semibold">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">
                      {plan.priceMonthly === 0 ? "Free" : `$${plan.priceMonthly}`}
                    </span>
                    {plan.priceMonthly > 0 && (
                      <span className="text-muted-foreground">/mo</span>
                    )}
                  </div>
                  <ul className="mb-6 space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1 text-primary">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/dashboard" className="block">
                    <Button
                      variant={plan.popular ? "default" : "outline"}
                      className="w-full"
                    >
                      {plan.priceMonthly === 0 ? "Get Started" : "Subscribe"}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Ready to create <span className="gradient-text">viral content?</span>
            </h2>
            <p className="mb-8 text-muted-foreground">
              Join thousands of creators using {APP_NAME} to grow their audience.
            </p>
            <Link href="/dashboard">
              <Button size="lg">
                Get Started, It&apos;s Free!
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
