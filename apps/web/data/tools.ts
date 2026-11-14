export type ToolDef = {
  slug: string;
  name: string;
  description: string;
  live: boolean;
};

export const tools: ToolDef[] = [
  {
    slug: "safe-zone-checker",
    name: "Safe-zone checker",
    description:
      "Drop in a 9:16 ad and see what Meta Stories, Reels and TikTok will draw on top of it.",
    live: true,
  },
  {
    slug: "ad-readability-checker",
    name: "Ad readability checker",
    description:
      "Get the contrast ratio for your text, and see your ad at the size people see it in a feed.",
    live: true,
  },
];

export const liveTools = () => tools.filter((t) => t.live);

export function getTool(slug: string) {
  return tools.find((t) => t.slug === slug);
}
