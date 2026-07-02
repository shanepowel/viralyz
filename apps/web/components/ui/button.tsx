import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-primary text-primary-foreground hover:bg-accent": variant === "default",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
          "border border-border bg-transparent hover:bg-secondary": variant === "outline",
          "hover:bg-secondary": variant === "ghost",
          "h-10 px-4 py-2 text-sm": size === "default",
          "h-8 rounded-md px-3 text-xs": size === "sm",
          "h-12 rounded-xl px-8 text-base": size === "lg",
        },
        className,
      )}
      {...props}
    />
  );
}
