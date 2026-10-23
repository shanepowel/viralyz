import { FinalCtaBand } from "@/components/marketing/final-cta-band";
import { routes } from "@/lib/site";

/** Back-compat wrapper used by existing pages. */
export function FinalCta({
  title,
  subtitle,
  cta = "Get started free",
  href,
  secondary,
  tone,
}: {
  title: string;
  subtitle?: string;
  cta?: string;
  href?: string;
  secondary?: { href: string; label: string };
  tone?: "inverse" | "panel";
}) {
  return (
    <FinalCtaBand
      title={title}
      subtitle={subtitle}
      cta={cta}
      href={href ?? routes.signup}
      secondary={secondary}
      tone={tone}
    />
  );
}
