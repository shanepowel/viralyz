import { MARKETING_STATS } from "@repo/config";

export function StatsSection() {
  return (
    <section className="border-y border-white/[0.06] bg-white/[0.02] px-6 py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
        {MARKETING_STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-display text-3xl font-bold tracking-tight text-gradient md:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
