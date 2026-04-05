"use client";

import { useEffect, useState } from "react";
import { useBrushCanvas } from "@/hooks/useBrushCanvas";

interface MaskCanvasProps {
  imageFile: File;
  onSubmit: (imageDataUrl: string, maskDataUrl: string) => void;
}

export function MaskCanvas({ imageFile, onSubmit }: MaskCanvasProps) {
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

  return (
    <section style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 12 }}>
        <canvas
          ref={displayRef}
          style={{
            width: "100%",
            maxWidth: 840,
            borderRadius: 10,
            touchAction: "none",
            border: "1px solid #e5e7eb"
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        />
        <canvas ref={maskRef} style={{ display: "none" }} />
      </div>

      <aside style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
        <h3 style={{ marginTop: 0 }}>Mask</h3>
        <p style={{ marginTop: 0, color: "#4b5563" }}>
          Brush over the object to remove. Red area will be inpainted.
        </p>
        {dimensions ? (
          <p style={{ color: "#4b5563" }}>
            Source: {dimensions.width}x{dimensions.height}
          </p>
        ) : null}
        <label htmlFor="brush-size">Brush size: {brushSize}px</label>
        <input
          id="brush-size"
          type="range"
          min={8}
          max={84}
          value={brushSize}
          onChange={(event) => setBrushSize(Number(event.target.value))}
          style={{ width: "100%" }}
        />
        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          <button
            type="button"
            onClick={() => onSubmit(exportOriginalImage(), exportMask())}
            disabled={!isReady}
            style={{ background: "#0f172a", color: "#fff" }}
          >
            Remove Object
          </button>
          <button type="button" onClick={clearMask} disabled={!isReady}>
            Clear Mask
          </button>
        </div>
      </aside>
    </section>
  );
}
