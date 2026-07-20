import Link from "next/link";
import { FinalCtaBand } from "@/components/marketing/final-cta-band";
import { MuxVideo } from "@/components/media/MuxVideo";
import { PortableBody } from "@/components/media/PortableBody";
import { SanityImage } from "@/components/media/SanityImage";
import { HeroDemo } from "@/components/score/HeroDemo";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Num } from "@/components/ui/Num";
import { cn } from "@/lib/cn";

type Block = {
  _type: string;
  _key?: string;
  [key: string]: unknown;
};

function CtaLink({
  label,
  href,
  variant = "primary",
}: {
  label?: string | null;
  href?: string | null;
  variant?: "primary" | "secondary" | "link";
}) {
  if (!label || !href) return null;
  const external = href.startsWith("http");
  const className = buttonClasses({ variant, size: "md" });
  if (external) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

function HeroBlock({ block }: { block: Block }) {
  const mediaKind = (block.mediaKind as string) || "none";
  return (
    <Section className="pt-20 md:pt-28">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            {block.eyebrow ? <Eyebrow>{String(block.eyebrow)}</Eyebrow> : null}
            <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight leading-[1.05] md:text-6xl">
              {String(block.heading ?? "")}
            </h1>
            {block.lede ? (
              <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-secondary md:text-lg">
                {String(block.lede)}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink
                label={(block.primaryCta as { label?: string })?.label}
                href={(block.primaryCta as { href?: string })?.href}
              />
              <CtaLink
                label={(block.secondaryCta as { label?: string })?.label}
                href={(block.secondaryCta as { href?: string })?.href}
                variant="link"
              />
            </div>
          </div>
          <div>
            {mediaKind === "scoreDemo" ? (
              <HeroDemo />
            ) : mediaKind === "video" && block.videoPlaybackId ? (
              <MuxVideo
                playbackId={String(block.videoPlaybackId)}
                title={String(block.heading ?? "Demo")}
                autoplayLoop
                className="overflow-hidden rounded-lg"
              />
            ) : mediaKind === "image" ? (
              <SanityImage
                value={block.image as never}
                width={960}
                priority
                className="overflow-hidden rounded-lg shadow-md"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function SplitMediaBlock({ block }: { block: Block }) {
  const side = block.mediaSide === "left" ? "left" : "right";
  const media = (
    <div className="overflow-hidden rounded-lg border border-line bg-raised shadow-sm">
      {block.mediaKind === "video" && block.videoPlaybackId ? (
        <MuxVideo
          playbackId={String(block.videoPlaybackId)}
          title={String(block.heading ?? "Feature")}
          autoplayLoop
        />
      ) : (
        <SanityImage
          value={block.image as never}
          width={900}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      )}
    </div>
  );
  const copy = (
    <div>
      {block.eyebrow ? <Eyebrow>{String(block.eyebrow)}</Eyebrow> : null}
      <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-3xl">
        {String(block.heading ?? "")}
      </h2>
      {block.body ? (
        <div className="mt-4">
          <PortableBody value={block.body} />
        </div>
      ) : null}
      {Array.isArray(block.bullets) && block.bullets.length ? (
        <ul className="mt-4 space-y-2 text-ink-secondary">
          {(block.bullets as string[]).map((b) => (
            <li key={b} className="flex gap-2">
              <span className="text-accent" aria-hidden>
                ·
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-6">
        <CtaLink
          label={(block.cta as { label?: string })?.label}
          href={(block.cta as { href?: string })?.href}
          variant="secondary"
        />
      </div>
    </div>
  );

  return (
    <Section>
      <Container>
        <Reveal>
          <div
            className={cn(
              "grid items-center gap-10 lg:grid-cols-2",
              side === "left" && "[&>*:first-child]:order-2 lg:[&>*:first-child]:order-1",
            )}
          >
            {side === "left" ? (
              <>
                {media}
                {copy}
              </>
            ) : (
              <>
                {copy}
                {media}
              </>
            )}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

export function PageBuilder({ blocks }: { blocks?: Block[] | null }) {
  if (!blocks?.length) return null;

  return (
    <>
      {blocks.map((block) => {
        const key = block._key ?? block._type;
        switch (block._type) {
          case "hero":
            return <HeroBlock key={key} block={block} />;
          case "splitMedia":
            return <SplitMediaBlock key={key} block={block} />;
          case "featureGrid":
            return (
              <Section key={key}>
                <Container>
                  {block.heading ? (
                    <SectionHeader title={String(block.heading)} />
                  ) : null}
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {((block.items as { title?: string; body?: string; href?: string; icon?: string }[]) ?? []).map(
                      (item) => (
                        <Card key={item.title} className="p-5">
                          <h3 className="text-lg font-semibold text-ink">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                            {item.body}
                          </p>
                          {item.href ? (
                            <Link
                              href={item.href}
                              className="mt-4 inline-block text-sm text-accent underline underline-offset-4"
                            >
                              Learn more
                            </Link>
                          ) : null}
                        </Card>
                      ),
                    )}
                  </div>
                </Container>
              </Section>
            );
          case "videoShowcase":
            return (
              <Section key={key} tone="sunken">
                <Container>
                  {block.heading ? (
                    <SectionHeader title={String(block.heading)} />
                  ) : null}
                  {block.videoPlaybackId ? (
                    <MuxVideo
                      playbackId={String(block.videoPlaybackId)}
                      title={String(block.heading ?? "Showcase")}
                      className="overflow-hidden rounded-lg"
                    />
                  ) : null}
                  {block.caption ? (
                    <p className="mt-3 text-sm text-ink-tertiary">
                      {String(block.caption)}
                    </p>
                  ) : null}
                </Container>
              </Section>
            );
          case "statsBand":
            return (
              <Section key={key} tone="sunken">
                <Container>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {((block.items as { value?: string; label?: string }[]) ?? []).map(
                      (item) => (
                        <div key={`${item.value}-${item.label}`}>
                          <p className="font-mono text-3xl font-semibold tracking-tight text-ink">
                            <Num>{item.value}</Num>
                          </p>
                          <p className="mt-1 text-sm text-ink-secondary">
                            {item.label}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </Container>
              </Section>
            );
          case "faqSection": {
            const faqs = (block.faqs as { question?: string; answer?: unknown }[]) ?? [];
            const faqLd = {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: Array.isArray(f.answer)
                    ? f.answer
                        .map((b: { children?: { text?: string }[] }) =>
                          b.children?.map((c) => c.text).join("") ?? "",
                        )
                        .join(" ")
                    : "",
                },
              })),
            };
            return (
              <Section key={key}>
                <Container>
                  <JsonLd data={faqLd} />
                  {block.heading ? (
                    <SectionHeader title={String(block.heading)} />
                  ) : null}
                  <div className="mx-auto max-w-2xl space-y-3">
                    {faqs.map((f) => (
                      <details
                        key={f.question}
                        className="rounded-md border border-line bg-raised px-4 py-3 shadow-sm"
                      >
                        <summary className="cursor-pointer font-medium text-ink">
                          {f.question}
                        </summary>
                        <div className="mt-3">
                          <PortableBody value={f.answer} />
                        </div>
                      </details>
                    ))}
                  </div>
                </Container>
              </Section>
            );
          }
          case "ctaSection": {
            const band = block.band as {
              heading?: string;
              body?: string;
              primaryLabel?: string;
              primaryHref?: string;
              secondaryLabel?: string;
              secondaryHref?: string;
            } | null;
            if (!band?.heading) return null;
            return (
              <FinalCtaBand
                key={key}
                title={band.heading}
                subtitle={band.body ?? ""}
                cta={band.primaryLabel}
                href={band.primaryHref}
                secondary={
                  band.secondaryLabel && band.secondaryHref
                    ? { label: band.secondaryLabel, href: band.secondaryHref }
                    : undefined
                }
              />
            );
          }
          case "richText":
            return (
              <Section key={key}>
                <Container>
                  <PortableBody value={block.body} className="mx-auto" />
                </Container>
              </Section>
            );
          case "gallery":
            return (
              <Section key={key}>
                <Container>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {((block.images as unknown[]) ?? []).map((img, i) => (
                      <SanityImage
                        key={i}
                        value={img as never}
                        width={600}
                        className="overflow-hidden rounded-md"
                      />
                    ))}
                  </div>
                </Container>
              </Section>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
