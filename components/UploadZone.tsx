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
  const inputRef = useRef<HTMLInputElement>(null);

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
        border: "2px dashed #d1d5db",
        borderRadius: 16,
        padding: 40,
        textAlign: "center",
        background: "#ffffff"
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file) {
          void validateAndSend(file);
        }
      }}
    >
      <h2 style={{ marginTop: 0 }}>Upload your image</h2>
      <p>JPG, PNG, WEBP. Max 10MB and 4 megapixels.</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={checking}
        style={{ background: "#0f172a", color: "#fff" }}
      >
        {checking ? "Checking..." : "Choose File"}
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
      {error ? <p style={{ color: "#b91c1c", marginBottom: 0 }}>{error}</p> : null}
    </section>
  );
}
