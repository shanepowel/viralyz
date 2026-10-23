/**
 * Drawn placeholder ads for fictional brands. They stand in until real
 * customer variants come from Sanity, and must always sit next to a visible
 * "fictional brands" caption. Their colours are the ads' own, which is the
 * only place colour enters the chrome besides check results. Text colours
 * keep the contrast the demos claim real (Rove's headline is 6.0:1).
 */

const brandLabel = "text-xs font-bold tracking-[0.14em]";

export function HaldenAd() {
  return (
    <div className="flex h-full flex-col justify-between bg-[#D5E5D8] p-[min(22px,9cqw)] text-[#1E3A2A]">
      <div className={brandLabel}>HALDEN</div>
      <div className="flex items-end justify-between gap-2.5">
        <div className="max-w-[9ch] font-display text-[min(25px,12cqw)]">
          Skin that drinks it in.
        </div>
        <div className="flex flex-col items-center" aria-hidden="true">
          <div className="h-4 w-[22px] rounded-t bg-[#1E3A2A]" />
          <div className="h-[min(104px,40cqw)] w-[min(56px,22cqw)] rounded-inner bg-[#F4F1EA] shadow-[inset_-10px_0_0_rgba(0,0,0,.06)]" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-[#1E3A2A] px-3.5 py-[7px] text-xs font-semibold text-[#F4F1EA]">
          Shop now
        </span>
        <span className="text-[13px] font-semibold tabular">£24</span>
      </div>
    </div>
  );
}

export function RoveAd({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  const cup = { sm: "h-14 w-14", md: "h-[104px] w-[104px]", lg: "h-[120px] w-[120px]" }[size];
  const inner = { sm: "h-9 w-9", md: "h-[66px] w-[66px]", lg: "h-[78px] w-[78px]" }[size];
  const title = { sm: "text-sm", md: "text-[26px]", lg: "text-[30px]" }[size];
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3.5 bg-[#F26B3A] text-[#2A0E04]">
      <div
        className={`flex items-center justify-center rounded-full bg-[#3A1608] ${cup}`}
        aria-hidden="true"
      >
        <div className={`rounded-full bg-[#7A3A1C] ${inner}`} />
      </div>
      <div className={`text-center font-display ${title}`}>
        Your 7am, sorted.
      </div>
    </div>
  );
}

/** Rove's CTA, outlined to show it sits under the platform UI. */
export function RoveCta({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  const cls = {
    sm: "px-2.5 py-1 text-[9px] outline-2 outline-offset-2",
    md: "px-4 py-2 text-[13px] outline-[2.5px] outline-offset-[3px]",
    lg: "px-[18px] py-[9px] text-[13px] outline-2 outline-offset-4 outline-dashed",
  }[size];
  return (
    <span
      className={`absolute bottom-[9%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FFF4EC] font-semibold text-[#3A1608] outline outline-[#F2B83A] ${cls}`}
    >
      Subscribe &amp; save
    </span>
  );
}

export function RoveStoryAd() {
  return (
    <div className="relative flex h-full flex-col justify-between bg-[#F26B3A] p-[min(22px,9cqw)]">
      <div className={`${brandLabel} text-[#3A1608]`}>ROVE COFFEE</div>
      <div className="flex flex-col items-center gap-[min(14px,6cqw)]">
        <div
          className="flex h-[min(120px,52cqw)] w-[min(120px,52cqw)] items-center justify-center rounded-full bg-[#3A1608]"
          aria-hidden="true"
        >
          <div className="h-[min(78px,34cqw)] w-[min(78px,34cqw)] rounded-full bg-[#7A3A1C]" />
        </div>
        <div className="text-center font-display text-[min(30px,14cqw)] text-[#2A0E04]">
          Your 7am, sorted.
        </div>
      </div>
      <div className="flex justify-center">
        <span className="rounded-full bg-[#FFF4EC] px-[min(18px,7cqw)] py-[min(9px,4cqw)] text-[min(13px,6cqw)] whitespace-nowrap font-semibold text-[#3A1608] outline-2 outline-offset-4 outline-dashed outline-[#3A1608]">
          Subscribe &amp; save
        </span>
      </div>
    </div>
  );
}

export function PepaAd() {
  return (
    <div className="flex h-full flex-col justify-between bg-[#F4D23C] p-[min(22px,9cqw)] text-[#111111]">
      <div className="flex justify-between">
        <span className={brandLabel}>PEPA</span>
        <span className="rounded-full bg-[#111111] px-2.5 py-1 text-[11px] font-bold text-[#F4D23C]">
          NEW
        </span>
      </div>
      <div
        className="relative h-[46px] w-[70%] self-center rounded-[40px_60px_14px_14px] bg-[#111111]"
        aria-hidden="true"
      >
        <div className="absolute inset-x-0 bottom-0 h-2.5 rounded-b-[14px] bg-[#FFFFFF]" />
      </div>
      <div className="font-display text-[min(24px,12cqw)]">Run light.</div>
    </div>
  );
}

export function OstraAd() {
  return (
    <div className="flex h-full flex-col justify-between bg-[#F6C1CF] p-[min(22px,9cqw)] text-[#4A1226]">
      <div className={brandLabel}>OSTRA</div>
      <div className="flex flex-col items-start gap-[min(16px,6cqw)]">
        <div className="font-display text-[min(30px,14cqw)]">
          <span className="bg-[#C2253A]/20 line-through decoration-[#C2253A] decoration-2 shadow-[0_0_0_3px_rgba(194,37,58,.18)]">
            Drop 5kg
          </span>{" "}
          in a week.
        </div>
        <div
          className="flex h-[min(130px,56cqw)] w-[min(84px,36cqw)] items-center justify-center self-center rounded-[16px_16px_22px_22px] bg-[#4A1226]"
          aria-hidden="true"
        >
          <span className="text-[11px] font-bold tracking-[0.1em] text-[#F6C1CF]">
            WHEY
          </span>
        </div>
      </div>
      <span className="self-start rounded-full bg-[#4A1226] px-[min(18px,7cqw)] py-[min(9px,4cqw)] text-[min(13px,6cqw)] whitespace-nowrap font-semibold text-[#F6C1CF]">
        Shop now
      </span>
    </div>
  );
}

export function NordlysAd() {
  return (
    <div className="flex h-full flex-col justify-between bg-[#1D2A55] p-[min(22px,9cqw)] text-[#E9E2D0]">
      <div className={brandLabel}>NORDLYS</div>
      <div
        className="relative h-10 w-4/5 self-center rounded-[30px] bg-[#E9E2D0]"
        aria-hidden="true"
      >
        <div className="absolute left-[18%] top-3.5 h-1 w-[22%] rounded bg-[#1D2A55]" />
        <div className="absolute right-[18%] top-3.5 h-1 w-[22%] rounded bg-[#1D2A55]" />
      </div>
      <div className="font-display text-[min(23px,11.5cqw)]">Darkness, on demand.</div>
    </div>
  );
}
