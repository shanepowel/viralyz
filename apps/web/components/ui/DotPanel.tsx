import { cn } from "@/lib/cn";

/** A white sheet with an ink frame, for product showcases. */
export function DotPanel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border border-rule bg-card p-[clamp(20px,4vw,48px)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
