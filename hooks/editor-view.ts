import { InpaintPhase } from "@/hooks/useInpaint";

export type EditorView = "upload" | "edit" | "processing" | "result";

export function phaseToView(phase: InpaintPhase, previous: EditorView): EditorView {
  if (phase === "processing") {
    return "processing";
  }
  if (phase === "done") {
    return "result";
  }
  if (phase === "error" && previous === "processing") {
    return "edit";
  }
  return previous;
}
