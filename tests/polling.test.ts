import { describe, expect, it } from "vitest";
import { getPollDelay } from "@/hooks/polling";

describe("getPollDelay", () => {
  it("starts fast for early attempts", () => {
    expect(getPollDelay(1, 2500)).toBe(1250);
    expect(getPollDelay(3, 2500)).toBe(1250);
  });

  it("uses base interval for mid attempts", () => {
    expect(getPollDelay(4, 2500)).toBe(2500);
    expect(getPollDelay(10, 2500)).toBe(2500);
  });

  it("backs off after repeated polls", () => {
    expect(getPollDelay(11, 2500)).toBe(5000);
    expect(getPollDelay(100, 7000)).toBe(10000);
  });
});
