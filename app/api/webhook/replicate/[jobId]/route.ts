import { NextRequest, NextResponse } from "next/server";
import { getJob, logJobEvent, setJobStatus } from "@/lib/jobs";
import { verifyReplicateWebhookSignature } from "@/lib/replicate-webhook";

interface ReplicateWebhookBody {
  status?: string;
  output?: string | string[] | null;
  error?: string;
}

function getFirstOutputUrl(output: ReplicateWebhookBody["output"]): string | null {
  if (!output) {
    return null;
  }
  if (Array.isArray(output)) {
    return output[0] ?? null;
  }
  return output;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const jobId = params.jobId;
  const webhookSecret = process.env.REPLICATE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing REPLICATE_WEBHOOK_SECRET." }, { status: 500 });
  }

  const rawBody = await req.text();
  const verification = verifyReplicateWebhookSignature({
    rawBody,
    webhookSecret,
    webhookId: req.headers.get("webhook-id"),
    webhookTimestamp: req.headers.get("webhook-timestamp"),
    signatureHeader: req.headers.get("webhook-signature") ?? req.headers.get("replicate-signature")
  });

  if (!verification.ok) {
    await logJobEvent({
      jobId,
      phase: "webhook_rejected",
      errorCode: verification.errorCode
    });
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let body: ReplicateWebhookBody;
  try {
    body = JSON.parse(rawBody) as ReplicateWebhookBody;
  } catch {
    await logJobEvent({
      jobId,
      phase: "webhook_invalid_json",
      errorCode: "invalid_json"
    });
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }
  const existingJob = await getJob(jobId);

  if (!existingJob) {
    return NextResponse.json({ ok: true });
  }

  if (body.status === "succeeded") {
    const resultUrl = getFirstOutputUrl(body.output);
    await setJobStatus({
      jobId,
      status: "done",
      resultUrl,
      error: null,
      requestHash: existingJob.requestHash
    });
    await logJobEvent({
      jobId,
      phase: "webhook_succeeded",
      requestHash: existingJob.requestHash,
      status: "done"
    });
  } else if (body.status === "failed") {
    await setJobStatus({
      jobId,
      status: "failed",
      error: body.error ?? "Model failed.",
      requestHash: existingJob.requestHash
    });
    await logJobEvent({
      jobId,
      phase: "webhook_failed",
      requestHash: existingJob.requestHash,
      status: "failed",
      errorCode: body.error ?? "replicate_failed"
    });
  }

  return NextResponse.json({ ok: true });
}
