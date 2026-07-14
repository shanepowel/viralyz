import { Inngest } from "inngest";

export const ANALYSIS_EVENT = "viralyz/analysis.requested" as const;

export const inngest = new Inngest({
  id: "viralyz",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

export function isInngestConfigured() {
  return Boolean(
    process.env.INNGEST_EVENT_KEY &&
      (process.env.INNGEST_SIGNING_KEY || process.env.INNGEST_DEV === "1"),
  );
}
