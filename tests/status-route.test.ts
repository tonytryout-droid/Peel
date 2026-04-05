// @vitest-environment node

import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { getJobStatus } = vi.hoisted(() => ({
  getJobStatus: vi.fn()
}));

vi.mock("@/lib/jobs", () => ({
  getJobStatus
}));

import { GET } from "@/app/api/status/[jobId]/route";

describe("GET /api/status/:jobId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns status payload when job exists", async () => {
    getJobStatus.mockResolvedValue({
      jobId: "job_1",
      status: "done",
      resultUrl: "https://result",
      error: null,
      updatedAt: 100
    });

    const req = new NextRequest("http://localhost/api/status/job_1");
    const res = await GET(req, { params: { jobId: "job_1" } });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({
      jobId: "job_1",
      status: "done",
      resultUrl: "https://result",
      error: null,
      updatedAt: 100
    });
  });

  it("returns 404 when job does not exist", async () => {
    getJobStatus.mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/status/job_missing");
    const res = await GET(req, { params: { jobId: "job_missing" } });

    expect(res.status).toBe(404);
  });
});
