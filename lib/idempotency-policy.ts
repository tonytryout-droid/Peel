import { JobStatus } from "@/types";

export function shouldReuseExistingJob(status: JobStatus): boolean {
  return status === "pending" || status === "processing";
}

export function decideIdempotencyAction(existingStatus: JobStatus | null): "reuse" | "create" {
  if (!existingStatus) {
    return "create";
  }
  return shouldReuseExistingJob(existingStatus) ? "reuse" : "create";
}
