import { cn } from "@/lib/cn";

export function Container({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-container px-4 md:px-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}
