import Link from "next/link";
import { APP_NAME } from "@repo/config";
import { AppCtaLink } from "@/components/marketing/app-cta-link";
import { TrendingUp } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col items-center justify-between gap-8 md:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="font-display font-semibold">{APP_NAME}</span>
          </Link>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="hover:text-foreground">
              Pricing
            </a>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </div>
          <AppCtaLink href="/analyze" size="sm">
            Analyze free
          </AppCtaLink>
        </div>
        <p className="text-center text-sm text-muted-foreground md:text-left">
          © {new Date().getFullYear()} {APP_NAME}. Know your content will go viral before you post.
        </p>
      </div>
    </footer>
  );
}
