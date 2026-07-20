import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTool } from "@/data/tools";
import { pageMeta } from "@/lib/meta";

type Params = Promise<{ slug: string }>;

/**
 * Catch-all for tool slugs without a dedicated page.
 * Live tools have their own routes; non-live tools are not linked and 404 here.
 */
export function generateStaticParams() {
  return [] as { slug: string }[];
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool || !tool.live) return { title: "Tool" };
  return pageMeta({
    title: tool.name,
    description: tool.description,
    path: `/tools/${tool.slug}`,
  });
}

export default async function ToolSlugFallback({
  params,
}: {
  params: Params;
}) {
  void (await params);
  notFound();
}
