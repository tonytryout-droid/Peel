"use client";

interface ResultViewerProps {
  originalUrl: string | null;
  resultUrl: string;
  elapsedMs: number | null;
}

function getDownloadFilename(url: string): string {
  try {
    const pathname = new URL(
      url,
      typeof window !== "undefined" ? window.location.href : "http://localhost"
    ).pathname;
    const baseName = pathname.split("/").pop()?.split("?")[0] || "result";
    const ext = baseName.includes(".") ? "" : ".png";
    return `${baseName}${ext}`;
  } catch {
    return "result.png";
  }
}

export function ResultViewer({ originalUrl, resultUrl, elapsedMs }: ResultViewerProps) {
  const downloadFilename = getDownloadFilename(resultUrl);

  return (
    <section
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius-lg)",
        padding: 24,
        boxShadow: "var(--shadow-sm)",
        border: "1px solid var(--border)",
        display: "grid",
        gap: 20
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "var(--success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>Done</h2>
          </div>
          {elapsedMs !== null ? (
            <span
              style={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                borderRadius: 99,
                padding: "3px 10px",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--text-muted)"
              }}
            >
              {(elapsedMs / 1000).toFixed(1)}s
            </span>
          ) : null}
        </div>

        <a
          href={resultUrl}
          download={downloadFilename}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: "var(--primary)",
            color: "var(--primary-fg)",
            borderRadius: "var(--radius-sm)",
            padding: "9px 16px",
            fontWeight: 600,
            fontSize: "0.875rem",
            textDecoration: "none",
            transition: "opacity 0.15s ease"
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M7 2v7M7 9l-2.5-2.5M7 9l2.5-2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 11h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          Download
        </a>
      </div>

      {/* Image comparison */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: originalUrl ? "1fr 1fr" : "1fr",
          gap: 12
        }}
      >
        {originalUrl ? (
          <figure style={{ margin: 0, display: "grid", gap: 8 }}>
            <img
              src={originalUrl}
              alt="Original"
              style={{
                width: "100%",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                display: "block"
              }}
            />
            <figcaption
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                textAlign: "center"
              }}
            >
              Original
            </figcaption>
          </figure>
        ) : null}

        <figure style={{ margin: 0, display: "grid", gap: 8 }}>
          <div>
            <img
              src={resultUrl}
              alt="Inpaint result"
              style={{
                width: "100%",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                display: "block"
              }}
            />
          </div>
          <figcaption
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--text-muted)",
              textAlign: "center"
            }}
          >
            Inpainted
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
