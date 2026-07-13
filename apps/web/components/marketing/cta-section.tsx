import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import { APP_NAME } from "@repo/config";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000";

export function CtaSection() {
  return (
    <section className="border-t border-[var(--border-subtle)] px-6 py-24 md:py-[var(--s-24)]">
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[var(--r-xl)] px-8 py-16 text-center">
        <div className="pointer-events-none absolute inset-0 signal-atmosphere opacity-90" />
        <div className="relative">
          <h2 className="text-display mb-4 text-[28px] font-semibold md:text-[40px]">
            Build your verified track record
          </h2>
          <p className="mx-auto mb-8 max-w-md text-[15px] text-[var(--text-secondary)]">
            Score your next draft in under a minute. Every analysis makes{" "}
            {APP_NAME} smarter about you — and your media kit stronger for
            brands.
          </p>
          <Button size="lg" asChild>
            <Link href={APP_URL}>
              Open {APP_NAME}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
