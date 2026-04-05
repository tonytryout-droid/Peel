import { NextRequest, NextResponse } from "next/server";
import { createOrReuseJob, logJobEvent, setJobStatus } from "@/lib/jobs";
import { deriveRequestHash } from "@/lib/request-hash";
import { getLamaModelVersion, getReplicateClient } from "@/lib/replicate";
import { InpaintRequestBody } from "@/types";

function getWebhookBaseUrl(req: NextRequest): string {
  return process.env.WEBHOOK_BASE_URL ?? req.nextUrl.origin;
}

function parseBody(payload: unknown): InpaintRequestBody {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid request body.");
  }

  const body = payload as Partial<InpaintRequestBody>;
  if (!body.imageUrl || !body.maskUrl) {
    throw new Error("imageUrl and maskUrl are required.");
  }

  return {
    imageUrl: body.imageUrl,
    maskUrl: body.maskUrl,
    imageSha256: body.imageSha256,
    maskSha256: body.maskSha256
  };
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  let createdJobId: string | null = null;
  let createdRequestHash: string | null = null;

  try {
    const parsed = parseBody(await req.json());
    const requestHash = deriveRequestHash(parsed);
    const job = await createOrReuseJob({
      imageUrl: parsed.imageUrl,
      maskUrl: parsed.maskUrl,
      requestHash
    });
    createdJobId = job.jobId;
    createdRequestHash = requestHash;

    await logJobEvent({
      jobId: job.jobId,
      phase: "inpaint_request_received",
      requestHash,
      status: job.status
    });

    if (job.reused) {
      return NextResponse.json({
        jobId: job.jobId,
        status: job.status,
        reused: true
      });
    }

    const prediction = await getReplicateClient().predictions.create({
      version: getLamaModelVersion(),
      input: {
        image: parsed.imageUrl,
        mask: parsed.maskUrl
      },
      webhook: `${getWebhookBaseUrl(req)}/api/webhook/replicate/${job.jobId}`,
      webhook_events_filter: ["completed"]
    });

    await setJobStatus({
      jobId: job.jobId,
      status: "processing",
      replicateId: prediction.id,
      requestHash
    });

    await logJobEvent({
      jobId: job.jobId,
      phase: "replicate_prediction_created",
      requestHash,
      status: "processing",
      latencyMs: Date.now() - startedAt
    });

    return NextResponse.json({
      jobId: job.jobId,
      status: "processing",
      reused: false
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Inference start failed.";
    if (createdJobId) {
      await setJobStatus({
        jobId: createdJobId,
        status: "failed",
        error: message,
        requestHash: createdRequestHash ?? undefined
      });
      await logJobEvent({
        jobId: createdJobId,
        phase: "inpaint_failed",
        requestHash: createdRequestHash ?? undefined,
        status: "failed",
        errorCode: message,
        latencyMs: Date.now() - startedAt
      });
    }
    const status = /required|invalid/i.test(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
