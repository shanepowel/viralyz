import { cn } from "@/lib/cn";

export type CheckState =
  | "pass"
  | "warn"
  | "fail"
  | "estimate"
  | "locked"
  | "running";

const STYLES: Record<CheckState, string> = {
  pass: "text-pass",
  warn: "text-mark",
  fail: "text-mark",
  // AI-assessed values are always neutral grey.
  estimate: "text-muted",
  locked: "text-muted",
  running: "text-guide",
};

/** Default word for each state, so colour never carries the meaning alone. */
const WORDS: Record<CheckState, string> = {
  pass: "Cleared",
  warn: "To fix",
  fail: "Blocked",
  estimate: "estimate",
  locked: "Locked",
  running: "Checking",
};

function Glyph({ state }: { state: CheckState }) {
  if (state === "pass") {
    return (
      <svg
        width="11"
        height="11"
        viewBox="0 0 14 14"
        aria-hidden="true"
        className="vz-tick shrink-0"
      >
        <path
          d="M2.5 7.5l3 3 6-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (state === "warn") return <span aria-hidden="true">!</span>;
  if (state === "fail") return <span aria-hidden="true">✕</span>;
  return null;
}

/**
 * A pre-flight check result. Every state shows a glyph and a word.
 * `label` replaces the default word (e.g. "CTA under UI"); `value` is an
 * optional measured reading (e.g. "8.2:1"), shown in tabular figures.
 */
export function CheckChip({
  state,
  label,
  value,
  size = "sm",
  surface = "tint",
  className,
}: {
  state: CheckState;
  label?: React.ReactNode;
  value?: React.ReactNode;
  size?: "xs" | "sm" | "md";
  /** "card" puts the status colour on a card background (inside a tinted row). */
  surface?: "tint" | "card";
  className?: string;
}) {
  const word = label ?? (value == null ? WORDS[state] : null);
  return (
    <span
      className={cn(
        "vz-chip-in inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-mono font-medium uppercase tracking-[0.06em]",
        size === "xs" && "text-[10px]",
        size === "sm" && "text-[11px]",
        size === "md" && "text-[12px]",
        surface === "card" && (state === "pass" || state === "warn" || state === "fail")
          ? (state === "pass" ? "text-pass" : "text-mark")
          : STYLES[state],
        className,
      )}
    >
      <Glyph state={state} />
      {state === "estimate" ? (
        <>
          {value != null ? <span>{value}</span> : null}
          {value != null ? <span aria-hidden="true">/</span> : null}
          <span>{label ?? "estimate"}</span>
        </>
      ) : (
        <>
          {value != null ? <span>{value}</span> : null}
          {word ? <span>{word}</span> : null}
        </>
      )}
      {value != null && label == null && state !== "estimate" ? (
        <span className="sr-only">{WORDS[state]}</span>
      ) : null}
    </span>
  );
}
