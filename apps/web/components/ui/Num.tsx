import { cn } from "@/lib/cn";

export function Num({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("font-mono tabular-nums tracking-tight", className)}>
      {children}
    </span>
  );
}
