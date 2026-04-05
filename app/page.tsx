import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "88vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 0
      }}
    >
      <div className="animate-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <span
          style={{
            display: "inline-block",
            background: "#0f172a",
            color: "#fff",
            borderRadius: 99,
            padding: "5px 14px",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase"
          }}
        >
          AI Inpainting
        </span>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(3rem, 8vw, 5rem)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.05
          }}
        >
          Peel
        </h1>

        <p
          style={{
            margin: 0,
            color: "var(--text-muted)",
            fontSize: "1.15rem",
            maxWidth: 440,
            lineHeight: 1.65
          }}
        >
          Remove stickers, objects, and unwanted elements from photos with precision masking and AI inpainting.
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <Link
            href="/editor"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--primary)",
              color: "var(--primary-fg)",
              borderRadius: "var(--radius-md)",
              padding: "13px 28px",
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
              boxShadow: "var(--shadow-md)",
              letterSpacing: "-0.01em",
              transition: "opacity 0.15s ease, box-shadow 0.15s ease"
            }}
          >
            Open Editor
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        <p style={{ margin: 0, color: "var(--text-subtle)", fontSize: "0.825rem" }}>
          Supports JPG, PNG, WEBP &mdash; up to 10MB
        </p>
      </div>
    </main>
  );
}
