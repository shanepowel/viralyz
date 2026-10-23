import { cn } from "@/lib/cn";

/** Bordered, panel-coloured container with the dot-grid texture, for product showcases. */
export function DotPanel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "dots rounded-panel border border-line bg-panel p-[clamp(24px,5vw,64px)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
