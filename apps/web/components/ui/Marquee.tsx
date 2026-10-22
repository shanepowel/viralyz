const ITEMS = [
  "Contrast check ✓",
  "Safe zone ✓",
  "Character limits ✓",
  "Policy check ✓",
  "Hook strength assessed",
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
