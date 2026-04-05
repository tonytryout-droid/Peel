// @vitest-environment node

import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { createOrReuseJob, logJobEvent, setJobStatus, replicateCreate } = vi.hoisted(() => ({
  createOrReuseJob: vi.fn(),
  logJobEvent: vi.fn(),
  setJobStatus: vi.fn(),
  replicateCreate: vi.fn()
}));

vi.mock("@/lib/jobs", () => ({
  createOrReuseJob,
  logJobEvent,
  setJobStatus
}));

vi.mock("@/lib/replicate", () => ({
  getLamaModelVersion: () => "abc123",
  getReplicateClient: () => ({
    predictions: {
      create: replicateCreate
    }
  })
}));

import { POST } from "@/app/api/inpaint/route";

describe("POST /api/inpaint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns reused job without calling Replicate", async () => {
    createOrReuseJob.mockResolvedValue({
      jobId: "job_1",
      status: "processing",
      reused: true,
      requestHash: "hash_1"
    });

    const req = new NextRequest("http://localhost/api/inpaint", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: "https://img",
        maskUrl: "https://mask"
      })
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ jobId: "job_1", status: "processing", reused: true });
    expect(replicateCreate).not.toHaveBeenCalled();
  });

  it("starts new prediction and returns processing state", async () => {
    createOrReuseJob.mockResolvedValue({
      jobId: "job_2",
      status: "pending",
      reused: false,
      requestHash: "hash_2"
    });
    replicateCreate.mockResolvedValue({ id: "rep_1" });

    const req = new NextRequest("http://localhost/api/inpaint", {
      method: "POST",
      body: JSON.stringify({
        imageUrl: "https://img",
        maskUrl: "https://mask",
        imageSha256: "a",
        maskSha256: "b"
      })
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ jobId: "job_2", status: "processing", reused: false });
    expect(replicateCreate).toHaveBeenCalledTimes(1);
    expect(setJobStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        jobId: "job_2",
        status: "processing",
        replicateId: "rep_1",
        requestHash: expect.any(String)
      })
    );
  });
});
