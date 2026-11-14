import { PortableBody } from "@/components/media/PortableBody";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { LegalSection } from "@/data/legal";
import { CONTACT } from "@/lib/site";

type Heading = { id: string; text: string };

function extractHeadings(body: unknown): Heading[] {
  if (!Array.isArray(body)) return [];
  return body
    .filter(
      (b): b is { _type: string; style?: string; children?: { text?: string }[] } =>
        !!b && typeof b === "object" && (b as { _type?: string })._type === "block",
    )
    .filter((b) => b.style === "h2")
    .map((b, i) => {
      const text = b.children?.map((c) => c.text ?? "").join("") ?? "";
      const id = `h-${i}-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;
      return { id, text };
    })
    .filter((h) => h.text);
}

function slug(text: string, i: number) {
  return `s-${i + 1}-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`;
}

/**
 * Legal layout: contents in the left margin, numbered sections on the
 * right. Sanity content wins when it exists; otherwise the drafted
 * `sections` are shown, and `fallback` only when there is neither.
 */
export function LegalTemplate({
  title,
  lastUpdated,
  body,
  sections,
  fallback,
}: {
  title: string;
  lastUpdated?: string | null;
  body?: unknown;
  sections?: LegalSection[];
  fallback?: React.ReactNode;
}) {
  const useSections = !body && sections && sections.length > 0;
  const headings: Heading[] = useSections
    ? sections.map((s, i) => ({ id: slug(s.heading, i), text: s.heading }))
    : extractHeadings(body);

  return (
    <Container className="pb-20 pt-[clamp(40px,6vw,80px)]">
      <SectionHeader
        as="h1"
        eyebrow="Legal"
        title={title}
        lede={lastUpdated ? `Last updated ${lastUpdated}.` : undefined}
      />
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 border-t border-rule pt-6 md:grid-cols-[200px_1fr]">
        {headings.length ? (
          <nav aria-label="On this page" className="hidden md:sticky md:top-24 md:block md:self-start">
            <p className="kicker m-0">On this page</p>
            <ol className="m-0 mt-3 list-none p-0">
              {headings.map((h, i) => (
                <li key={h.id} className="border-t border-line">
                  <a href={`#${h.id}`} className="flex gap-2 py-1.5 text-[14px] text-ink-2 hover:text-ink">
                    <span className="font-mono text-[12px] text-muted">{i + 1}</span>
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : (
          <div className="hidden md:block" />
        )}

        <div className="min-w-0 max-w-[720px]">
          {body ? (
            <PortableBody value={body} />
          ) : useSections ? (
            sections.map((s, i) => (
              <section key={s.heading} id={slug(s.heading, i)} className="border-b border-line pb-6 pt-6 first:pt-0">
                <h2 className="m-0 font-display text-[26px]">
                  <span className="mr-3 font-mono text-[13px] font-normal tracking-normal text-muted">{i + 1}</span>
                  {s.heading}
                </h2>
                {s.body.map((p) => (
                  <p key={p.slice(0, 32)} className="m-0 mt-3 text-ink-2">
                    {p}
                  </p>
                ))}
              </section>
            ))
          ) : (
            fallback
          )}
          <p className="m-0 mt-8 text-[15px] text-ink-2">
            Questions:{" "}
            <a href={`mailto:${CONTACT.hello}`} className="font-semibold text-ink underline underline-offset-4">
              {CONTACT.hello}
            </a>
          </p>
        </div>
      </div>
    </Container>
  );
}
