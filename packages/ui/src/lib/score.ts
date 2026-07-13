export type ScoreBand = "excellent" | "good" | "fair" | "poor" | "none";

export function scoreBand(score: number | null | undefined): ScoreBand {
  if (score == null) return "none";
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

export function scoreColor(score: number | null | undefined): string {
  const band = scoreBand(score);
  switch (band) {
    case "excellent":
      return "#34D399";
    case "good":
      return "#A3E635";
    case "fair":
      return "#FBBF24";
    case "poor":
      return "#F87171";
    case "none":
      return "#64647A";
    default: {
      const _exhaustive: never = band;
      return _exhaustive;
    }
  }
}

export function scoreBandClass(score: number | null | undefined): string {
  const band = scoreBand(score);
  switch (band) {
    case "excellent":
      return "score-excellent";
    case "good":
      return "score-good";
    case "fair":
      return "score-fair";
    case "poor":
      return "score-poor";
    case "none":
      return "";
    default: {
      const _exhaustive: never = band;
      return _exhaustive;
    }
  }
}
