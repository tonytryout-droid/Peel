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
            background: "var(--primary)",
            color: "var(--primary-fg)",
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

        {/* How it works */}
        <div
          style={{
            display: "flex",
            gap: 0,
            alignItems: "flex-start",
            marginTop: 8,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "14px 20px",
            boxShadow: "var(--shadow-sm)"
          }}
        >
          {[
            { n: "1", label: "Upload", desc: "Drop your photo" },
            { n: "2", label: "Mask", desc: "Paint the object" },
            { n: "3", label: "Download", desc: "Get the clean result" },
          ].map(({ n, label, desc }, i) => (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {i > 0 && (
                <div style={{
                  width: 24,
                  height: 1,
                  background: "var(--border)",
                  margin: "0 12px",
                  marginBottom: 14,
                  flexShrink: 0
                }} />
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "var(--surface-raised)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {n}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.825rem", fontWeight: 700, lineHeight: 1.2 }}>{label}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.3 }}>{desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Supported formats */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {["JPG", "PNG", "WEBP"].map((fmt) => (
            <span
              key={fmt}
              style={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                borderRadius: 99,
                padding: "2px 10px",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--text-muted)"
              }}
            >
              {fmt}
            </span>
          ))}
          <span style={{ color: "var(--text-subtle)", fontSize: "0.75rem" }}>&mdash; up to 10MB</span>
        </div>
      </div>
    </main>
  );
}
