import { redirect } from "next/navigation";
import { APP_TOOL_ROUTES } from "@repo/config/app-routes";
import { appRedirectPath } from "@/lib/app-url";
import { TOOLS, type ToolId } from "@repo/config";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ToolRedirectPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = TOOLS.find((t) => t.id === slug);

  if (!tool) {
    notFound();
  }

  const appPath = APP_TOOL_ROUTES[tool.id as ToolId] ?? "/";
  redirect(appRedirectPath(appPath));
}

export function generateStaticParams() {
  return TOOLS.map((tool) => ({
    slug: tool.id,
  }));
}
