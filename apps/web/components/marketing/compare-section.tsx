import { Check, Minus } from "lucide-react";
import { MARKETING_COMPARISON } from "@repo/config";

function Cell({ value }: { value: boolean }) {
  return value ? (
    <Check className="h-5 w-5 text-emerald-400 mx-auto" aria-label="Yes" />
  ) : (
    <Minus className="h-5 w-5 text-slate-600 mx-auto" aria-label="No" />
  );
}

export function CompareSection() {
  return (
    <section className="py-24 px-6 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#E85D3B] mb-3">
            Why Viralyz
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            More than clipping. Smarter than SEO tools.
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Opus Clip repurposes after you film. vidIQ optimizes after you
            publish. Viralyz scores and fixes content before it goes live — then
            tracks whether the prediction was right.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.02]">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-left p-4 text-slate-400 font-medium">Feature</th>
                <th className="p-4 text-center font-semibold text-[#E85D3B]">Viralyz</th>
                <th className="p-4 text-center text-slate-400 font-medium">Opus Clip</th>
                <th className="p-4 text-center text-slate-400 font-medium">vidIQ</th>
                <th className="p-4 text-center text-slate-400 font-medium">TubeBuddy</th>
              </tr>
            </thead>
            <tbody>
              {MARKETING_COMPARISON.map((row) => (
                <tr
                  key={row.feature}
                  className="border-b border-white/[0.04] last:border-0"
                >
                  <td className="p-4 text-slate-200">{row.feature}</td>
                  <td className="p-4 bg-[#E85D3B]/5">
                    <Cell value={row.viralyz} />
                  </td>
                  <td className="p-4">
                    <Cell value={row.opus} />
                  </td>
                  <td className="p-4">
                    <Cell value={row.vidiq} />
                  </td>
                  <td className="p-4">
                    <Cell value={row.tubebuddy} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
