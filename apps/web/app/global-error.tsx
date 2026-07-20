"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#FBFAF7",
          color: "#1A1D23",
          padding: 48,
        }}
      >
        <p style={{ fontFamily: "monospace", fontSize: 14, opacity: 0.6 }}>
          500
        </p>
        <h1 style={{ fontSize: 32, marginTop: 8 }}>Something went wrong.</h1>
        <p style={{ marginTop: 12, opacity: 0.7 }}>
          Reload the page or email hello@viralyz.com.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 24,
            padding: "10px 18px",
            background: "#4F46E5",
            color: "#fff",
            border: 0,
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
