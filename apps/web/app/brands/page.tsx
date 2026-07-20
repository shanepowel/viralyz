import { redirect } from "next/navigation";
import { routes } from "@/lib/site";

/** Legacy path — redirected to /for-brands via next.config; keep for completeness. */
export default function BrandsPage() {
  redirect(routes.forBrands);
}
