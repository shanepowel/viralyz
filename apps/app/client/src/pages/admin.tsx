import { Shell } from "@/components/layout/Shell";

const SELLER_ADMIN = "https://app.viralyz.com/admin";

export default function Admin() {
  return (
    <Shell>
      <div className="max-w-xl">
        <h1 className="text-2xl font-semibold text-slate-900">Admin has moved</h1>
        <p className="mt-3 text-sm text-slate-600">
          Account administration is on the seller app. This screen no longer lists accounts or opens their content.
        </p>
        <a href={SELLER_ADMIN} className="mt-4 inline-block text-sm font-semibold underline">
          Open admin
        </a>
      </div>
    </Shell>
  );
}
