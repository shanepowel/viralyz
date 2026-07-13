import type { Metadata } from "next";
import { getPublicAppUrl } from "@repo/config";
import { FinalCta } from "@/components/marketing/final-cta";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const metadata: Metadata = {
  title: "Platform",
  description:
    "Every tool feeds one score. Viralyz connects everything to a single Viral Score.",
};

const TOOLS = [
  {
    tag: "Score",
    name: "Viral Score",
    body: "Every post gets a score out of 100 across five areas: opening, visuals, pacing, words and timing. You see what is wrong and exactly how to fix it.",
  },
  {
    tag: "Create",
    name: "Hook Lab",
    body: "Your first three seconds decide everything. Get ten opening lines for any idea, each scored against what has worked for your audience before.",
  },
  {
    tag: "Create",
    name: "Script Doctor",
    body: "Paste your script and get feedback line by line. Weak opening, buried point, missing call to action. Accept a fix and watch your score move.",
  },
  {
    tag: "Create",
    name: "Thumbnail Studio",
    body: "See your thumbnail at real feed size, sitting next to actual competitor thumbnails. If you cannot read it, neither can they. Fix it before you post.",
  },
  {
    tag: "Create",
    name: "Caption Studio",
    body: "Captions and hashtags written for each platform, with a mix of big and niche tags so you get found. Includes two versions to test against each other.",
  },
  {
    tag: "Intel",
    name: "Trend Radar",
    body: "What is rising in your niche right now, and honestly, what is fading. Posting into a dying trend is wasted work. We tell you before you waste it.",
  },
  {
    tag: "Intel",
    name: "Competitor Intel",
    body: "We score your competitors' content too. See why their post worked, then create your own take on it. Your angle, not their copy.",
  },
  {
    tag: "Publish",
    name: "Smart Calendar",
    body: "Drag your posts into a calendar that already knows your audience's best hours. Every scheduled post shows its score, so you know what is going out.",
  },
  {
    tag: "Publish",
    name: "BioPage",
    body: "A clean link-in-bio page with your content, links and email capture. Built in minutes, tracked properly, and it matches your brand.",
  },
  {
    tag: "Engage",
    name: "DM Automation",
    body: "Someone comments a keyword on your post, they get your link by direct message. Set it up once and it works around the clock, within Instagram's rules.",
  },
  {
    tag: "Earn",
    name: "Media Kit",
    body: "Your verified profile, built from real platform data. Followers, engagement, score history and a suggested rate card. One link that gets you booked.",
  },
  {
    tag: "Learn",
    name: "Performance Tracking",
    body: "After you post, we track what really happened and compare it to what we predicted. Our accuracy is shown to you honestly, and it improves over time.",
  },
] as const;

export default function PlatformPage() {
  return (
    <MarketingShell>
      <div className="wrap">
        <div className="page-hero">
          <span className="eyebrow">Platform</span>
          <h1>Every tool feeds one score.</h1>
          <p>
            Other toolkits give you ten separate gadgets. Viralyz connects
            everything to a single score, so each tool makes the next one
            smarter.
          </p>
        </div>
      </div>

      <section style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="tool-grid">
            {TOOLS.map((tool) => (
              <div className="tool" key={tool.name}>
                <span className="t-tag">{tool.tag}</span>
                <h3>{tool.name}</h3>
                <p>{tool.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCta
        title="Try every tool free."
        subtitle="10 scores a month, no card needed. Upgrade when it pays for itself."
        cta="Start free"
        href={getPublicAppUrl()}
      />
    </MarketingShell>
  );
}
