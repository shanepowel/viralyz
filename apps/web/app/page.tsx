import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { FinalCtaBand } from "@/components/marketing/final-cta-band";
import { HeroDemo } from "@/components/score/HeroDemo";
import { ScoreRing } from "@/components/score/ScoreRing";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Marquee } from "@/components/ui/Marquee";
import { Num } from "@/components/ui/Num";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { buttonClasses } from "@/components/ui/Button";
import {
  creators,
  creatorInitials,
} from "@/data/creators";
import { compact } from "@/lib/format";
import { formatGBP } from "@/lib/currency";
import { flags } from "@/lib/flags";
import { pageMeta } from "@/lib/meta";
import { productStats, routes } from "@/lib/site";
import { cn } from "@/lib/cn";

export const metadata = pageMeta({
  title: "Viralyz",
  description:
    "Know how your content will do before you post it. Score every video out of 100 and build a record brands can trust.",
  path: "/",
});

const roster = creators.slice(0, 4);

export default function HomePage() {
  return (
    <MarketingShell>
      <section className="pt-20 md:pt-28 pb-16 md:pb-20">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-accent mb-3">
                The scored creator network
              </p>
              <h1 className="font-display text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] text-ink">
                Know how your content will do.{" "}
                <em className="not-italic text-accent">Before</em> you post it.
              </h1>
              <p className="mt-5 max-w-prose text-base md:text-lg text-ink-secondary leading-relaxed">
                Every video gets a score out of 100 and exactly what to fix.
                Post better content, build a record brands can trust, and get
                hired for it.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={routes.signup}
                  className={buttonClasses({ variant: "primary", size: "lg" })}
                >
                  Score your video, free
                </a>
                <Link
                  href={routes.creators}
                  className={buttonClasses({ variant: "link", size: "lg" })}
                >
                  Browse creators
                </Link>
              </div>
              <p className="mt-4 text-sm text-ink-tertiary">
                Ten free scores a month. No card required.
              </p>
            </div>
            <Reveal>
              <HeroDemo />
            </Reveal>
          </div>
        </Container>
      </section>

      <Marquee />

      <Section>
        <Reveal>
          <SectionHeader
            eyebrow="How it works"
            title="Three steps from guesswork to proof"
            lede="Upload, fix, and build a track record brands can check."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Upload your content",
                b: "Drop in a video or paste a link. In under 30 seconds you get a score out of 100.",
              },
              {
                n: "02",
                t: "See what to change",
                b: "Every note comes with a fix and shows how many points it is worth. Apply it and score again.",
              },
              {
                n: "03",
                t: "Get hired on proof",
                b: "Your history becomes a profile brands can see — no self-reported numbers.",
              },
            ].map((s) => (
              <Card key={s.n} className="p-6">
                <p className="font-mono text-sm text-accent mb-3">{s.n}</p>
                <h3 className="text-lg font-semibold text-ink">{s.t}</h3>
                <p className="mt-2 text-sm text-ink-secondary leading-relaxed">
                  {s.b}
                </p>
              </Card>
            ))}
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {productStats.map((s) => (
              <div key={s.label}>
                <dt className="text-sm text-ink-tertiary">{s.label}</dt>
                <dd className="mt-1 font-mono text-2xl font-semibold text-ink tabular-nums">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Section>

      <Section tone="sunken">
        <Reveal>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <SectionHeader
                eyebrow="What you get"
                title="Fix your content before anyone sees it"
                lede="Write stronger openings, test thumbnails, and tidy captions. Every suggestion shows how many points it adds."
              />
              <ul className="space-y-3 text-sm text-ink-secondary">
                <li>
                  <Link href="/platform/hook-lab" className="text-accent hover:underline">
                    Hook Lab
                  </Link>{" "}
                  — ten opening lines, each scored
                </li>
                <li>
                  <Link
                    href="/platform/thumbnail-studio"
                    className="text-accent hover:underline"
                  >
                    Thumbnail Studio
                  </Link>{" "}
                  — feed-size readability checks
                </li>
                <li>
                  <Link
                    href="/platform/script-doctor"
                    className="text-accent hover:underline"
                  >
                    Script Doctor
                  </Link>{" "}
                  — line-by-line feedback with a teleprompter
                </li>
              </ul>
            </div>
            <Card className="p-5">
              <div className="mb-4 flex justify-between text-sm text-ink-secondary">
                <span className="font-mono">morning-routine-v2.mp4</span>
                <span>
                  Score <Num>77</Num> → <Num className="text-score-high">89</Num>
                </span>
              </div>
              {[
                { l: "Hook", v: 52 },
                { l: "Pacing", v: 81 },
                { l: "Caption", v: 68 },
                { l: "Thumbnail", v: 90 },
              ].map((f) => (
                <div key={f.l} className="mb-3 flex items-center gap-3 text-sm">
                  <span className="w-20 text-ink-secondary">{f.l}</span>
                  <div className="h-2 flex-1 rounded-full bg-sunken overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${f.v}%`,
                        background:
                          f.v >= 75
                            ? "var(--score-high)"
                            : f.v >= 50
                              ? "var(--score-mid)"
                              : "var(--score-low)",
                      }}
                    />
                  </div>
                  <Badge variant="score" score={f.v} />
                </div>
              ))}
            </Card>
          </div>
        </Reveal>
      </Section>

      <Section>
        <Reveal>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ background: creators[0]!.face }}
                >
                  {creatorInitials(creators[0]!)}
                </div>
                <div>
                  <p className="font-semibold text-ink">
                    {creators[0]!.name}{" "}
                    {!flags.marketplaceLive ? (
                      <Badge variant="demo" label="Example media kit" />
                    ) : null}
                  </p>
                  <p className="text-sm text-ink-tertiary">Example profile</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Followers", compact(creators[0]!.followers)],
                  ["Engagement", `${creators[0]!.engagementPct}%`],
                  ["Avg views", compact(creators[0]!.avgViews)],
                  ["Suggested rate", formatGBP(creators[0]!.suggestedRateGbp)],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-sm bg-sunken px-3 py-2.5"
                  >
                    <p className="text-xs text-ink-tertiary">{k}</p>
                    <p className="font-mono text-base font-semibold text-ink tabular-nums">
                      {v}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
            <div>
              <SectionHeader
                eyebrow="Get discovered"
                title="A media kit that builds itself"
                lede="Numbers from connected accounts — nothing self-reported. One link brands can trust."
              />
              <Link
                href={`/kit/${creators[0]!.slug}`}
                className={buttonClasses({ variant: "secondary" })}
              >
                See an example media kit
              </Link>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section tone="sunken">
        <Reveal>
          <SectionHeader
            eyebrow="Two sides, one network"
            title="Creators bring the proof. Brands bring the work."
          />
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <Badge variant="accent">For creators</Badge>
              <h3 className="mt-3 text-lg font-semibold text-ink">
                Grow your score. Get discovered.
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-ink-secondary">
                <li>Ten free scores a month</li>
                <li>A profile brands can search when marketplace opens</li>
                <li>Paid briefs matched to your track record at launch</li>
              </ul>
              <a
                href={routes.signup}
                className={cn(buttonClasses({ variant: "secondary" }), "mt-6")}
              >
                Start scoring free
              </a>
            </Card>
            <Card className="p-6">
              <Badge variant="accent">For brands</Badge>
              <h3 className="mt-3 text-lg font-semibold text-ink">
                Hire creators who can prove it.
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-ink-secondary">
                <li>Search profiles by real performance</li>
                <li>See how content will score before it goes live</li>
                <li>Pay safely through the platform at launch</li>
              </ul>
              <Link
                href={routes.forBrands}
                className={cn(buttonClasses({ variant: "secondary" }), "mt-6")}
              >
                See how it works
              </Link>
            </Card>
          </div>
        </Reveal>
      </Section>

      <Section>
        <Reveal>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              className="mb-0"
              eyebrow="Founding roster"
              title="Example profiles on the network"
              lede="These show how verified creator data will look. Real creators are onboarding now."
            />
            <Link
              href={routes.creators}
              className={buttonClasses({ variant: "link" })}
            >
              Browse all creators
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {roster.map((c) => (
              <Link key={c.slug} href={`/kit/${c.slug}`}>
                <Card hoverable className="h-full p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ background: c.face }}
                    >
                      {creatorInitials(c)}
                    </div>
                    <ScoreRing value={c.score} size={48} animate={false} />
                  </div>
                  <p className="font-semibold text-ink">
                    {c.name}{" "}
                    {c.demo && !flags.marketplaceLive ? (
                      <Badge variant="demo" />
                    ) : null}
                  </p>
                  <p className="text-sm text-ink-tertiary">
                    {c.niche} · {compact(c.followers)}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </Reveal>
      </Section>

      <FinalCtaBand
        title="Your next post already has a score"
        subtitle="Find out what it is, and what it could be. No card required to start."
        cta="Score my first video"
        secondary={{ href: routes.contact, label: "Talk to sales" }}
      />
    </MarketingShell>
  );
}
