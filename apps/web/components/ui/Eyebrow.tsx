import { cn } from "@/lib/cn";

/** Small panel-coloured pill that sits above a heading. */
export function Eyebrow({
  className,
  tone = "default",
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
  tone?: "default" | "inverse";
}) {
  return (
    <p
      className={cn(
        "flex w-fit items-center gap-2 rounded-full px-3 py-[5px] text-[13px] leading-snug",
        tone === "inverse" ? "bg-inv-raised text-inv-ink" : "bg-panel text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}
