type ImageSlotProps = {
  id?: string;
  shape?: "rect" | "circle" | string;
  label?: string;
  className?: string;
};

function hashLabel(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

const PALETTES = [
  ["#F2994A", "#EB5757"],
  ["#56CCF2", "#2F80ED"],
  ["#9B51E0", "#6C4CF1"],
  ["#0FA968", "#56CCF2"],
  ["#F2C94C", "#F2994A"],
  ["#BB6BD9", "#6C4CF1"],
] as const;

export function ImageSlot({
  id,
  shape = "rect",
  label = "Image",
  className,
}: ImageSlotProps) {
  const seed = hashLabel(id ?? label);
  const palette = PALETTES[seed % PALETTES.length] ?? PALETTES[0];
  const [a, b] = palette;
  const isCircle = shape === "circle";

  return (
    <span
      id={id}
      className={`image-slot${isCircle ? " is-circle" : ""}${className ? ` ${className}` : ""}`}
      role="img"
      aria-label={label}
      style={{
        background: `linear-gradient(135deg, ${a}, ${b})`,
      }}
      data-label={label}
    />
  );
}
