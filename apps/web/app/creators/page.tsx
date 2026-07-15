import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CreatorsBrowser } from "./creators-browser";

export const metadata: Metadata = {
  title: "Browse creators",
  description: "Search verified creators by score, niche, platform and followers.",
};

export default function CreatorsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <CreatorsBrowser />
      </main>
      <SiteFooter />
    </div>
  );
}
