import { AppCtaLink } from "@/components/marketing/app-cta-link";
import { MARKETING_HERO } from "@repo/config";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-bold md:text-4xl">Ready to Stop Guessing?</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Join 10,000+ creators who know their content will perform before they post.
        </p>
        <AppCtaLink href="/analyze" size="lg" className="mt-8">
          {MARKETING_HERO.primaryCta}
          <ArrowRight className="h-5 w-5" />
        </AppCtaLink>
      </div>
    </section>
  );
}
