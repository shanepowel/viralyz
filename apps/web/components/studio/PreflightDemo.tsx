import { RoveAd, RoveCta } from "@/components/studio/ExampleAds";
import {
  PreflightPanel,
  SafeZoneFrame,
  type PreflightCheck,
} from "@/components/ui/PreflightPanel";

/** Example checks for the fictional Rove story ad. Illustrative, not real output. */
export const ROVE_CHECKS: PreflightCheck[] = [
  { name: "Contrast", state: "pass", value: "6.0:1" },
  {
    name: "Safe zone",
    state: "warn",
    label: "CTA under UI",
    fix: "Fix: move CTA above the safe zone",
  },
  { name: "Aspect ratio", state: "pass", value: "9:16" },
  { name: "Characters", state: "pass", value: "18/40" },
  { name: "Policy", state: "pass", label: "Clear" },
  { name: "Hook strength", state: "estimate", value: "71" },
];

/** Home: compact panel with the safe-zone thumbnail beside the checks. */
export function PreflightDemoCompact() {
  return (
    <PreflightPanel
      size="sm"
      title="Rove · Story 9:16"
      checks={ROVE_CHECKS}
      className="w-full max-w-[640px]"
      thumbnail={
        <SafeZoneFrame
          className="w-[150px] flex-none rounded-inner bg-[#F26B3A]"
          overlay={<RoveCta size="sm" />}
        >
          <RoveAd size="sm" />
        </SafeZoneFrame>
      }
    />
  );
}

/** Pre-flight page: the large 9:16 ad with labelled safe zones next to the panel. */
export function PreflightDemoLarge() {
  const checks: PreflightCheck[] = ROVE_CHECKS.map((c) =>
    c.name === "Safe zone"
      ? {
          name: "Safe zone",
          state: "warn",
          label: "Warning",
          detail:
            "The CTA sits under the platform’s bottom UI. People may not see or tap it.",
          fix: "Move CTA up and re-check",
        }
      : c,
  );
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      <div className="flex flex-[0_0_260px] flex-col items-center gap-2.5">
        <SafeZoneFrame
          labelled
          className="w-[260px] rounded-[22px] bg-[#F26B3A] shadow-[0_20px_50px_rgba(0,0,0,.12)]"
          overlay={<RoveCta size="md" />}
        >
          <RoveAd size="md" />
        </SafeZoneFrame>
        <span className="text-xs text-muted">Fictional brand · Story 9:16</span>
      </div>
      <PreflightPanel
        title="Pre-flight"
        checks={checks}
        className="max-w-[460px] flex-[1_1_340px]"
      />
    </div>
  );
}
