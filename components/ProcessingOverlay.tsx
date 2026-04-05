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
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {(["Uploading", "Processing"] as const).map((label, i) => {
          const stepDone = i === 0 && isInferring;
          const previousStepDone = i > 0 && (i - 1) === 0 && isInferring;
          const stepActive = (i === 0 && !isInferring) || (i === 1 && isInferring);
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {i > 0 && (
                <div
                  style={{
                    width: 24,
                    height: 2,
                    borderRadius: 1,
                    background: previousStepDone ? "var(--primary)" : "var(--border)"
                  }}
                />
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: stepDone
                      ? "var(--primary)"
                      : stepActive
                        ? "var(--accent)"
                        : "var(--border)"
                  }}
                />
                <span
                  style={{
                    fontSize: "0.8rem",
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
