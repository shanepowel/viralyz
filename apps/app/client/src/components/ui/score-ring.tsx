import { ScoreRing as UiScoreRing, type ScoreRingProps } from "@repo/ui/score-ring";
import { scoreBand } from "@repo/ui/lib/score";

/** Legacy tone helper used by analyze progress UI */
export function scoreTone(
  score: number | null | undefined,
): "emerald" | "lime" | "amber" | "rose" | "slate" {
  const band = scoreBand(score);
  switch (band) {
    case "excellent":
      return "emerald";
    case "good":
      return "lime";
    case "fair":
      return "amber";
    case "poor":
      return "rose";
    case "none":
      return "slate";
    default: {
      const _exhaustive: never = band;
      return _exhaustive;
    }
  }
}

export function ScoreRing(props: ScoreRingProps) {
  return <UiScoreRing {...props} />;
}
