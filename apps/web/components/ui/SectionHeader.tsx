import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * Section opener: an ink rule, the label in the left margin and the heading
 * beside it. Left-aligned by default; "center" is kept for the few closing
 * bands that still centre.
 */
export function SectionHeader({
  eyebrow,
  title,
  lede,
  align = "left",
  as: Heading = "h2",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "center" | "left";
  as?: "h1" | "h2";
  className?: string;
}) {
  const h1 = Heading === "h1";
  if (align === "center") {
    return (
      <div className={cn("mb-9 flex flex-col items-center gap-3.5 text-center", className)}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Heading className={cn("m-0 font-display text-ink", h1 ? "max-w-[1000px] text-[clamp(40px,6vw,76px)]" : "max-w-[820px] text-[clamp(30px,4vw,48px)]")}>
          {title}
        </Heading>
        {lede ? <p className={cn("m-0 max-w-[600px] text-ink-2", h1 && "text-[19px]")}>{lede}</p> : null}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "mb-9 grid w-full grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-[200px_1fr]",
        h1 ? "pt-2" : "border-t border-rule pt-4",
        className,
      )}
    >
      <div className="pt-1.5">{eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}</div>
      <div className="min-w-0">
        <Heading
          className={cn(
            "m-0 font-display text-ink text-balance",
            h1 ? "max-w-[980px] text-[clamp(40px,6vw,76px)]" : "max-w-[820px] text-[clamp(30px,4vw,48px)]",
          )}
        >
          {title}
        </Heading>
        {lede ? (
          <p className={cn("m-0 mt-4 max-w-[640px] text-ink-2", h1 && "text-[19px]")}>{lede}</p>
        ) : null}
      </div>
    </div>
  );
}
