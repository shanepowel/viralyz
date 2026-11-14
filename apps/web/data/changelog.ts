export type ChangelogEntry = {
  /** ISO date the change shipped. */
  date: string;
  title: string;
  changes: string[];
};

/**
 * What shipped, newest first. Add an entry when a release goes out; do not
 * backfill dates you cannot evidence.
 */
export const changelog: ChangelogEntry[] = [
  {
    date: "2026-11-13",
    title: "A new look, and problems marked on the ad",
    changes: [
      "The app and this site were redrawn: a plain black-and-white interface so the ads carry the colour. Red means something must change, blue is a guide, green means cleared.",
      "Studio makes a batch across several placements at once and lays it out as a contact sheet, one row per angle.",
      "Each ad opens on a review desk: what must change is numbered and explained beside the ad, and the safe zone can be shown on top of it.",
      "An ad that breaks a policy rule can no longer be downloaded until it is made again.",
      "Studio is now the home screen, and the app has a bottom tab bar on phones.",
      "Two free tools replaced the old ones: a safe-zone checker and an ad readability checker.",
    ],
  },
];
