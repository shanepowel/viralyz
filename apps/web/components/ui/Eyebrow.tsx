import { cn } from "@/lib/cn";

/** Small mono caps label that sits above a heading. */
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
        "kicker flex w-fit items-center gap-2",
        tone === "inverse" ? "text-inv-muted" : "",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}
