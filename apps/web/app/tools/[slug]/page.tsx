import type { Metadata } from "next";
import Link from "next/link";
import { LinkScorer } from "@/components/marketing/link-scorer";
import { MarketingShell } from "@/components/marketing/marketing-shell";

type ToolMeta = {
  title: string;
  description: string;
  heading: string;
  body: string;
};

const TOOLS: Record<string, ToolMeta> = {
  "fake-follower-checker": {
    title: "Fake follower checker",
    description:
      "Check whether an account's audience is real before you work with them.",
    heading: "Fake follower checker",
    body: "Paste a handle and we will flag patterns that look inflated. Full checker ships with the first data release. Until then, score their content instead.",
  },
  "influencer-price-calculator": {
    title: "Influencer price calculator",
    description:
      "A fair price range for any creator, based on real booking data.",
    heading: "Influencer price calculator",
    body: "Fair ranges from verified bookings are coming with the Viral Score Report. Meanwhile, browse creators with upfront package prices.",
  },
  "best-time-to-post": {
    title: "Best time to post",
    description: "Best posting times by platform and niche, updated monthly.",
    heading: "Best time to post",
    body: "Niche calendars update monthly once we have enough scored posts. Score your own content to learn your audience's hours first.",
  },
  "thumbnail-checker": {
    title: "Thumbnail checker",
    description:
      "See your thumbnail at real feed size and find out if anyone can read it.",
    heading: "Thumbnail checker",
    body: "Upload lands in Thumbnail Studio inside the app. Paste a link below to score the whole piece of content, visuals included.",
  },
};

export function generateStaticParams() {
  return Object.keys(TOOLS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = TOOLS[slug];
  if (!tool) return { title: "Free tool" };
  return { title: tool.title, description: tool.description };
}

export default async function ToolStubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = TOOLS[slug];
  if (!tool) {
    return (
      <MarketingShell>
        <div className="wrap page-hero">
          <h1>Tool not found</h1>
          <p>
            <Link href="/tools" style={{ color: "var(--violet-deep)" }}>
              Back to free tools
            </Link>
          </p>
        </div>
      </MarketingShell>
    );
  }

  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <span className="eyebrow">Free tools</span>
          <h1>{tool.heading}</h1>
          <p>{tool.body}</p>
        </div>
        {slug === "influencer-price-calculator" ? (
          <p style={{ marginBottom: 32 }}>
            <Link className="btn btn-violet" href="/browse">
              Browse creators with prices
            </Link>
          </p>
        ) : null}
        <div className="sec-head" style={{ marginBottom: 24 }}>
          <span className="eyebrow">Try this now</span>
          <h2>Paste a link. Get a score.</h2>
        </div>
        <LinkScorer />
        <p style={{ margin: "28px 0 80px", fontSize: 13.5, color: "var(--ink-3)" }}>
          <Link href="/tools" style={{ color: "var(--violet-deep)" }}>
            ← All free tools
          </Link>
        </p>
      </div>
    </MarketingShell>
  );
}
