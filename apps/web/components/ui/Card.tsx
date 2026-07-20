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
        "bg-raised border border-line rounded-md shadow-sm",
        hoverable &&
          "transition-[box-shadow,transform] duration-[var(--dur-med)] ease-out hover:shadow-md motion-safe:hover:-translate-y-0.5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
