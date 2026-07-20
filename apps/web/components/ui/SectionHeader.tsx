import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/ui/Eyebrow";

export function SectionHeader({
  eyebrow,
  title,
  lede,
  className,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-prose mb-10 md:mb-12", className)}>
      {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
      <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-ink">
        {title}
      </h2>
      {lede ? (
        <p className="mt-3 text-base text-ink-secondary leading-relaxed">
          {lede}
        </p>
      ) : null}
    </div>
  );
}
