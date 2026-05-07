"use client";

// Renders when the root layout itself fails — we have no Tailwind, no
// fonts, no providers, so this is intentionally inline-styled.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          background: "#f7f4ee",
          color: "#141414",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <p style={{ fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", color: "#c2410c", margin: 0 }}>
            BuildingSync
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: "16px 0 8px" }}>Something went wrong</h1>
          <p style={{ fontSize: 14, color: "#666", lineHeight: 1.5, margin: "0 0 24px" }}>
            The app failed to load. Please try refreshing the page. If this keeps happening, email{" "}
            <a href="mailto:info@buildingsync.app" style={{ color: "#c2410c" }}>info@buildingsync.app</a>.
          </p>
          {error.digest && (
            <p style={{ fontFamily: "monospace", fontSize: 10, color: "#999", margin: "0 0 24px" }}>
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#c2410c",
              color: "#fff",
              border: 0,
              borderRadius: 6,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
