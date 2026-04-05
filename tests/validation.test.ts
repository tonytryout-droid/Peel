import { describe, expect, it } from "vitest";
import { isAllowedMimeType, isWithinFileSizeLimit, isWithinPixelLimit } from "@/lib/validation";

describe("validation", () => {
  it("validates mime types", () => {
    expect(isAllowedMimeType("image/png")).toBe(true);
    expect(isAllowedMimeType("image/jpeg")).toBe(true);
    expect(isAllowedMimeType("application/pdf")).toBe(false);
  });

  it("enforces file size limit", () => {
    expect(isWithinFileSizeLimit(10 * 1024 * 1024)).toBe(true);
    expect(isWithinFileSizeLimit(10 * 1024 * 1024 + 1)).toBe(false);
  });

  it("enforces pixel limit", () => {
    expect(isWithinPixelLimit(2000, 2000)).toBe(true);
    expect(isWithinPixelLimit(4000, 2000)).toBe(false);
  });
});
