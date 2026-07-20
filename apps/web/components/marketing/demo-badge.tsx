export function DemoBadge({
  label = "Example profile",
}: {
  label?: string;
}) {
  return (
    <span
      className="demo-badge"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        borderRadius: 999,
        background: "var(--violet-soft, #efebff)",
        padding: "2px 8px",
        fontSize: 12,
        fontWeight: 600,
        color: "var(--violet-deep, #5638d6)",
        verticalAlign: "middle",
      }}
    >
      {label}
    </span>
  );
}
