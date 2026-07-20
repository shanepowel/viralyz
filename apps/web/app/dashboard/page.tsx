import { redirect } from "next/navigation";
import { getPublicAppUrl } from "@repo/config";

/** Product lives on app.viralyz.com — marketing /dashboard is a bounce. */
export default function DashboardPage() {
  redirect(getPublicAppUrl());
}
