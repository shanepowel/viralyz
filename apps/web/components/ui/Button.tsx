import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const button = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-[var(--dur-fast)] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-white hover:bg-accent-hover shadow-sm",
        secondary:
          "bg-raised text-ink border border-line hover:border-line-strong shadow-sm",
        ghost: "text-ink-secondary hover:text-ink hover:bg-sunken",
        link: "text-accent underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-9 px-3.5 text-sm rounded-sm",
        md: "h-11 px-5 text-sm rounded-sm",
        lg: "h-12 px-6 text-base rounded-md",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

export function Button({ className, variant, size, ...props }: Props) {
  return (
    <button className={cn(button({ variant, size }), className)} {...props} />
  );
}

export const buttonClasses = button;
