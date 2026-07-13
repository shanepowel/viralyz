import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import type { CSSProperties } from "react";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@repo/config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME}. ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "viral score",
    "creator tools",
    "TikTok",
    "Instagram Reels",
    "YouTube Shorts",
    "media kit",
    "content scoring",
  ],
  openGraph: {
    title: `${APP_NAME}. ${APP_TAGLINE}`,
    description: APP_DESCRIPTION,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${bricolage.variable} ${jetbrains.variable} antialiased`}
        style={
          {
            ["--font-sans"]: "var(--font-inter)",
            ["--font-display"]: "var(--font-bricolage)",
            ["--font-mono"]: "var(--font-jetbrains)",
          } as CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
