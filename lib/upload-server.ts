import { randomUUID } from "crypto";
import { getAdminStorageBucket } from "@/lib/firebase-admin";

// Validate jobId to prevent path traversal attacks
function validateJobId(jobId: string): void {
  const safePattern = /^[A-Za-z0-9_-]+$/;
  if (!jobId || !safePattern.test(jobId)) {
    throw new Error("Invalid jobId: must contain only alphanumeric characters, hyphens, and underscores.");
  }
}

export async function uploadResultPng(buffer: Buffer, jobId: string): Promise<string> {
  validateJobId(jobId);
  const bucket = getAdminStorageBucket();
  const path = `jobs/${jobId}/results.png`;
  const file = bucket.file(path);
  const token = randomUUID();

  await file.save(buffer, {
    contentType: "image/png",
    resumable: false,
    metadata: {
      metadata: {
        firebaseStorageDownloadTokens: token
      }
    }
  });

  const encodedPath = encodeURIComponent(path);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;
}
