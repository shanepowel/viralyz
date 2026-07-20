import { redirect } from "next/navigation";
import { getPublicAppPath } from "@repo/config";

export default function DashboardSettingsPage() {
  redirect(getPublicAppPath("/settings"));
}
