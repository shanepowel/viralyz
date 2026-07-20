import { CookieBanner } from "@/components/marketing/cookie-banner";
import { Header } from "@/components/chrome/Header";
import { Footer } from "@/components/chrome/Footer";
import { Toaster } from "sonner";
import "@/app/marketing.css";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CookieBanner />
      <Toaster position="bottom-right" theme="system" richColors closeButton />
    </div>
  );
}
