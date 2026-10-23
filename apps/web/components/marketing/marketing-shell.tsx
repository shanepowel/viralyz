import { Toaster } from "sonner";
import { CookieBanner } from "@/components/marketing/cookie-banner";
import { SiteFooter } from "@/components/ui/SiteFooter";
import { SiteNav } from "@/components/ui/SiteNav";
import "@/app/marketing.css";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <SiteNav />
      <main id="main">{children}</main>
      <SiteFooter />
      <CookieBanner />
      <Toaster position="bottom-right" theme="system" closeButton />
    </div>
  );
}
