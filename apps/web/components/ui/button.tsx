import { cn } from "@/lib/utils";

const variants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_40px_-8px_hsl(var(--primary)/0.6)]",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20",
  ghost: "hover:bg-white/[0.06] text-foreground",
} as const;

const sizes = {
  default: "h-10 px-5 text-sm",
  sm: "h-9 px-4 text-sm",
  lg: "h-12 px-8 text-base",
} as const;

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
