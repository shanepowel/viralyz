import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 font-medium transition-colors duration-[var(--dur-fast)] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-foreground shadow-sm hover:bg-accent-hover",
        secondary:
          "border border-line bg-raised text-ink shadow-sm hover:border-line-strong",
        ghost: "text-ink-secondary hover:bg-sunken hover:text-ink",
        link: "h-auto p-0 text-accent underline underline-offset-4 hover:text-accent-hover",
        danger: "bg-score-low text-white shadow-sm hover:opacity-90",
      },
      size: {
        sm: "h-9 rounded-sm px-3.5 text-sm",
        md: "h-11 rounded-sm px-5 text-sm",
        lg: "h-12 rounded-md px-6 text-base",
        icon: "size-9 rounded-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export const buttonClasses = buttonVariants;
export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
