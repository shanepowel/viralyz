import { cn } from "@/lib/cn";

/** The single black panel a page gets, for its one high-emphasis moment. */
export function InversePanel({
  className,
  children,
  as: Tag = "div",
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: "div" | "section" }) {
  return (
    <div className="px-[clamp(12px,2vw,24px)] pb-6">
      <Tag
        className={cn(
          "mx-auto max-w-wide rounded-panel bg-inv px-[clamp(20px,5vw,72px)] py-[clamp(48px,7vw,88px)] text-inv-ink",
          className,
        )}
        {...props}
      >
        {children}
      </Tag>
    </div>
  );
}
