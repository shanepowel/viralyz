import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppCtaLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
};

/** Internal marketing CTA — renders a real link, not a button inside a link. */
export function AppCtaLink({
  href,
  children,
  className,
  variant = "default",
  size = "default",
}: AppCtaLinkProps) {
  return (
    <Link
      href={href}
      className={cn(buttonStyles({ variant, size }), className)}
    >
      {children}
    </Link>
  );
}
