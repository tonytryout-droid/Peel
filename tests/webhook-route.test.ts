// @vitest-environment node

import { createHmac } from "crypto";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { getJob, logJobEvent, setJobStatus } = vi.hoisted(() => ({
  getJob: vi.fn(),
  logJobEvent: vi.fn(),
  setJobStatus: vi.fn()
}));

vi.mock("@/lib/jobs", () => ({
  getJob,
  logJobEvent,
  setJobStatus
}));

import { POST } from "@/app/api/webhook/replicate/[jobId]/route";

function sign(secret: string, webhookId: string, timestamp: string, body: string): string {
  const key = secret.replace(/^whsec_/, "");
  const signed = `${webhookId}.${timestamp}.${body}`;
  const digest = createHmac("sha256", key).update(signed).digest("base64");
  return `v1,${digest}`;
}

describe("POST /api/webhook/replicate/:jobId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.REPLICATE_WEBHOOK_SECRET = "whsec_testsecret";
  });

  it("rejects invalid signatures", async () => {
    const body = JSON.stringify({ status: "succeeded", output: "https://result" });
    const req = new NextRequest("http://localhost/api/webhook/replicate/job_1", {
      method: "POST",
      body,
      headers: {
        "webhook-id": "msg_1",
        "webhook-timestamp": String(Math.floor(Date.now() / 1000)),
        "webhook-signature": "v1,invalid"
      }
    });

    const res = await POST(req, { params: { jobId: "job_1" } });
    expect(res.status).toBe(401);
  });

  it("updates job on valid succeeded webhook", async () => {
    getJob.mockResolvedValue({
      jobId: "job_1",
      requestHash: "hash_1",
      status: "processing"
    });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify({ status: "succeeded", output: "https://result" });
    const req = new NextRequest("http://localhost/api/webhook/replicate/job_1", {
      method: "POST",
      body,
      headers: {
        "webhook-id": "msg_1",
        "webhook-timestamp": timestamp,
        "webhook-signature": sign(process.env.REPLICATE_WEBHOOK_SECRET!, "msg_1", timestamp, body)
      }
    });

    const res = await POST(req, { params: { jobId: "job_1" } });
    expect(res.status).toBe(200);
    expect(setJobStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        jobId: "job_1",
        status: "done",
        resultUrl: "https://result",
        requestHash: "hash_1"
      })
    );
  });
});
