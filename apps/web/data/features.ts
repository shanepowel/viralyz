import { APP_URL } from "@/lib/site";

export type Feature = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  bullets: string[];
  appHref: string;
};

export const features: Feature[] = [
  {
    slug: "viral-score",
    name: "Viral Score",
    tagline: "Know how your content will do. Before you post it.",
    description:
      "Every post gets a score out of 100 across five areas: opening, visuals, pacing, words and timing. Each note comes with a fix and shows how many points it is worth.",
    bullets: [
      "Score in under 30 seconds from a file or a link",
      "Five factor breakdown with a fix for each weak area",
      "Rescore after each fix and watch the number move",
    ],
    appHref: `${APP_URL}/analyze`,
  },
  {
    slug: "hook-lab",
    name: "Hook Lab",
    tagline: "Ten opening lines for any idea, ranked.",
    description:
      "Your first three seconds decide everything. Hook Lab gives you ten opening lines for any idea, each scored against what has worked for audiences like yours.",
    bullets: [
      "Ten ranked openings per idea",
      "Plain-language notes on why each line works or fails",
      "Pick one, paste it into Script Doctor, and keep scoring",
    ],
    appHref: `${APP_URL}/hook-lab`,
  },
  {
    slug: "script-doctor",
    name: "Script Doctor",
    tagline: "Line-by-line script feedback, with a teleprompter built in.",
    description:
      "Paste your script and get feedback line by line: weak opening, buried point, missing call to action. Accept a fix and watch your score move. A teleprompter view helps you deliver while you record.",
    bullets: [
      "Line-by-line notes with suggested rewrites",
      "Teleprompter mode for recording",
      "Captions and hashtags as part of the same rewrite pass",
    ],
    appHref: `${APP_URL}/caption-studio`,
  },
  {
    slug: "thumbnail-studio",
    name: "Thumbnail Studio",
    tagline: "See your thumbnail at real feed size.",
    description:
      "See your thumbnail at real feed size, sitting next to typical competitor tiles. If you cannot read it, neither can they. Fix it before you post.",
    bullets: [
      "Feed-size previews for YouTube, TikTok, and Instagram",
      "Side-by-side comparison against typical tiles",
      "Clear readability checks before you publish",
    ],
    appHref: `${APP_URL}/thumbnails`,
  },
  {
    slug: "performance-tracking",
    name: "Performance Tracking",
    tagline: "Predicted versus actual, over time.",
    description:
      "After you post, we track what really happened against the prediction, and publish our accuracy on your profile. Trend signals in your niche sit alongside your own history.",
    bullets: [
      "Predicted score versus real outcomes",
      "Accuracy published on your profile when we have enough data",
      "Niche trend context so you post into rising formats, not fading ones",
    ],
    appHref: `${APP_URL}/trends`,
  },
];

export function getFeature(slug: string) {
  return features.find((f) => f.slug === slug);
}
