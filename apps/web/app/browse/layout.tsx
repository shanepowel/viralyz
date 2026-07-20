import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse creators",
  description:
    "Verified creators with live scores and upfront prices. Creators keep 100%.",
};

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
