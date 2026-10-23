import { cn } from "@/lib/cn";

export function Container({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-site px-[clamp(16px,4vw,40px)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
