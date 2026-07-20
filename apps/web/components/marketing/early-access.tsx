import Link from "next/link";
import { routes } from "@/lib/site";

export function EarlyAccess() {
  return (
    <section className="band" id="early-access" style={{ marginTop: 48 }}>
      <div className="wrap">
        <div className="sec-head" style={{ marginBottom: 24 }}>
          <span className="eyebrow">Early access</span>
          <h2>Be a launch brand</h2>
          <p>
            We are onboarding a small first cohort of brands to run campaigns
            with founding creators. Early partners get direct support and locked
            launch pricing.
          </p>
        </div>
        <Link href={routes.contact} className="btn btn-primary">
          Apply for early access
        </Link>
      </div>
    </section>
  );
}
