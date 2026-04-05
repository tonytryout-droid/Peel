import { describe, expect, it } from "vitest";
import { mapBrushRadiusToMaskRadius, mapDisplayPointToMaskPoint } from "@/hooks/brush-math";

describe("brush mapping", () => {
  const scale = {
    displayWidth: 1000,
    displayHeight: 500,
    maskWidth: 4000,
    maskHeight: 2000
  };

  it("maps display points into mask coordinates", () => {
    expect(mapDisplayPointToMaskPoint(0, 0, scale)).toEqual({ x: 0, y: 0 });
    expect(mapDisplayPointToMaskPoint(500, 250, scale)).toEqual({ x: 2000, y: 1000 });
  });

  it("scales brush radius for high-resolution mask", () => {
    expect(mapBrushRadiusToMaskRadius(10, scale)).toBe(40);
  });
});
