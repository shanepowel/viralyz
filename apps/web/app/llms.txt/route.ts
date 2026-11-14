import { features } from "@/data/features";
import { liveTools } from "@/data/tools";
import { COMPANY, CONTACT, SITE_URL, placements, productFacts } from "@/lib/site";

export const dynamic = "force-static";

/** A plain-text summary of the site for AI assistants and search. */
export function GET() {
  const lines = [
    "# Viralyz",
    "",
    "> Viralyz makes on-brand ad creative for Meta and TikTok and checks every ad against the placement's rules before any budget is spent on it. Anything that must change is marked on the ad with the reason.",
    "",
    `Viralyz is operated by ${COMPANY.legalName} (company number ${COMPANY.number}), ${COMPANY.location}. It is not affiliated with Meta or TikTok.`,
    "",
    "## How it works",
    ...features.map((f) => `- [${f.name}](${SITE_URL}/platform/${f.slug}): ${f.tagline}`),
    "",
    "## Facts",
    `- Placements: ${placements.join(", ")}.`,
    `- Checks on every ad: ${productFacts.preflightChecks} (five measured rules: contrast, safe zone, aspect ratio, character limits, policy; and one AI estimate of hook strength).`,
    `- Minimum text contrast enforced: ${productFacts.contrastMin}.`,
    `- Pricing: credits, no subscription. ${productFacts.freeCredits} free credits on signup. ${productFacts.creditsPerVariant} credit makes and checks one ad.`,
    `- Results shows no trend until ${productFacts.calibrationThreshold} ads are matched to real spend.`,
    "",
    "## Pages",
    `- [Platform](${SITE_URL}/platform)`,
    `- [For sellers](${SITE_URL}/for-sellers)`,
    `- [Pricing](${SITE_URL}/pricing)`,
    `- [Trust and data](${SITE_URL}/trust)`,
    `- [Notes](${SITE_URL}/blog)`,
    `- [Changelog](${SITE_URL}/changelog)`,
    "",
    "## Free tools",
    ...liveTools().map((t) => `- [${t.name}](${SITE_URL}/tools/${t.slug}): ${t.description}`),
    "",
    "## Contact",
    `- ${CONTACT.hello}`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
