import { cn } from "@/lib/cn";

export function Eyebrow({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm font-medium text-accent", className)}
      {...props}
    >
      {children}
    </p>
  );
}
