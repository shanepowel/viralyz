import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { SanityImage } from "@/components/media/SanityImage";
import { MuxVideo } from "@/components/media/MuxVideo";
import { FactorBar } from "@/components/score/FactorBar";
import { cn } from "@/lib/cn";

function Callout({
  tone,
  children,
}: {
  tone?: string;
  children: React.ReactNode;
}) {
  const styles =
    tone === "warning"
      ? "border-score-mid bg-score-mid-soft"
      : tone === "fix"
        ? "border-score-high bg-score-high-soft"
        : "border-line bg-sunken";
  return (
    <aside className={cn("my-6 rounded-md border px-4 py-3 text-sm", styles)}>
      {children}
    </aside>
  );
}

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => (
      <div className="my-8 max-w-container">
        <SanityImage value={value} width={1200} sizes="(max-width: 768px) 100vw, 720px" />
      </div>
    ),
    "mux.video": ({ value }) => {
      const playbackId = value?.playbackId as string | undefined;
      if (!playbackId) return null;
      return (
        <div className="my-8 overflow-hidden rounded-lg">
          <MuxVideo playbackId={playbackId} title="Embedded video" />
        </div>
      );
    },
    scoreBreakdown: ({ value }) => {
      const items = (value?.items ?? []) as { factor?: string; score?: number }[];
      if (!items.length) return null;
      return (
        <div className="my-8 space-y-3 rounded-md border border-line bg-raised p-5 shadow-sm">
          {items.map((item, i) =>
            item.factor && typeof item.score === "number" ? (
              <FactorBar key={`${item.factor}-${i}`} label={item.factor} value={item.score} />
            ) : null,
          )}
        </div>
      );
    },
    calloutBox: ({ value }) => (
      <Callout tone={value?.tone}>
        <PortableText value={value?.body ?? []} />
      </Callout>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href as string | undefined;
      const external = href?.startsWith("http");
      return (
        <a
          href={href}
          className="text-accent underline underline-offset-4"
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    },
  },
};

export function PortableBody({
  value,
  className,
}: {
  value: unknown;
  className?: string;
}) {
  if (!value) return null;
  return (
    <div className={cn("prose-vz", className)}>
      <PortableText
        value={value as Parameters<typeof PortableText>[0]["value"]}
        components={components}
      />
    </div>
  );
}
