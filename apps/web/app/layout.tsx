import type { Metadata, Viewport } from "next";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@repo/config";
import { ThemeProvider } from "@/components/theme-provider";
import { JsonLd } from "@/components/seo/JsonLd";
import { SanityLive } from "@/sanity/lib/live";
import { archivo } from "@/app/fonts";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${APP_NAME}. ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  other: {
    "color-scheme": "light dark",
  },
  alternates: {
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0B" },
  ],
  colorScheme: "light dark",
};

const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: APP_NAME,
  url: SITE_URL,
  parentOrganization: {
    "@type": "Organization",
    name: "Digiteq Holdings Limited",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDraft = (await draftMode()).isEnabled;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={archivo.variable}
    >
      <body className="antialiased">
        <ThemeProvider>
          <JsonLd data={orgLd} />
          {children}
          <SanityLive />
          {isDraft ? <VisualEditing /> : null}
        </ThemeProvider>
      </body>
    </html>
  );
}
