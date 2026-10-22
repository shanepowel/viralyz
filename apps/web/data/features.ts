import { appRoutes } from "@/lib/site";

export type Feature = {
  slug: string;
  /** Position in the loop, 1-based. */
  step: number;
  name: string;
  tagline: string;
  description: string;
  bullets: string[];
  /** What this stage refuses to claim, said plainly. */
  limits: string;
  appHref: string;
  appLabel: string;
};

// One entry per stage of the app's loop, in order. Each links to the app
// page that stage lives on (see `appRoutes`).
export const features: Feature[] = [
  {
    slug: "discover",
    step: 1,
    name: "Discover",
    tagline: "Find ads that have kept running, from official ad libraries.",
    description:
      "Search the Meta Ad Library (EU and UK) and TikTok's Commercial Content Library for ads in your category. An advertiser who keeps paying for an ad for weeks is telling you something, so we show how long each ad has run and how many variants it has. You can also save any ad or product page by link, or upload a screenshot.",
    bullets: [
      "Filter by category and by minimum days running",
      "See the source of every reference and open the original",
      "Save your own references by link or image upload",
      "Each reference is broken down into hook, offer and layout",
    ],
    limits:
      "Official libraries only cover the EU, the UK and approved TikTok markets, so US-only ads won't appear. Days running is a signal, not proof that an ad made money.",
    appHref: appRoutes.discover,
    appLabel: "Open Discover",
  },
  {
    slug: "brand-kit",
    step: 2,
    name: "Brand kit",
    tagline: "Paste your product page. Confirm what we found.",
    description:
      "Point Viralyz at a product page and it pulls your brand name, product title, price, images and colours. You check and correct the result before anything is generated, so every variant starts from facts you've confirmed.",
    bullets: [
      "Imports name, title, price, images and colours from a product URL",
      "Nothing generates until you confirm the brand kit",
      "Edit any field later; new variants use the update",
    ],
    limits:
      "Some shops hide product data from crawlers. If the import misses something, you fill it in by hand.",
    appHref: appRoutes.brand,
    appLabel: "Set up your brand",
  },
  {
    slug: "studio",
    step: 3,
    name: "Studio",
    tagline: "On-brand variants from a reference's structure, not its pixels.",
    description:
      "Pick a reference, choose the angles you want to test (offer, problem, proof or demo) and pick a placement. Studio writes the headline, primary text and call to action for your product, generates the image, and sets the text on top as real type so it stays sharp and checkable.",
    bullets: [
      "Up to four angles per run: offer, problem, proof, demo",
      "Placements: Meta feed 1:1 and 4:5, Stories 9:16, TikTok 9:16",
      "Each variant gets a tracking tag for matching results later",
      "Image prompts are screened before they reach the image model",
    ],
    limits:
      "We borrow a reference's structure, never its images, logos or wording. Prompts that ask for a real person's likeness, or for text painted into the image, are refused.",
    appHref: appRoutes.studio,
    appLabel: "Open Studio",
  },
  {
    slug: "pre-flight",
    step: 4,
    name: "Pre-flight checks",
    tagline: "Catch the fixable problems before you spend on them.",
    description:
      "Every variant is checked against the placement's published specs: text contrast, how much of the image is text, whether text sits inside the safe zone, aspect ratio, and headline and primary-text length. Claim checks flag before-and-after, health, income and personal-attribute wording that ad platforms restrict.",
    bullets: [
      "Measured checks against each platform's published ad specs",
      "Claim checks for wording ad platforms commonly reject",
      "An AI-assessed hook-clarity note, kept apart from the score",
      "Each check shows its evidence and the spec it was measured against",
    ],
    limits:
      "The headline score stays blank until at least four checks could actually run. It measures fitness to spec, not predicted sales, and the AI note never counts toward it.",
    appHref: appRoutes.creatives,
    appLabel: "See your creatives",
  },
  {
    slug: "results",
    step: 5,
    name: "Results & calibration",
    tagline: "Import what happened, and see how far to trust the checks.",
    description:
      "Export your ad results as a CSV from Ads Manager and import them. Viralyz matches rows to variants by their tracking tag, then compares pre-flight scores with real click-through rate across your own ads.",
    bullets: [
      "CSV import with impressions, clicks, spend, purchases and revenue",
      "Rows are matched to variants by tag, and unmatched rows are listed",
      "Rank correlation between pre-flight score and real CTR",
      "Re-importing replaces older numbers rather than double counting",
    ],
    limits:
      "Calibration stays blank until you have at least 20 matched ads with 1,000 or more impressions each. Below that, any correlation would be noise.",
    appHref: appRoutes.results,
    appLabel: "Open Results",
  },
];

export function getFeature(slug: string) {
  return features.find((f) => f.slug === slug);
}
