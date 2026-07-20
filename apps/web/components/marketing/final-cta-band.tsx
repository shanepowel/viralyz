"use client";

import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";
import { routes } from "@/lib/site";

export function FinalCtaBand({
  title,
  subtitle,
  cta = "Start free",
  href = routes.signup,
  secondary,
}: {
  title: string;
  subtitle: string;
  cta?: string;
  href?: string;
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="bg-sunken py-16 md:py-24">
      <div className="mx-auto max-w-container px-4 text-center md:px-6">
        <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-ink">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-prose text-base text-ink-secondary leading-relaxed">
          {subtitle}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={href}
            className={cn(buttonClasses({ variant: "primary", size: "lg" }))}
            onClick={() => track("cta_start_free", { location: "section" })}
          >
            {cta}
          </a>
          {secondary ? (
            <Link
              href={secondary.href}
              className={buttonClasses({ variant: "secondary", size: "lg" })}
            >
              {secondary.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
