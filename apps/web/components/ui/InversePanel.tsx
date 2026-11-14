import { cn } from "@/lib/cn";

/** The single black panel a page gets, for its one high-emphasis moment. */
export function InversePanel({
  className,
  children,
  as: Tag = "div",
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: "div" | "section" }) {
  return (
    <div className="bg-inv">
      <Tag
        className={cn(
          "mx-auto max-w-site px-[clamp(16px,4vw,40px)] py-[clamp(48px,7vw,88px)] text-inv-ink",
          className,
        )}
        {...props}
      >
        {children}
      </Tag>
    </div>
  );
}
