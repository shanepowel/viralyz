import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/** Pill button. Every size keeps a 44px+ touch target. */
const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-[opacity,background-color,border-color] duration-[var(--vz-dur-fast)] ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-btn text-btn-ink font-semibold hover:opacity-85",
        secondary:
          "border border-line bg-bg text-ink hover:border-muted",
        inverse:
          "bg-inv-ink text-inv font-semibold hover:opacity-90 focus-visible:outline-inv-ink",
        "inverse-secondary":
          "border border-inv-line text-inv-ink hover:border-inv-muted focus-visible:outline-inv-ink",
        ghost: "text-muted hover:bg-panel hover:text-ink",
        link: "h-auto min-h-0 p-0 text-ink underline underline-offset-4 hover:text-muted",
      },
      size: {
        sm: "min-h-11 px-4 text-[15px]",
        md: "min-h-11 px-5 text-[15px]",
        lg: "min-h-13 px-[26px] text-base",
      },
    },
    compoundVariants: [{ variant: "link", class: "min-h-0 px-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonVariants = VariantProps<typeof button>;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonVariants;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(button({ variant, size }), className)} {...props} />
  );
}

type ButtonLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonVariants & { href: string };

/** The same pill rendered as a link. Internal paths use next/link. */
export function ButtonLink({
  className,
  variant,
  size,
  href,
  ...props
}: ButtonLinkProps) {
  const classes = cn(button({ variant, size }), className);
  if (href.startsWith("/") && !href.startsWith("//")) {
    return <Link href={href} className={classes} {...props} />;
  }
  return <a href={href} className={classes} {...props} />;
}

export const buttonClasses = button;
