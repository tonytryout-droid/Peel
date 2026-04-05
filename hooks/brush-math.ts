export interface CanvasScale {
  displayWidth: number;
  displayHeight: number;
  maskWidth: number;
  maskHeight: number;
}

export function mapDisplayPointToMaskPoint(
  x: number,
  y: number,
  scale: CanvasScale
): { x: number; y: number } {
  const sx = scale.maskWidth / scale.displayWidth;
  const sy = scale.maskHeight / scale.displayHeight;
  return {
    x: x * sx,
    y: y * sy
  };
}

export function mapBrushRadiusToMaskRadius(displayRadius: number, scale: CanvasScale): number {
  const sx = scale.maskWidth / scale.displayWidth;
  const sy = scale.maskHeight / scale.displayHeight;
  const avg = (sx + sy) / 2;
  return displayRadius * avg;
}
