import { MARKETING_TESTIMONIALS } from "@repo/config";

export function TestimonialsSection() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Loved by Creators</h2>
          <p className="mt-3 text-muted-foreground">Join thousands who stopped guessing</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {MARKETING_TESTIMONIALS.map((t) => (
            <blockquote key={t.name} className="card-base flex flex-col rounded-2xl p-6">
              <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.handle}</p>
                </div>
              </div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
