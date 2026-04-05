"use client";

interface ResultViewerProps {
  originalUrl: string | null;
  resultUrl: string;
  elapsedMs: number | null;
}

export function ResultViewer({ originalUrl, resultUrl, elapsedMs }: ResultViewerProps) {
  return (
    <section style={{ display: "grid", gap: 16 }}>
      <h2 style={{ marginBottom: 0 }}>Result</h2>
      {elapsedMs !== null ? <p style={{ margin: 0 }}>Completed in {(elapsedMs / 1000).toFixed(1)}s</p> : null}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: originalUrl ? "1fr 1fr" : "1fr",
          gap: 12
        }}
      >
        {originalUrl ? (
          <figure style={{ margin: 0 }}>
            <img src={originalUrl} alt="Original" style={{ width: "100%", borderRadius: 10 }} />
            <figcaption>Original</figcaption>
          </figure>
        ) : null}
        <figure style={{ margin: 0 }}>
          <img src={resultUrl} alt="Inpaint result" style={{ width: "100%", borderRadius: 10 }} />
          <figcaption>Result</figcaption>
        </figure>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <a href={resultUrl} download="peel-result.png">
          Download
        </a>
      </div>
    </section>
  );
}
