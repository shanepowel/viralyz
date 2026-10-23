import { cn } from "@/lib/cn";
import { Eyebrow } from "@/components/ui/Eyebrow";

/** Centred eyebrow, heading and optional subheading: the default section opener. */
export function SectionHeader({
  eyebrow,
  title,
  lede,
  align = "center",
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
  const centred = align === "center";
  return (
    <div
      className={cn(
        "mb-9 flex flex-col gap-3.5",
        centred ? "items-center text-center" : "items-start",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading
        className={cn(
          "m-0 font-display text-ink",
          Heading === "h1"
            ? "max-w-[1000px] text-[clamp(42px,6.4vw,84px)]"
            : "max-w-[820px] text-[clamp(34px,4.6vw,56px)]",
        )}
      >
        {title}
      </Heading>
      {lede ? (
        <p
          className={cn(
            "m-0 max-w-[600px] text-muted",
            Heading === "h1" && "text-[19px]",
          )}
        >
          {lede}
        </p>
      ) : null}
    </div>
  );
}
