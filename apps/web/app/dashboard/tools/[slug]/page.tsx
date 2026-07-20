import { redirect } from "next/navigation";
import { TOOLS, getPublicAppPath, getPublicAppUrl } from "@repo/config";

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = TOOLS.find((t) => t.id === slug || t.href.endsWith(slug));
  redirect(tool ? getPublicAppPath(tool.href) : getPublicAppUrl());
}

export function generateStaticParams() {
  return TOOLS.map((tool) => ({
    slug: tool.id,
  }));
}
