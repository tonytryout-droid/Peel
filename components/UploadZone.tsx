"use client";

import { useCallback, useRef, useState } from "react";
import {
  getMaxImagePixels,
  isAllowedMimeType,
  isWithinFileSizeLimit,
  isWithinPixelLimit
} from "@/lib/validation";

interface UploadZoneProps {
  onFile: (file: File) => void;
}

async function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  if ("createImageBitmap" in window) {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to inspect image dimensions."));
    };
    image.src = url;
  });
}

export function UploadZone({ onFile }: UploadZoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const validateAndSend = useCallback(
    async (file: File) => {
      setError(null);
      setChecking(true);

      try {
        if (!isAllowedMimeType(file.type)) {
          throw new Error("Only JPG, PNG, and WEBP are supported.");
        }
        if (!isWithinFileSizeLimit(file.size)) {
          throw new Error("Max file size is 10MB.");
        }

        const dimensions = await readImageDimensions(file);
        if (!isWithinPixelLimit(dimensions.width, dimensions.height)) {
          throw new Error(
            `Image too large. Max ${getMaxImagePixels().toLocaleString()} pixels (4MP).`
          );
        }

        onFile(file);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Invalid image.");
      } finally {
        setChecking(false);
      }
    },
    [onFile]
  );

  return (
    <section
      style={{
        border: `2px dashed ${dragging ? "var(--primary)" : "var(--border-strong)"}`,
        borderRadius: "var(--radius-xl)",
        padding: "56px 40px",
        textAlign: "center",
        background: dragging ? "var(--surface-raised)" : "var(--surface)",
        boxShadow: "var(--shadow-sm)",
        transition: "border-color 0.15s, background 0.15s",
        cursor: "pointer"
      }}
      onClick={() => inputRef.current?.click()}
      onDragEnter={(event) => {
        event.preventDefault();
        dragCounterRef.current++;
        if (dragCounterRef.current > 0) {
          setDragging(true);
        }
      }}
      onDragOver={(event) => { event.preventDefault(); }}
      onDragLeave={() => {
        dragCounterRef.current--;
        if (dragCounterRef.current === 0) {
          setDragging(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        dragCounterRef.current = 0;
        setDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file) {
          void validateAndSend(file);
        }
      }}
    >
      {/* Upload icon */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          borderRadius: "var(--radius-md)",
          background: "var(--surface-raised)",
          border: "1px solid var(--border)",
          marginBottom: 16
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 16V8M12 8l-3 3M12 8l3 3" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 16.8A4 4 0 0 1 4 9a5 5 0 0 1 9.9-1A4 4 0 1 1 17 16.8" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h2 style={{ margin: "0 0 8px", fontSize: "1.2rem", fontWeight: 700 }}>
        {dragging ? "Drop to upload" : "Upload your image"}
      </h2>
      <p style={{ margin: "0 0 24px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
        Drag and drop or click to browse &mdash; JPG, PNG, WEBP, max 10MB
      </p>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        disabled={checking}
        style={{ background: "var(--primary)", color: "var(--primary-fg)", padding: "11px 24px" }}
      >
        {checking ? "Checking…" : "Choose File"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void validateAndSend(file);
          }
        }}
      />

      {error ? (
        <p
          style={{
            margin: "20px 0 0",
            color: "var(--danger)",
            fontSize: "0.875rem",
            fontWeight: 500
          }}
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
