export type ScoreBand = "excellent" | "good" | "fair" | "poor" | "none";

export function scoreBand(score: number | null | undefined): ScoreBand {
  if (score == null) return "none";
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

/** Paper-theme score palette (matches marketing rings). */
export function scoreColor(score: number | null | undefined): string {
  const band = scoreBand(score);
  switch (band) {
    case "excellent":
      return "#1e9e5a";
    case "good":
      return "#7ca426";
    case "fair":
      return "#d9930d";
    case "poor":
      return "#dc4a3d";
    case "none":
      return "#5e646e";
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
