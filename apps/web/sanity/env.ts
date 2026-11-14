/**
 * Defaults point at the live Viralyz project. The previous default was an
 * older project that still holds creator-marketplace content, so a missing
 * env var silently brought that content back.
 */
export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "czkrcwk6";
export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-02-01";
