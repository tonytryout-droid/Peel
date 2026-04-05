"use client";

interface ProcessingOverlayProps {
  progress: number;
  previewUrl?: string | null;
}

export function ProcessingOverlay({ progress, previewUrl }: ProcessingOverlayProps) {
  return (
    <section
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius-lg)",
        padding: "40px 32px",
        boxShadow: "var(--shadow-sm)",
        border: "1px solid var(--border)",
        display: "grid",
        gap: 18
      }}
    >
      <div style={{ display: "grid", gap: 6 }}>
        <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>Removing object...</h2>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Running inpainting on the GPU. This usually finishes in a few seconds.
        </p>
      </div>

      <div
        style={{
          height: 8,
          borderRadius: 99,
          background: "var(--border)",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.max(0, Math.min(100, progress))}%`,
            borderRadius: 99,
            background: "linear-gradient(90deg, var(--primary), var(--accent))",
            transition: "width 0.2s ease"
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          minHeight: 260,
          overflow: "hidden",
          background: "var(--surface-raised)"
        }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Processing preview"
            style={{ width: "100%", display: "block", filter: "grayscale(20%)", opacity: 0.75 }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: 260,
              background: "linear-gradient(110deg, var(--surface-raised) 10%, #eef2f7 30%, var(--surface-raised) 45%)",
              backgroundSize: "200% 100%",
              animation: "fadeIn 0.4s ease"
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.25)"
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              border: "3px solid var(--border)",
              borderTopColor: "var(--primary)",
              animation: "spin 0.7s linear infinite"
            }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
