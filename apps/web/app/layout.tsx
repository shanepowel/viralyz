import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { APP_DESCRIPTION, APP_NAME } from "@repo/config";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — AI toolkit for short-form creators`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "viral content",
    "short-form video",
    "Instagram",
    "TikTok",
    "YouTube Shorts",
    "AI content tools",
    "creator tools",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
