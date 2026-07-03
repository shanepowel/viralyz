import Link from "next/link";
import { MARKETING_EYEBROW, MARKETING_HERO, MARKETING_PLATFORMS } from "@repo/config";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { ViralScorePreview } from "./viral-score-preview";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-16 md:pb-28 md:pt-24">
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-40" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">{MARKETING_EYEBROW}</span>
          </div>

          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
            {MARKETING_HERO.headline}{" "}
            <span className="text-gradient">{MARKETING_HERO.headlineAccent}</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {MARKETING_HERO.subhead}
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href={`${appUrl}/analyze`}>
              <Button size="lg" className="w-full sm:w-auto">
                {MARKETING_HERO.primaryCta}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href={`${appUrl}/analyze`}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Play className="h-4 w-4" />
                {MARKETING_HERO.secondaryCta}
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">{MARKETING_HERO.trustLine}</p>

          <div className="mt-10">
            <p className="text-eyebrow mb-4">{MARKETING_HERO.socialProof}</p>
            <div className="flex flex-wrap gap-3">
              {MARKETING_PLATFORMS.map((platform) => (
                <span
                  key={platform}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-sm font-medium text-muted-foreground"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute -left-8 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
          <ViralScorePreview />
        </div>
      </div>
    </section>
  );
}
