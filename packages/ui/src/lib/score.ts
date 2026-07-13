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
      return "#0FA968";
    case "good":
      return "#7CA426";
    case "fair":
      return "#D9950B";
    case "poor":
      return "#DE4E4E";
    case "none":
      return "#928FA0";
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
