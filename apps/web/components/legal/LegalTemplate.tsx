import { PortableBody } from "@/components/media/PortableBody";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { CONTACT, routes } from "@/lib/site";

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

export function LegalTemplate({
  title,
  lastUpdated,
  body,
  fallback,
}: {
  title: string;
  lastUpdated?: string | null;
  body?: unknown;
  fallback?: React.ReactNode;
}) {
  const headings = extractHeadings(body);

  return (
    <Section className="pt-20 md:pt-28">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Home", href: routes.home },
            { label: title },
          ]}
        />
        <Eyebrow className="mt-6">Legal</Eyebrow>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {title}
        </h1>
        {lastUpdated ? (
          <p className="mt-3 text-sm text-ink-tertiary">
            Last updated {lastUpdated}
          </p>
        ) : null}

        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
          {headings.length ? (
            <nav
              aria-label="On this page"
              className="hidden lg:sticky lg:top-24 lg:block lg:self-start"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">
                On this page
              </p>
              <ul className="mt-3 space-y-2">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      className="text-sm text-ink-secondary hover:text-ink"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <div className="hidden lg:block" />
          )}

          <div>
            {body ? <PortableBody value={body} /> : fallback}
            <p className="mt-10 text-sm text-ink-secondary">
              Questions:{" "}
              <a
                href={`mailto:${CONTACT.hello}`}
                className="text-accent underline underline-offset-4"
              >
                {CONTACT.hello}
              </a>
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
