import type { ToolId } from "./index";

/** Maps marketing tool IDs to routes in the Express app. */
export const APP_TOOL_ROUTES: Record<ToolId, string> = {
  "virality-predictor": "/analyze",
  "script-enhancer": "/hook-lab",
  "competitor-tracker": "/intelligence",
  "video-analysis": "/analyze",
  "profile-analysis": "/settings",
  "seo-caption": "/caption-studio",
  "thumbnail-generator": "/thumbnails",
  "content-planner": "/calendar",
  "auto-dm": "/messages",
  "bio-store": "/",
};
