import { describe, expect, it } from "vitest";
import { phaseToView } from "@/hooks/editor-view";

describe("phaseToView", () => {
  it("moves into processing for active phase", () => {
    expect(phaseToView("processing", "edit")).toBe("processing");
  });

  it("moves into result for done phase", () => {
    expect(phaseToView("done", "processing")).toBe("result");
  });

  it("returns to edit when processing ends with error", () => {
    expect(phaseToView("error", "processing")).toBe("edit");
  });
});
