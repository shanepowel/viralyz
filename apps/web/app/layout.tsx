import type { Metadata } from "next";
import {
  Manrope,
  Sora,
  JetBrains_Mono,
} from "next/font/google";
import type { CSSProperties } from "react";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@repo/config";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["500", "600", "700", "800"],
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
        className={`${manrope.variable} ${sora.variable} ${jetbrains.variable} antialiased`}
        style={
          {
            ["--font-sans"]: "var(--font-manrope)",
            ["--font-display"]: "var(--font-sora)",
            ["--font-mono"]: "var(--font-jetbrains)",
          } as CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
