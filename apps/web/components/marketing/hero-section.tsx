"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ScoreRing } from "@repo/ui/score-ring";
import { APP_NAME, APP_TAGLINE, getPublicAppUrl } from "@repo/config";

const APP_URL = getPublicAppUrl();

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-16 md:pb-28 md:pt-24">
      <div className="pointer-events-none absolute inset-0 signal-atmosphere" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <p className="text-micro mb-5 text-[var(--accent)] animate-fade-up">
            {APP_NAME}
          </p>
          <h1 className="text-display animate-fade-up-delay-1 mb-5 text-[40px] font-semibold leading-[1.05] tracking-tight md:text-[64px]">
            {APP_TAGLINE}
          </h1>
          <p className="animate-fade-up-delay-2 mb-8 max-w-md text-[15px] leading-relaxed text-[var(--text-secondary)] md:text-lg md:leading-relaxed">
            One Viral Score spine. Every tool reads and writes the same content
            graph — so your growth becomes a verified track record.
          </p>
          <div className="animate-fade-up-delay-3 flex flex-wrap items-center gap-3">
            <Button size="lg" asChild>
              <Link href={APP_URL}>
                Start free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#spine">See the score</a>
            </Button>
          </div>
        </div>

        <div
          className="animate-fade-up-delay-2 relative flex min-h-[320px] items-center justify-center md:min-h-[420px]"
          aria-hidden={false}
        >
          <div className="absolute inset-0 rounded-[var(--r-xl)] bg-[radial-gradient(circle_at_center,rgba(124,92,255,0.12),transparent_65%)]" />
          <div className="score-pulse relative rounded-full">
            <ScoreRing
              score={87}
              size={200}
              label="Viral Score"
              components={{
                hook: 92,
                visual: 84,
                structure: 88,
                metadata: 79,
                timing: 86,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
