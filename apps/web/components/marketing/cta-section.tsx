import Link from "next/link";
import { MARKETING_HERO } from "@repo/config";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000";

export function CtaSection() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-bold md:text-4xl">Ready to Stop Guessing?</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
          Join 10,000+ creators who know their content will perform before they post.
        </p>
        <Link href={`${appUrl}/analyze`} className="mt-8 inline-block">
          <Button size="lg">
            {MARKETING_HERO.primaryCta}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
