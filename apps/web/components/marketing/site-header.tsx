import Link from "next/link";
import { APP_NAME } from "@repo/config";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5000";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </a>
          <a href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href={`${appUrl}/api/login`}>
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href={`${appUrl}/analyze`}>
            <Button size="sm">Analyze free</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
