"use client";

import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";
import { routes } from "@/lib/site";

/**
 * Closing call to action. Inverse (black) by default — a page's one inverse
 * panel. Use tone="panel" on a page whose inverse moment is elsewhere.
 */
export function FinalCtaBand({
  title,
  subtitle,
  cta = "Get started free",
  href = routes.signup,
  secondary,
  tone = "inverse",
}: {
  title: string;
  subtitle?: string;
  cta?: string;
  href?: string;
  secondary?: { href: string; label: string };
  tone?: "inverse" | "panel";
}) {
  const inverse = tone === "inverse";
  return (
    <section className="px-[clamp(12px,2vw,24px)] pb-6">
      <div
        className={cn(
          "mx-auto flex max-w-wide flex-col items-center gap-5 rounded-panel px-[clamp(20px,5vw,72px)] py-[clamp(48px,7vw,96px)] text-center",
          inverse ? "bg-inv text-inv-ink" : "bg-panel text-ink",
        )}
      >
        <h2 className="m-0 max-w-[860px] font-display text-[clamp(34px,4.6vw,56px)]">
          {title}
        </h2>
        {subtitle ? (
          <p
            className={cn(
              "m-0 max-w-[600px]",
              inverse ? "text-inv-muted" : "text-muted",
            )}
          >
            {subtitle}
          </p>
        ) : null}
        <div className="flex flex-wrap justify-center gap-2.5">
          <ButtonLink
            href={href}
            size="lg"
            variant={inverse ? "inverse" : "primary"}
            onClick={() => track("cta_start_free", { location: "section" })}
          >
            {cta}
          </ButtonLink>
          {secondary ? (
            <ButtonLink
              href={secondary.href}
              size="lg"
              variant={inverse ? "inverse-secondary" : "secondary"}
            >
              {secondary.label}
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
