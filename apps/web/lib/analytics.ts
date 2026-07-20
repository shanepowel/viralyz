export type TrackEvent =
  | "cta_start_free"
  | "cta_talk_to_sales"
  | "tool_used"
  | "newsletter_signup"
  | "contact_submitted"
  | "kit_notify_signup"
  | "nav_feature_click";

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string> },
    ) => void;
  }
}

export const track = (
  event: TrackEvent,
  props?: Record<string, string>,
) => {
  if (typeof window === "undefined") return;
  window.plausible?.(event, props ? { props } : undefined);
};
