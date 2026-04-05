export type JobStatus = "pending" | "processing" | "done" | "failed";

export interface JobDoc {
  status: JobStatus;
  imageUrl: string;
  maskUrl: string;
  resultUrl: string | null;
  error: string | null;
  replicateId: string | null;
  requestHash: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
}

export interface IdempotencyDoc {
  jobId: string;
  status: JobStatus;
  lastSeenAt: number;
}

export interface InpaintRequestBody {
  imageUrl: string;
  maskUrl: string;
  imageSha256?: string;
  maskSha256?: string;
}
