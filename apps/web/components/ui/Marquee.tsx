const ITEMS = [
  "Hook scored: 52 → 74",
  "Thumbnail readable at feed size ✓",
  "Five areas scored in under 30s",
  "Caption rewrite ready",
  "Rescore after each fix",
];

export function Marquee() {
  const track = [...ITEMS, ...ITEMS];
  return (
    <div
      className="vz-marquee overflow-hidden border-y border-line bg-sunken py-3"
      aria-hidden="true"
    >
      <div className="vz-marquee-track flex w-max gap-10 whitespace-nowrap px-4 text-sm text-ink-secondary">
        <span className="font-medium text-ink">Product preview</span>
        {track.map((item, i) => (
          <span key={`${item}-${i}`}>{item}</span>
        ))}
      </div>
    </div>
  );
}
