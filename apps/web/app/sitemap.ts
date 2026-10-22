import type { MetadataRoute } from "next";
import { routes } from "@/lib/site";
import { features } from "@/data/features";
import { PLACEHOLDER_POSTS } from "@/lib/blog";

const SITE = "https://www.viralyz.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const statics = [
    routes.home,
    routes.platform,
    routes.pricing,
    routes.blog,
    routes.about,
    routes.trust,
    routes.changelog,
    routes.contact,
    routes.privacy,
    routes.terms,
    routes.cookies,
  ].map((p) => ({
    url: `${SITE}${p === "/" ? "" : p}`,
    changeFrequency: "weekly" as const,
  }));

  return [
    ...statics,
    ...features.map((f) => ({
      url: `${SITE}/platform/${f.slug}`,
      changeFrequency: "monthly" as const,
    })),
    ...PLACEHOLDER_POSTS.map((p) => ({
      url: `${SITE}/blog/${p.slug}`,
      lastModified: p.publishedAt,
    })),
  ];
}
