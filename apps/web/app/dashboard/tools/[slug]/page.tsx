import Link from "next/link";
import { TOOLS } from "@repo/config";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params;
  const tool = TOOLS.find((t) => t.href.endsWith(slug));

  if (!tool) {
    notFound();
  }

  return (
    <div className="p-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-2xl font-bold">{tool.name}</h1>
        <p className="mb-8 text-muted-foreground">{tool.description}</p>

        <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
          <p className="mb-2 text-lg font-medium">Coming soon</p>
          <p className="mb-6 text-sm text-muted-foreground">
            This tool is scaffolded and ready for AI integration. Connect your API
            keys in settings to enable full functionality.
          </p>
          <Button disabled>Use {tool.name}</Button>
        </div>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return TOOLS.map((tool) => ({
    slug: tool.id,
  }));
}
