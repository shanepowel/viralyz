import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie policy",
  description:
    "What Viralyz stores on your device, why, and how to say no.",
};

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
