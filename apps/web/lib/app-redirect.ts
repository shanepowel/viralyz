import { redirect } from "next/navigation";
import { appRedirectPath } from "@/lib/app-url";

export const dynamic = "force-dynamic";

type AppRedirectPageProps = {
  params?: Promise<Record<string, never>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function createAppRedirect(path: string) {
  return function AppRedirectPage(_props: AppRedirectPageProps) {
    redirect(appRedirectPath(path));
  };
}

export const analyzeRedirect = createAppRedirect("/analyze");
export const signInRedirect = createAppRedirect("/api/login");
export const contactRedirect = createAppRedirect("/contact");
export const privacyRedirect = createAppRedirect("/privacy");
export const termsRedirect = createAppRedirect("/terms");
export const dashboardRedirect = createAppRedirect("/");
export const settingsRedirect = createAppRedirect("/settings");
