import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "Cookies used on Viralyz and how to manage them.",
};

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
