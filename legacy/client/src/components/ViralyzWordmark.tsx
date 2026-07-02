interface ViralyzWordmarkProps {
  size?: number;
  variant?: "light" | "dark";
  className?: string;
}

export function ViralyzWordmark({ size = 32, variant = "dark", className = "" }: ViralyzWordmarkProps) {
  const textColor = variant === "light" ? "text-white" : "text-[#2A2522]";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="rounded-lg bg-[#E85D3B] flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="bg-white rounded-sm" style={{ width: size * 0.36, height: size * 0.36 }} />
      </span>
      <span className={`font-semibold tracking-tight ${textColor}`} style={{ fontSize: size * 0.6 }}>
        Viralyz
      </span>
    </span>
  );
}
