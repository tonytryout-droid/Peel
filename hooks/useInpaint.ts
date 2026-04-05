"use client";

import { useEffect, useState } from "react";
import { dataUrlToBlob, sha256Blob, uploadBlob } from "@/lib/upload";
import { useJobPoller } from "@/hooks/useJobPoller";

export type InpaintPhase = "idle" | "uploading" | "inferring" | "done" | "error";

interface InpaintResponse {
  jobId: string;
  status: string;
  reused: boolean;
}

export function useInpaint() {
  const [phase, setPhase] = useState<InpaintPhase>("idle");
  const [jobId, setJobId] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const poll = useJobPoller(phase === "inferring" ? jobId : null);

  useEffect(() => {
    if (phase !== "inferring") {
      return;
    }
    if (poll.status === "done") {
      const latency = startedAt ? Date.now() - startedAt : null;
      setElapsedMs(latency);
      console.log({
        phase: "client_completed",
        jobId,
        status: "done",
        latencyMs: latency
      });
      setPhase("done");
      return;
    }
    if (poll.status === "failed") {
      const latency = startedAt ? Date.now() - startedAt : null;
      setElapsedMs(latency);
      console.log({
        phase: "client_failed",
        jobId,
        status: "failed",
        latencyMs: latency,
        errorCode: poll.error ?? "inference_failed"
      });
      setError(poll.error ?? "Model failed.");
      setPhase("error");
    }
  }, [jobId, phase, poll.error, poll.status, startedAt]);

  const run = async (imageDataUrl: string, maskDataUrl: string) => {
    setPhase("uploading");
    setError(null);
    setStartedAt(Date.now());
    setElapsedMs(null);

    const localJobId = crypto.randomUUID();

    try {
      const imageBlob = dataUrlToBlob(imageDataUrl);
      const maskBlob = dataUrlToBlob(maskDataUrl);
      const [imageUrl, maskUrl, imageSha256, maskSha256] = await Promise.all([
        uploadBlob(imageBlob, "images", localJobId),
        uploadBlob(maskBlob, "masks", localJobId),
        sha256Blob(imageBlob),
        sha256Blob(maskBlob)
      ]);

      setOriginalUrl(imageUrl);

      const response = await fetch("/api/inpaint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          imageUrl,
          maskUrl,
          imageSha256,
          maskSha256
        })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Unable to start inpainting.");
      }

      const payload = (await response.json()) as InpaintResponse;
      setJobId(payload.jobId);
      console.log({
        phase: "client_job_started",
        jobId: payload.jobId,
        status: payload.status,
        reused: payload.reused
      });
      setPhase("inferring");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unexpected error.";
      setError(message);
      setPhase("error");
    }
  };

  const reset = () => {
    setPhase("idle");
    setJobId(null);
    setOriginalUrl(null);
    setError(null);
    setStartedAt(null);
    setElapsedMs(null);
  };

  return {
    run,
    reset,
    phase,
    jobId,
    resultUrl: poll.resultUrl,
    originalUrl,
    error,
    elapsedMs
  };
}
