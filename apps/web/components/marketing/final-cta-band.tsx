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
    <section className={inverse ? "bg-inv" : "border-t border-rule"}>
      <div
        className={cn(
          "mx-auto grid max-w-site grid-cols-1 items-end gap-x-8 gap-y-6 px-[clamp(16px,4vw,40px)] py-[clamp(48px,7vw,88px)] lg:grid-cols-[1fr_auto]",
          inverse ? "text-inv-ink" : "text-ink",
        )}
      >
        <div>
        <h2 className="m-0 max-w-[860px] font-display text-[clamp(34px,5vw,64px)] text-balance">
          {title}
        </h2>
        {subtitle ? (
          <p
            className={cn(
              "m-0 mt-4 max-w-[600px]",
              inverse ? "text-inv-muted" : "text-ink-2",
            )}
          >
            {subtitle}
          </p>
        ) : null}
        </div>
        <div className="flex flex-wrap gap-2.5">
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
