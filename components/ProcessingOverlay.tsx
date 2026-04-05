"use client";

interface ProcessingOverlayProps {
  phase: "uploading" | "inferring";
}

export function ProcessingOverlay({ phase }: ProcessingOverlayProps) {
  return (
    <section
      style={{
        background: "#ffffff",
        borderRadius: 14,
        padding: 32,
        textAlign: "center"
      }}
    >
      <h2 style={{ marginTop: 0 }}>
        {phase === "uploading" ? "Uploading assets..." : "Inpainting in progress..."}
      </h2>
      <p style={{ color: "#4b5563", marginBottom: 0 }}>
        {phase === "uploading"
          ? "Preparing image and mask."
          : "This usually completes in a few seconds."}
      </p>
    </section>
  );
}
