"use client";

import { useCallback, useRef, useState } from "react";
import { PointerEvent as ReactPointerEvent } from "react";
import { CanvasScale, mapBrushRadiusToMaskRadius, mapDisplayPointToMaskPoint } from "@/hooks/brush-math";

interface UseBrushCanvasOptions {
  brushSize: number;
}

interface Position {
  x: number;
  y: number;
}

export function useBrushCanvas({ brushSize }: UseBrushCanvasOptions) {
  const displayRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastDisplayPosRef = useRef<Position | null>(null);
  const [displaySize, setDisplaySize] = useState<{ width: number; height: number } | null>(null);
  const [maskSize, setMaskSize] = useState<{ width: number; height: number } | null>(null);

  const getScale = useCallback((): CanvasScale | null => {
    if (!displaySize || !maskSize) {
      return null;
    }
    return {
      displayWidth: displaySize.width,
      displayHeight: displaySize.height,
      maskWidth: maskSize.width,
      maskHeight: maskSize.height
    };
  }, [displaySize, maskSize]);

  const paintCircle = useCallback(
    (displayPos: Position) => {
      const displayCanvas = displayRef.current;
      const maskCanvas = maskRef.current;
      const scale = getScale();
      if (!displayCanvas || !maskCanvas || !scale) {
        return;
      }

      const displayCtx = displayCanvas.getContext("2d");
      const maskCtx = maskCanvas.getContext("2d");
      if (!displayCtx || !maskCtx) {
        return;
      }

      const displayRadius = brushSize / 2;
      displayCtx.fillStyle = "rgba(239, 68, 68, 0.45)";
      displayCtx.beginPath();
      displayCtx.arc(displayPos.x, displayPos.y, displayRadius, 0, Math.PI * 2);
      displayCtx.fill();

      const maskPoint = mapDisplayPointToMaskPoint(displayPos.x, displayPos.y, scale);
      const maskRadius = mapBrushRadiusToMaskRadius(displayRadius, scale);
      maskCtx.fillStyle = "#ffffff";
      maskCtx.beginPath();
      maskCtx.arc(maskPoint.x, maskPoint.y, maskRadius, 0, Math.PI * 2);
      maskCtx.fill();
    },
    [brushSize, getScale]
  );

  const paintStroke = useCallback(
    (displayPos: Position) => {
      paintCircle(displayPos);

      if (!lastDisplayPosRef.current) {
        lastDisplayPosRef.current = displayPos;
        return;
      }

      const dx = displayPos.x - lastDisplayPosRef.current.x;
      const dy = displayPos.y - lastDisplayPosRef.current.y;
      const distance = Math.hypot(dx, dy);
      const step = Math.max(1, brushSize * 0.3);
      const steps = Math.ceil(distance / step);

      for (let i = 1; i < steps; i += 1) {
        paintCircle({
          x: lastDisplayPosRef.current.x + (dx * i) / steps,
          y: lastDisplayPosRef.current.y + (dy * i) / steps
        });
      }

      lastDisplayPosRef.current = displayPos;
    },
    [brushSize, paintCircle]
  );

  const getDisplayPointerPosition = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = displayRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  }, []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      isDrawingRef.current = true;
      lastDisplayPosRef.current = null;
      paintStroke(getDisplayPointerPosition(event));
    },
    [getDisplayPointerPosition, paintStroke]
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) {
        return;
      }
      event.preventDefault();
      paintStroke(getDisplayPointerPosition(event));
    },
    [getDisplayPointerPosition, paintStroke]
  );

  const onPointerUp = useCallback(() => {
    isDrawingRef.current = false;
    lastDisplayPosRef.current = null;
  }, []);

  const loadImage = useCallback(async (file: File): Promise<{ width: number; height: number }> => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      image.onload = () => {
        resolve({ width: image.naturalWidth, height: image.naturalHeight });
      };
      image.onerror = () => reject(new Error("Unable to load image."));
      image.src = url;
    });

    imageRef.current = image;

    const displayMaxWidth = 800;
    const scale = Math.min(1, displayMaxWidth / dimensions.width);
    const displayWidth = Math.round(dimensions.width * scale);
    const displayHeight = Math.round(dimensions.height * scale);

    const displayCanvas = displayRef.current;
    const maskCanvas = maskRef.current;
    if (!displayCanvas || !maskCanvas) {
      URL.revokeObjectURL(url);
      throw new Error("Canvas not available.");
    }

    displayCanvas.width = displayWidth;
    displayCanvas.height = displayHeight;
    maskCanvas.width = dimensions.width;
    maskCanvas.height = dimensions.height;

    setDisplaySize({ width: displayWidth, height: displayHeight });
    setMaskSize({ width: dimensions.width, height: dimensions.height });

    const displayCtx = displayCanvas.getContext("2d");
    const maskCtx = maskCanvas.getContext("2d");
    if (!displayCtx || !maskCtx) {
      URL.revokeObjectURL(url);
      throw new Error("Unable to initialize canvas contexts.");
    }

    displayCtx.clearRect(0, 0, displayWidth, displayHeight);
    displayCtx.drawImage(image, 0, 0, displayWidth, displayHeight);

    maskCtx.fillStyle = "#000000";
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    URL.revokeObjectURL(url);
    return dimensions;
  }, []);

  const clearMask = useCallback(() => {
    const image = imageRef.current;
    const displayCanvas = displayRef.current;
    const maskCanvas = maskRef.current;
    if (!image || !displayCanvas || !maskCanvas) {
      return;
    }

    const displayCtx = displayCanvas.getContext("2d");
    const maskCtx = maskCanvas.getContext("2d");
    if (!displayCtx || !maskCtx) {
      return;
    }

    displayCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    displayCtx.drawImage(image, 0, 0, displayCanvas.width, displayCanvas.height);

    maskCtx.fillStyle = "#000000";
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
  }, []);

  const exportMask = useCallback(() => {
    if (!maskRef.current) {
      throw new Error("Mask canvas not initialized.");
    }
    return maskRef.current.toDataURL("image/png");
  }, []);

  const exportOriginalImage = useCallback(() => {
    const image = imageRef.current;
    if (!image) {
      throw new Error("Image not loaded.");
    }
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to render image.");
    }
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
    return canvas.toDataURL("image/png");
  }, []);

  return {
    displayRef,
    maskRef,
    loadImage,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    clearMask,
    exportMask,
    exportOriginalImage
  };
}
