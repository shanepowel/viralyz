import Link from "next/link";
import { routes } from "@/lib/site";

export function FinalCta({
  title,
  subtitle,
  cta = "Start free",
  href,
}: {
  title: string;
  subtitle: string;
  cta?: string;
  href?: string;
}) {
  const appUrl = href ?? routes.signup;
  return (
    <section className="final">
      <div className="wrap">
        <div className="final-card">
          <h2>{title}</h2>
          <p>{subtitle}</p>
          <Link className="btn btn-white btn-lg" href={appUrl}>
            {cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
