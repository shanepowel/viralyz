import { CheckChip, type CheckState } from "@/components/ui/CheckChip";
import { cn } from "@/lib/cn";

export type PreflightCheck = {
  name: string;
  state: CheckState;
  /** Short verdict shown in the chip, e.g. "CTA under UI". */
  label?: string;
  /** Measured value, e.g. "8.2:1". */
  value?: string;
  /** Explanation shown when a warning or failure row is expanded. */
  detail?: string;
  /** The one-click fix offered for a warning or failure. */
  fix?: string;
};

/**
 * Floating pre-flight card: a header with the variant name and pass count,
 * then one row per check. Warning/failure rows with a `detail` expand to show
 * the explanation and fix. Estimates never count as passed or failed.
 */
export function PreflightPanel({
  title,
  checks,
  thumbnail,
  size = "md",
  className,
}: {
  title: string;
  checks: PreflightCheck[];
  /** Optional ad thumbnail shown beside the checks (see SafeZoneFrame). */
  thumbnail?: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}) {
  const rules = checks.filter((c) => c.state !== "estimate");
  const passed = rules.filter((c) => c.state === "pass").length;
  const done = !checks.some((c) => c.state === "running");
  const fixRow = checks.find(
    (c) => (c.state === "warn" || c.state === "fail") && c.fix && !c.detail,
  );
  const sm = size === "sm";

  return (
    <div
      className={cn(
        "flex flex-wrap gap-[18px] rounded-card border border-line bg-card shadow-float",
        sm ? "p-[18px]" : "p-[22px]",
        className,
      )}
    >
      {thumbnail}
      <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-1">
        <div className="mb-1 flex items-center justify-between gap-3 border-b border-line pb-2.5">
          <strong className={cn("font-semibold", sm ? "text-[15px]" : "")}>
            {title}
          </strong>
          <span className="text-[13px] text-muted tabular">
            {done ? `${passed} of ${rules.length} passed` : "Checking…"}
          </span>
        </div>
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {checks.map((c) => {
            const expanded =
              (c.state === "warn" || c.state === "fail") && c.detail;
            if (expanded) {
              return (
                <li
                  key={c.name}
                  className={cn(
                    "-mx-3 my-0.5 flex flex-col gap-2 rounded-inner p-3",
                    c.state === "warn" ? "bg-warn-bg" : "bg-fail-bg",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-between gap-3",
                      sm ? "text-sm" : "text-[15px]",
                    )}
                  >
                    <span className="font-semibold">{c.name}</span>
                    <CheckChip
                      state={c.state}
                      label={c.label}
                      value={c.value}
                      surface="card"
                      size={sm ? "sm" : "md"}
                    />
                  </div>
                  <span className="text-sm text-ink">{c.detail}</span>
                  {c.fix ? (
                    <span className="inline-flex min-h-10 w-fit items-center rounded-full bg-btn px-4 text-[13px] font-semibold text-btn-ink">
                      {c.fix}
                    </span>
                  ) : null}
                </li>
              );
            }
            return (
              <li
                key={c.name}
                className={cn(
                  "flex items-center justify-between gap-3",
                  sm ? "py-[7px] text-sm" : "py-[9px] text-[15px]",
                )}
              >
                <span>{c.name}</span>
                <CheckChip
                  state={c.state}
                  label={c.label}
                  value={c.value}
                  size={sm ? "sm" : "md"}
                />
              </li>
            );
          })}
        </ul>
        {fixRow ? (
          <span className="mt-2.5 inline-flex min-h-11 items-center justify-center rounded-inner bg-btn px-4 text-sm font-semibold text-btn-ink">
            {fixRow.fix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * A 9:16 frame with the placement's safe-zone overlays: dashed bands at the
 * top 14% and bottom 20%, where the platform's own UI sits.
 */
export function SafeZoneFrame({
  children,
  overlay,
  labelled = false,
  className,
}: {
  /** The ad itself, drawn under the bands. */
  children: React.ReactNode;
  /** Elements drawn above the bands, e.g. the flagged CTA. */
  overlay?: React.ReactNode;
  /** Print "Platform UI" inside the bands. */
  labelled?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[9/16] overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0">{children}</div>
      <div className="absolute inset-x-0 top-0 flex h-[14%] items-end border-b-[1.5px] border-dashed border-white/90 bg-black/30 px-3 pb-1.5">
        {labelled ? (
          <span className="text-[10px] font-semibold text-white">
            PLATFORM UI · TOP
          </span>
        ) : null}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex h-[20%] items-end border-t-[1.5px] border-dashed border-white/90 bg-black/30 px-3 pb-2">
        {labelled ? (
          <span className="text-[10px] font-semibold text-white">
            PLATFORM UI · BOTTOM
          </span>
        ) : null}
      </div>
      {overlay}
    </div>
  );
}
