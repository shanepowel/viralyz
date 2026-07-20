import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "Viralyz";
  const scoreParam = searchParams.get("score");
  const score = scoreParam ? Number.parseInt(scoreParam, 10) : null;
  const hasScore = score != null && Number.isFinite(score);

  const ringColor =
    hasScore && score! >= 75
      ? "#1E9E5A"
      : hasScore && score! >= 50
        ? "#D9930D"
        : "#DC4A3D";

  const size = 120;
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const offset = hasScore ? c * (1 - score! / 100) : c;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FBFAF7",
          padding: 64,
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#4F46E5",
            fontSize: 28,
            fontFamily: "sans-serif",
            fontWeight: 600,
          }}
        >
          Viralyz
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 40 }}>
          <div
            style={{
              flex: 1,
              fontSize: title.length > 60 ? 42 : 54,
              fontWeight: 700,
              color: "#1A1D23",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
          {hasScore ? (
            <div style={{ display: "flex", position: "relative", width: size, height: size }}>
              <svg width={size} height={size}>
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke="#E7E4DC"
                  strokeWidth="8"
                />
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${c}`}
                  strokeDashoffset={offset}
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  fontWeight: 700,
                  fontFamily: "monospace",
                  color: "#1A1D23",
                }}
              >
                {score}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
