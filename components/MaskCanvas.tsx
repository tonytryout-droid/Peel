"use client";

import { useEffect, useState } from "react";
import { useBrushCanvas } from "@/hooks/useBrushCanvas";

interface MaskCanvasProps {
  imageFile: File;
  onSubmit: (imageDataUrl: string, maskDataUrl: string) => void;
  processing?: boolean;
}

export function MaskCanvas({ imageFile, onSubmit, processing = false }: MaskCanvasProps) {
  const [brushSize, setBrushSize] = useState(28);
  const [isReady, setIsReady] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const {
    displayRef,
    maskRef,
    loadImage,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    clearMask,
    exportMask,
    exportOriginalImage
  } = useBrushCanvas({ brushSize });

  useEffect(() => {
    setIsReady(false);
    let cancelled = false;
    loadImage(imageFile)
      .then((next) => {
        if (!cancelled) {
          setDimensions(next);
          setIsReady(true);
        }
      })
      .catch(() => {
        // loadImage throws with a descriptive message;
        // isReady stays false, preventing submission
      });
    return () => {
      cancelled = true;
    };
  }, [imageFile, loadImage]);

  const canSubmit = isReady && !processing;

  return (
    <section style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16, alignItems: "start" }}>
      {/* Canvas panel */}
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          padding: 14,
          boxShadow: "var(--shadow-sm)",
          border: "1px solid var(--border)"
        }}
      >
        <canvas
          ref={displayRef}
          style={{
            width: "100%",
            maxWidth: 840,
            borderRadius: "var(--radius-md)",
            touchAction: "none",
            border: "1px solid var(--border)",
            display: "block"
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        />
        <canvas ref={maskRef} style={{ display: "none" }} />
      </div>

      {/* Sidebar */}
      <aside
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          padding: 20,
          boxShadow: "var(--shadow-sm)",
          border: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: 20
        }}
      >
        {/* Instructions */}
        <div>
          <h3 style={{ margin: "0 0 6px", fontSize: "0.95rem", fontWeight: 700 }}>Mask</h3>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.55 }}>
            Brush over the object to remove. The red area will be inpainted.
          </p>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--border)" }} />

        {/* Brush size */}
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label htmlFor="brush-size" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              Brush size
            </label>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "2px 8px"
              }}
            >
              {brushSize}px
            </span>
          </div>
          <input
            id="brush-size"
            type="range"
            min={8}
            max={84}
            value={brushSize}
            onChange={(event) => setBrushSize(Number(event.target.value))}
            style={{ width: "100%" }}
            disabled={processing}
          />
        </div>

        {/* Image info */}
        {dimensions ? (
          <p
            style={{
              margin: 0,
              color: "var(--text-subtle)",
              fontSize: "0.78rem",
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "6px 10px"
            }}
          >
            {dimensions.width} x {dimensions.height}px
          </p>
        ) : null}

        {/* Divider */}
        <div style={{ borderTop: "1px solid var(--border)" }} />

        {/* Actions */}
        <div style={{ display: "grid", gap: 8 }}>
          <button
            type="button"
            onClick={() => onSubmit(exportOriginalImage(), exportMask())}
            disabled={!canSubmit}
            style={{
              background: "var(--primary)",
              color: "var(--primary-fg)",
              padding: "11px 16px",
              fontSize: "0.9rem",
              opacity: canSubmit ? 1 : 0.7
            }}
          >
            {processing ? "Removing object..." : "Remove Object"}
          </button>
          <button
            type="button"
            onClick={clearMask}
            disabled={!isReady || processing}
            style={{
              background: "var(--surface-raised)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              padding: "10px 16px",
              fontSize: "0.875rem"
            }}
          >
            Clear Mask
          </button>
        </div>
      </aside>
    </section>
  );
}
