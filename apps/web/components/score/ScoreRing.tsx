/**
 * A 0–100 score as a neutral ring. Scores aren't check results, so the ring
 * is monochrome, and the value snaps in rather than counting up.
 */
export function ScoreRing({
  value,
  size = 96,
  label,
}: {
  value: number;
  size?: number;
  /** @deprecated Scores no longer animate; kept for call-site compatibility. */
  animate?: boolean;
  label?: string;
}) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label ?? `Score ${value} out of 100`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--vz-line)"
        strokeWidth="6"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--vz-ink)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="var(--vz-ink)"
        fontSize={size * 0.3}
        fontWeight={600}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </text>
    </svg>
  );
}
