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
        "bg-card border border-line rounded-inner",
        hoverable &&
          "transition-[box-shadow,transform] duration-[var(--vz-dur-med)] ease-out hover:shadow-float motion-safe:hover:-translate-y-0.5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
