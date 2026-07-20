export type ToolDef = {
  slug: string;
  name: string;
  description: string;
  live: boolean;
};

export const tools: ToolDef[] = [
  {
    slug: "engagement-calculator",
    name: "Engagement rate calculator",
    description:
      "Work out any account's true engagement rate in seconds. No account needed.",
    live: true,
  },
  {
    slug: "thumbnail-checker",
    name: "Thumbnail checker",
    description:
      "See your thumbnail at real feed size and find out if anyone can read it.",
    live: true,
  },
  {
    slug: "best-time-to-post",
    name: "Best time to post",
    description: "Best posting times by platform and niche, updated monthly.",
    live: false,
  },
  {
    slug: "fake-follower-checker",
    name: "Fake follower checker",
    description:
      "Check whether an account's audience is real before you work with them.",
    live: false,
  },
  {
    slug: "influencer-price-calculator",
    name: "Influencer price calculator",
    description:
      "A fair price range for any creator, based on real booking data.",
    live: false,
  },
];

export const liveTools = () => tools.filter((t) => t.live);

export function getTool(slug: string) {
  return tools.find((t) => t.slug === slug);
}
