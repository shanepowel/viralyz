import { cn } from "@/lib/cn";

export function Card({
  className,
  hoverable,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hoverable?: boolean }) {
  return (
    <div
      className={cn(
        "border border-rule bg-card",
        hoverable &&
          "transition-colors duration-[var(--vz-dur-fast)] hover:bg-panel",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
