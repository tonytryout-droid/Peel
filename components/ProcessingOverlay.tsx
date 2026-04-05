"use client";

interface ProcessingOverlayProps {
  phase: "uploading" | "inferring";
}

export function ProcessingOverlay({ phase }: ProcessingOverlayProps) {
  const isInferring = phase === "inferring";

  return (
    <section
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius-lg)",
        padding: "52px 40px",
        textAlign: "center",
        boxShadow: "var(--shadow-sm)",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "3px solid var(--border)",
          borderTopColor: "var(--primary)",
          animation: "spin 0.7s linear infinite"
        }}
        aria-hidden
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
          {isInferring ? "Inpainting in progress…" : "Uploading assets…"}
        </h2>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>
          {isInferring
            ? "This usually completes in a few seconds."
            : "Preparing image and mask for processing."}
        </p>
      </div>

      {/* Step indicators */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {(["Uploading", "Processing"] as const).map((label, i) => {
          const stepDone = i === 0 && isInferring;
          const stepActive = (i === 0 && !isInferring) || (i === 1 && isInferring);
          return (
            <div key={label} style={{ display: "flex", alignItems: "flex-start" }}>
              {i > 0 && (
                <div
                  style={{
                    width: 36,
                    height: 2,
                    marginTop: 13,
                    flexShrink: 0,
                    background: isInferring ? "var(--primary)" : "var(--border)",
                    transition: "background 0.3s ease"
                  }}
                />
              )}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: stepDone || stepActive ? "var(--primary)" : "var(--border)",
                    color: stepDone || stepActive ? "#fff" : "var(--text-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    flexShrink: 0,
                    transition: "background 0.3s ease, color 0.3s ease"
                  }}
                >
                  {stepDone ? (
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                      <path d="M2.5 6.5l3 3 5-5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (i + 1)}
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: stepActive ? "var(--text)" : stepDone ? "var(--text-muted)" : "var(--text-subtle)"
                  }}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
