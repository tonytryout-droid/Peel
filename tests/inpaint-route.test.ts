// @vitest-environment node

import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";

const { uploadResultPng } = vi.hoisted(() => ({
  uploadResultPng: vi.fn()
}));

vi.mock("@/lib/upload-server", () => ({
  uploadResultPng
}));

import { POST } from "@/app/api/inpaint/route";

const IMAGE_DATA_URL = "data:image/png;base64,AA==";

describe("POST /api/inpaint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.LAMA_URL = "http://lama:8080";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns resultUrl for a successful Lama response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(Uint8Array.from([1, 2, 3]), {
        status: 200,
        headers: { "content-type": "image/png" }
      })
    );
    vi.stubGlobal("fetch", fetchMock);
    uploadResultPng.mockResolvedValue("https://storage/result.png");

    const req = new NextRequest("http://localhost/api/inpaint", {
      method: "POST",
      body: JSON.stringify({
        imageDataUrl: IMAGE_DATA_URL,
        maskDataUrl: IMAGE_DATA_URL
      })
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ resultUrl: "https://storage/result.png" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(uploadResultPng).toHaveBeenCalledTimes(1);
  });

  it("retries once when Lama returns a 500", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("error", { status: 500 }))
      .mockResolvedValueOnce(new Response(Uint8Array.from([9, 9, 9]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    uploadResultPng.mockResolvedValue("https://storage/retry.png");

    const req = new NextRequest("http://localhost/api/inpaint", {
      method: "POST",
      body: JSON.stringify({
        imageDataUrl: IMAGE_DATA_URL,
        maskDataUrl: IMAGE_DATA_URL
      })
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ resultUrl: "https://storage/retry.png" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns 400 for invalid request payload", async () => {
    const req = new NextRequest("http://localhost/api/inpaint", {
      method: "POST",
      body: JSON.stringify({})
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 504 when Lama request times out", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new DOMException("Timed out", "AbortError"));
    vi.stubGlobal("fetch", fetchMock);

    const req = new NextRequest("http://localhost/api/inpaint", {
      method: "POST",
      body: JSON.stringify({
        imageDataUrl: IMAGE_DATA_URL,
        maskDataUrl: IMAGE_DATA_URL
      })
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(504);
    expect(json).toEqual({ error: "Lama inference timed out." });
  });
});
