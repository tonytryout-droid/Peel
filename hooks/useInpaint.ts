"use client";

import { useMemo, useState } from "react";

export type InpaintPhase = "idle" | "processing" | "done" | "error";

const MAX_DIM = 1024;
const REQUEST_TIMEOUT_MS = 15_000;

async function loadImageElement(dataUrl: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.decoding = "async";

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Unable to decode image data."));
    image.src = dataUrl;
  });

  return image;
}

function renderImageToDataUrl(
  source: CanvasImageSource,
  width: number,
  height: number,
  smoothing: boolean
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to initialize canvas renderer.");
  }

  ctx.imageSmoothingEnabled = smoothing;
  ctx.drawImage(source, 0, 0, width, height);
  return canvas.toDataURL("image/png");
}

async function resizePayload(
  imageDataUrl: string,
  maskDataUrl: string
): Promise<{ imageDataUrl: string; maskDataUrl: string }> {
  const [image, mask] = await Promise.all([
    loadImageElement(imageDataUrl),
    loadImageElement(maskDataUrl)
  ]);

  const scale = Math.min(1, MAX_DIM / Math.max(image.naturalWidth, image.naturalHeight));
  if (scale === 1) {
    return { imageDataUrl, maskDataUrl };
  }

  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  return {
    imageDataUrl: renderImageToDataUrl(image, width, height, true),
    maskDataUrl: renderImageToDataUrl(mask, width, height, false)
  };
}

export function useInpaint() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const phase = useMemo<InpaintPhase>(() => {
    if (loading) {
      return "processing";
    }
    if (error) {
      return "error";
    }
    if (resultUrl) {
      return "done";
    }
    return "idle";
  }, [error, loading, resultUrl]);

  const run = async (imageDataUrl: string, maskDataUrl: string) => {
    setLoading(true);
    setProgress(0);
    setError(null);
    setResultUrl(null);
    setOriginalUrl(imageDataUrl);
    setElapsedMs(null);

    const startedAt = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const progressTimer = setInterval(() => {
      setProgress((current) => (current >= 90 ? current : Math.min(90, current + 5)));
    }, 250);

    try {
      const resized = await resizePayload(imageDataUrl, maskDataUrl);
      const response = await fetch("/api/inpaint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(resized),
        signal: controller.signal
      });

      if (!response.ok) {
        const fallback = await response.text().catch(() => "Unable to process image.");
        throw new Error(fallback);
      }

      let payload: { resultUrl?: string; error?: string };
      try {
        payload = (await response.json()) as { resultUrl?: string; error?: string };
      } catch {
        throw new Error("Invalid response format.");
      }

      if (!payload.resultUrl) {
        throw new Error(payload.error ?? "Missing result URL.");
      }

      setResultUrl(payload.resultUrl);
      setProgress(100);
      setElapsedMs(Date.now() - startedAt);
    } catch (caught) {
      if (caught instanceof Error && caught.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        const message = caught instanceof Error ? caught.message : "Unexpected error.";
        setError(message);
      }
      setProgress(0);
      setElapsedMs(Date.now() - startedAt);
    } finally {
      clearTimeout(timer);
      clearInterval(progressTimer);
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setProgress(0);
    setResultUrl(null);
    setOriginalUrl(null);
    setError(null);
    setElapsedMs(null);
  };

  return {
    run,
    reset,
    phase,
    loading,
    progress,
    resultUrl,
    originalUrl,
    error,
    elapsedMs
  };
}
