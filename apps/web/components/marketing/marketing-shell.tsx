import { CookieBanner } from "@/components/marketing/cookie-banner";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";
import "@/app/marketing.css";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="vz">
      <SiteNav />
      {children}
      <SiteFooter />
      <CookieBanner />
    </div>
  );
}
