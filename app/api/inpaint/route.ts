import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { uploadResultPng } from "@/lib/upload-server";

const REQUEST_TIMEOUT_MS = 15_000;

interface InpaintBody {
  imageDataUrl: string;
  maskDataUrl: string;
}

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function parseBody(payload: unknown): InpaintBody {
  if (!payload || typeof payload !== "object") {
    throw new HttpError(400, "Invalid request body.");
  }

  const body = payload as Partial<InpaintBody>;
  if (!body.imageDataUrl || !body.maskDataUrl) {
    throw new HttpError(400, "imageDataUrl and maskDataUrl are required.");
  }

  return {
    imageDataUrl: body.imageDataUrl,
    maskDataUrl: body.maskDataUrl
  };
}

function dataUrlToBlob(dataUrl: string): Blob {
  const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!match) {
    throw new HttpError(400, "Invalid data URL format.");
  }

  const mime = match[1];
  const base64 = match[2];
  const bytes = Buffer.from(base64, "base64");
  return new Blob([bytes], { type: mime });
}

function buildLamaForm(imageBlob: Blob, maskBlob: Blob): FormData {
  const form = new FormData();
  form.append("image", imageBlob, "image.png");
  form.append("mask", maskBlob, "mask.png");
  return form;
}

async function callLama(lamaUrl: string, imageBlob: Blob, maskBlob: Blob): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(`${lamaUrl}/inpaint`, {
      method: "POST",
      body: buildLamaForm(imageBlob, maskBlob),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

async function runLamaWithRetry(lamaUrl: string, imageBlob: Blob, maskBlob: Blob): Promise<Response> {
  const first = await callLama(lamaUrl, imageBlob, maskBlob);
  if (first.status !== 500) {
    return first;
  }
  return callLama(lamaUrl, imageBlob, maskBlob);
}

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const lamaUrl = process.env.LAMA_URL;
    if (!lamaUrl) {
      throw new HttpError(500, "Missing LAMA_URL.");
    }

    const { imageDataUrl, maskDataUrl } = parseBody(await req.json());
    const imageBlob = dataUrlToBlob(imageDataUrl);
    const maskBlob = dataUrlToBlob(maskDataUrl);

    const lamaRes = await runLamaWithRetry(lamaUrl.replace(/\/$/, ""), imageBlob, maskBlob);
    if (!lamaRes.ok) {
      const rawDetail = await lamaRes.text().catch(() => "");
      // Log the full detail server-side for debugging
      console.error(`Lama inference failed (status ${lamaRes.status}):`, rawDetail);
      // Sanitize the detail for client exposure
      const sanitized = rawDetail
        .replace(/\n/g, " ")
        .slice(0, 100)
        .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, "[email]")
        .replace(/(https?:\/\/[^\s]+)/g, "[url]")
        .replace(/(Bearer|Token|API[_-]?Key)[^\s]*/gi, "[redacted]");
      throw new HttpError(502, "Lama inference failed.");
    }

    const buffer = Buffer.from(await lamaRes.arrayBuffer());
    const resultUrl = await uploadResultPng(buffer, randomUUID());

    return NextResponse.json({ resultUrl });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Lama inference timed out." }, { status: 504 });
    }

    const message = error instanceof Error ? error.message : "Processing failed.";
    const status = error instanceof HttpError ? error.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
