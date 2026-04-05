"use client";

import { useEffect, useRef, useState } from "react";
import { JobStatus } from "@/types";
import { getPollDelay } from "@/hooks/polling";

interface PollState {
  status: JobStatus | null;
  resultUrl: string | null;
  error: string | null;
  updatedAt: number | null;
}

export function useJobPoller(jobId: string | null, baseIntervalMs = 2500): PollState {
  const [state, setState] = useState<PollState>({
    status: null,
    resultUrl: null,
    error: null,
    updatedAt: null
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!jobId) {
      setState({ status: null, resultUrl: null, error: null, updatedAt: null });
      return;
    }

    let isCancelled = false;
    attemptsRef.current = 0;

    const schedule = (delay: number) => {
      timerRef.current = setTimeout(poll, delay);
    };

    const poll = async () => {
      if (isCancelled) {
        return;
      }
      attemptsRef.current += 1;

      try {
        const response = await fetch(`/api/status/${jobId}`, { cache: "no-store" });
        if (!response.ok) {
          schedule(getPollDelay(attemptsRef.current, baseIntervalMs));
          return;
        }
        const data = await response.json();
        const nextState: PollState = {
          status: data.status ?? null,
          resultUrl: data.resultUrl ?? null,
          error: data.error ?? null,
          updatedAt: data.updatedAt ?? null
        };
        setState(nextState);

        if (nextState.status === "done" || nextState.status === "failed") {
          return;
        }
      } catch {
        // Keep polling on transient network failures.
      }

      schedule(getPollDelay(attemptsRef.current, baseIntervalMs));
    };

    schedule(1000);

    return () => {
      isCancelled = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [baseIntervalMs, jobId]);

  return state;
}
