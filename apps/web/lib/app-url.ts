/**
 * Base URL for the Viralyz product app (Express + React).
 * Marketing CTAs use same-origin paths that redirect here.
 */
export function getAppUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim();

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "development") {
    return "http://localhost:5000";
  }

  return "https://viralyz.com";
}

export function appRedirectPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getAppUrl()}${normalized}`;
}
