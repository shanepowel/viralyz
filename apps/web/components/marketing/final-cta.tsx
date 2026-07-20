import { FinalCtaBand } from "@/components/marketing/final-cta-band";
import { routes } from "@/lib/site";

/** Back-compat wrapper used by existing pages. */
export function FinalCta({
  title,
  subtitle,
  cta = "Start free",
  href,
}: {
  title: string;
  subtitle: string;
  cta?: string;
  href?: string;
}) {
  return (
    <FinalCtaBand
      title={title}
      subtitle={subtitle}
      cta={cta}
      href={href ?? routes.signup}
    />
  );
}
