import { CasesSection } from "@/components/marketing/cases-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { SpineSection } from "@/components/marketing/spine-section";
import { ToolsSection } from "@/components/marketing/tools-section";

/** Six sections — Part 2 craft rules */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <SiteHeader />
      <main>
        <HeroSection />
        <SpineSection />
        <ToolsSection />
        <CasesSection />
        <PricingSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
