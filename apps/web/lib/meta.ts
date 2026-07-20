import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

const DEFAULT_OG = `${SITE_URL}/og/default.png`;

export function pageMeta({
  title,
  description,
  path,
  ogImage = DEFAULT_OG,
  robots,
  article,
}: {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  robots?: Metadata["robots"];
  article?: { publishedTime?: string };
}): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots,
    openGraph: {
      title,
      description,
      url,
      siteName: "Viralyz",
      type: article ? "article" : "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
      ...(article?.publishedTime
        ? { publishedTime: article.publishedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
