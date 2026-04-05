import { randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { decideIdempotencyAction } from "@/lib/idempotency-policy";
import { JobDoc, JobStatus } from "@/types";

const JOBS_COLLECTION = "jobs";
const IDEMPOTENCY_COLLECTION = "job_idempotency";
const JOB_TTL_MS = 24 * 60 * 60 * 1000;

export interface CreateOrReuseJobInput {
  imageUrl: string;
  maskUrl: string;
  requestHash: string;
}

export interface CreateOrReuseJobResult {
  jobId: string;
  status: JobStatus;
  reused: boolean;
  requestHash: string;
}

function jobsDoc(jobId: string) {
  return getAdminDb().collection(JOBS_COLLECTION).doc(jobId);
}

function idempotencyDoc(requestHash: string) {
  return getAdminDb().collection(IDEMPOTENCY_COLLECTION).doc(requestHash);
}

export async function createOrReuseJob(input: CreateOrReuseJobInput): Promise<CreateOrReuseJobResult> {
  const createdAt = Date.now();
  return getAdminDb().runTransaction(async (tx) => {
    const idempotencyRef = idempotencyDoc(input.requestHash);
    const idempotencySnap = await tx.get(idempotencyRef);

    if (idempotencySnap.exists) {
      const existing = idempotencySnap.data() as { jobId: string; status: JobStatus };
      const jobRef = jobsDoc(existing.jobId);
      const jobSnap = await tx.get(jobRef);
      const job = jobSnap.exists ? (jobSnap.data() as JobDoc) : null;

      if (job && decideIdempotencyAction(job.status) === "reuse") {
        tx.update(idempotencyRef, {
          lastSeenAt: createdAt,
          status: job.status
        });
        return {
          jobId: existing.jobId,
          status: job.status,
          reused: true,
          requestHash: input.requestHash
        };
      }
    }

    const jobId = randomUUID();
    const jobRef = jobsDoc(jobId);
    const job: JobDoc = {
      status: "pending",
      imageUrl: input.imageUrl,
      maskUrl: input.maskUrl,
      resultUrl: null,
      error: null,
      replicateId: null,
      requestHash: input.requestHash,
      createdAt,
      updatedAt: createdAt,
      expiresAt: createdAt + JOB_TTL_MS
    };

    tx.set(jobRef, job);
    tx.set(idempotencyRef, {
      jobId,
      status: "pending",
      lastSeenAt: createdAt
    });

    return { jobId, status: "pending", reused: false, requestHash: input.requestHash };
  });
}

export async function setJobStatus(input: {
  jobId: string;
  status: JobStatus;
  error?: string | null;
  resultUrl?: string | null;
  replicateId?: string | null;
  requestHash?: string;
}): Promise<void> {
  const updatedAt = Date.now();
  const jobRef = jobsDoc(input.jobId);
  const patch: Partial<JobDoc> & { updatedAt: number } = { updatedAt, status: input.status };
  if (input.error !== undefined) {
    patch.error = input.error;
  }
  if (input.resultUrl !== undefined) {
    patch.resultUrl = input.resultUrl;
  }
  if (input.replicateId !== undefined) {
    patch.replicateId = input.replicateId;
  }

  await jobRef.set(patch, { merge: true });

  if (input.requestHash) {
    await idempotencyDoc(input.requestHash).set(
      { status: input.status, lastSeenAt: updatedAt },
      { merge: true }
    );
  }
}

export async function getJob(jobId: string): Promise<(JobDoc & { jobId: string }) | null> {
  const snap = await jobsDoc(jobId).get();
  if (!snap.exists) {
    return null;
  }
  return {
    jobId,
    ...(snap.data() as JobDoc)
  };
}

export async function getJobStatus(jobId: string): Promise<{
  jobId: string;
  status: JobStatus;
  resultUrl: string | null;
  error: string | null;
  updatedAt: number;
} | null> {
  const job = await getJob(jobId);
  if (!job) {
    return null;
  }

  return {
    jobId,
    status: job.status,
    resultUrl: job.resultUrl,
    error: job.error,
    updatedAt: job.updatedAt
  };
}

export async function logJobEvent(input: {
  jobId: string;
  phase: string;
  status?: JobStatus;
  requestHash?: string;
  latencyMs?: number;
  errorCode?: string;
}): Promise<void> {
  const payload = {
    ...input,
    createdAt: Date.now()
  };

  const db = getAdminDb();
  await db
    .collection(JOBS_COLLECTION)
    .doc(input.jobId)
    .collection("events")
    .add({
      ...payload,
      serverTimestamp: FieldValue.serverTimestamp()
    });
}
