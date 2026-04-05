import { describe, expect, it } from "vitest";
import { decideIdempotencyAction, shouldReuseExistingJob } from "@/lib/idempotency-policy";

describe("shouldReuseExistingJob", () => {
  it("reuses pending and processing jobs", () => {
    expect(shouldReuseExistingJob("pending")).toBe(true);
    expect(shouldReuseExistingJob("processing")).toBe(true);
  });

  it("does not reuse terminal jobs", () => {
    expect(shouldReuseExistingJob("done")).toBe(false);
    expect(shouldReuseExistingJob("failed")).toBe(false);
  });
});

describe("decideIdempotencyAction", () => {
  it("creates a new job when request hash has no mapping", () => {
    expect(decideIdempotencyAction(null)).toBe("create");
  });

  it("reuses duplicate jobs when existing status is non-terminal", () => {
    expect(decideIdempotencyAction("pending")).toBe("reuse");
    expect(decideIdempotencyAction("processing")).toBe("reuse");
  });

  it("creates a new job when previous attempt is terminal failed", () => {
    expect(decideIdempotencyAction("failed")).toBe("create");
  });
});
