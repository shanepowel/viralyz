import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@repo/config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "viral content",
    "viral score",
    "TikTok",
    "YouTube Shorts",
    "Instagram Reels",
    "content analysis",
    "creator tools",
  ],
  openGraph: {
    title: `${APP_NAME} — ${APP_TAGLINE}`,
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
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} antialiased aurora-bg min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
