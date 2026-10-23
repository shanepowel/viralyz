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
          background: "#FFFFFF",
          color: "#0A0A0A",
          padding: 48,
          // Global errors render outside the root layout, so tokens.css
          // isn't loaded: these are the Studio light-theme values.
        }}
      >
        <p style={{ fontVariantNumeric: "tabular-nums", fontSize: 14, color: "#5E6166" }}>
          500
        </p>
        <h1 style={{ fontSize: 32, marginTop: 8 }}>Something went wrong.</h1>
        <p style={{ marginTop: 12, color: "#5E6166" }}>
          Reload the page or email hello@viralyz.com.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 24,
            minHeight: 44,
            padding: "0 22px",
            background: "#0A0A0A",
            color: "#FFFFFF",
            border: 0,
            borderRadius: 999,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
