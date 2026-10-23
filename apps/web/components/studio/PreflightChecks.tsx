import { CheckChip } from "@/components/ui/CheckChip";
import { productFacts } from "@/lib/site";

const SAMPLE_PRIMARY =
  "Darkness, on demand. Our weighted silk mask shuts out the street lights, the early sun and the neighbour’s security lamp, so you sleep through until the alarm does its job.";

function Tile({
  name,
  kind,
  body,
  children,
  align = "center",
}: {
  name: string;
  kind: string;
  body: string;
  children: React.ReactNode;
  align?: "center" | "end";
}) {
  return (
    <li className="flex flex-col gap-3.5">
      <div
        className={`dots flex aspect-[16/10] justify-center gap-3.5 rounded-card bg-panel p-6 ${
          align === "end" ? "items-end" : "items-center"
        }`}
      >
        {children}
      </div>
      <div className="flex justify-between gap-3">
        <strong className="font-semibold">{name}</strong>
        <span className="text-[13px] text-muted">{kind}</span>
      </div>
      <p className="-mt-2 mb-0 text-[15px] text-muted">{body}</p>
    </li>
  );
}

/** The six pre-flight checks, each with a small drawn example. */
export function PreflightChecksGrid() {
  const limit = productFacts.primaryTextMax;
  return (
    <ul className="m-0 grid w-full list-none grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-4 p-0">
      <Tile
        name="Contrast"
        kind="Rule"
        body={`Flags text that falls below ${productFacts.contrastMin} against the pixels behind it.`}
      >
        <div
          className="flex h-[120px] w-[120px] items-center justify-center rounded-2xl bg-[#F26B3A]"
          aria-hidden="true"
        >
          <span className="font-display text-[52px] text-[#2A0E04]">Aa</span>
        </div>
        <CheckChip state="pass" value="6.0:1" size="md" surface="card" className="border border-line px-3 py-1.5 text-sm" />
      </Tile>
      <Tile
        name="Safe zone"
        kind="Rule"
        body="Flags a logo, product or CTA that sits under the placement’s UI."
      >
        <div
          className="relative aspect-[9/16] h-full overflow-hidden rounded-inner border-2 border-ink bg-card"
          aria-hidden="true"
        >
          <div className="absolute inset-x-0 top-0 h-[14%] border-b-[1.5px] border-dashed border-warn bg-warn-bg" />
          <div className="absolute inset-x-0 bottom-0 h-[20%] border-t-[1.5px] border-dashed border-warn bg-warn-bg" />
          <div className="absolute inset-x-[20%] bottom-[7%] h-[9%] rounded-full bg-ink" />
        </div>
      </Tile>
      <Tile
        name="Aspect ratio"
        kind="Rule"
        body="Flags anything that isn’t exactly the ratio the placement expects."
        align="end"
      >
        <div className="flex flex-col items-center gap-1.5">
          <div className="h-20 w-20 rounded-lg border-[1.5px] border-muted" aria-hidden="true" />
          <span className="text-xs text-muted">1:1</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="h-[100px] w-20 rounded-lg border-2 border-ink bg-card" aria-hidden="true" />
          <span className="text-xs font-semibold">
            4:5 <span aria-hidden="true">✓</span>
            <span className="sr-only">expected ratio</span>
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <div className="h-[121px] w-[68px] rounded-lg border-[1.5px] border-muted" aria-hidden="true" />
          <span className="text-xs text-muted">9:16</span>
        </div>
      </Tile>
      <Tile
        name="Character limits"
        kind="Rule"
        body="Flags headline and primary text that truncate before the point lands."
      >
        <div className="flex w-full max-w-[300px] flex-col gap-2.5 rounded-[14px] border border-line bg-card p-4">
          <p className="m-0 text-sm leading-[1.45]">
            Darkness, on demand. Our weighted silk mask shuts out the street
            lights, the early{" "}
            <span className="text-muted">sun and the… </span>
            <span className="font-semibold">more</span>
          </p>
          <CheckChip
            state="warn"
            value={`${SAMPLE_PRIMARY.length}/${limit}`}
            label="hook cut off"
            className="self-start"
          />
        </div>
      </Tile>
      <Tile
        name="Policy"
        kind="Rule set"
        body="Flags health claims and personal-attribute language that gets ads rejected."
      >
        <div className="flex w-full max-w-[300px] flex-col gap-2.5 rounded-[14px] border border-line bg-card p-4">
          <p className="m-0 font-display text-[22px]">
            <span className="bg-fail-bg line-through decoration-fail decoration-2">
              Drop 5kg
            </span>{" "}
            in a week.
          </p>
          <CheckChip state="fail" label="Weight-loss claim" className="self-start" />
        </div>
      </Tile>
      <Tile
        name="Hook strength"
        kind="AI estimate"
        body="Never passes or fails. A score, in grey, until Results calibrates it for you."
      >
        <div
          className="flex aspect-[9/16] w-[76px] items-center justify-center rounded-[10px] bg-[#F6C1CF]"
          aria-hidden="true"
        >
          <span className="text-[10px] font-bold text-[#4A1226]">0.0s</span>
        </div>
        <div className="flex w-[150px] flex-col gap-2">
          <span className="font-display text-[40px] tabular">71</span>
          <div className="relative h-1.5 rounded-[3px] bg-line" aria-hidden="true">
            <div className="absolute inset-y-0 left-0 w-[71%] rounded-[3px] bg-muted" />
          </div>
          <span className="text-xs text-muted">Estimate · not yet calibrated</span>
        </div>
      </Tile>
    </ul>
  );
}

export const PREFLIGHT_LIMITS = [
  {
    title: "Your ROAS",
    body: "It removes avoidable mistakes. Performance is measured in Results, with your real spend.",
  },
  {
    title: "A guaranteed hook",
    body: "Hook strength is a model’s opinion until your own results calibrate it.",
  },
  {
    title: "The platform’s final call",
    body: "We catch common rejection patterns. Meta and TikTok still review every ad.",
  },
];
