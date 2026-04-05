import { createHmac, timingSafeEqual } from "crypto";

const DEFAULT_TOLERANCE_SECONDS = 5 * 60;

export interface VerifyWebhookResult {
  ok: boolean;
  errorCode?: "missing_headers" | "invalid_timestamp" | "timestamp_too_old" | "invalid_signature";
}

function parseSignatures(signatureHeader: string): string[] {
  return signatureHeader
    .trim()
    .split(/\s+/)
    .flatMap((part) => {
      if (part.startsWith("v1,")) {
        return [part.slice(3)];
      }
      const maybeKv = part.split(",");
      return maybeKv
        .map((item) => {
          const trimmed = item.trim();
          if (trimmed.startsWith("v1=")) {
            return trimmed.slice(3);
          }
          return "";
        })
        .filter(Boolean);
    })
    .filter(Boolean);
}

function base64Equal(left: string, right: string): boolean {
  try {
    const a = Buffer.from(left, "base64");
    const b = Buffer.from(right, "base64");
    if (a.length !== b.length) {
      return false;
    }
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function verifyReplicateWebhookSignature(input: {
  rawBody: string;
  webhookSecret: string;
  webhookId: string | null;
  webhookTimestamp: string | null;
  signatureHeader: string | null;
  toleranceSeconds?: number;
  nowSeconds?: number;
}): VerifyWebhookResult {
  const {
    rawBody,
    webhookSecret,
    webhookId,
    webhookTimestamp,
    signatureHeader,
    toleranceSeconds = DEFAULT_TOLERANCE_SECONDS,
    nowSeconds = Math.floor(Date.now() / 1000)
  } = input;

  if (!webhookId || !webhookTimestamp || !signatureHeader) {
    return { ok: false, errorCode: "missing_headers" };
  }

  const ts = Number(webhookTimestamp);
  if (!Number.isFinite(ts)) {
    return { ok: false, errorCode: "invalid_timestamp" };
  }
  if (Math.abs(nowSeconds - ts) > toleranceSeconds) {
    return { ok: false, errorCode: "timestamp_too_old" };
  }

  const secretKey = webhookSecret.startsWith("whsec_")
    ? webhookSecret.slice("whsec_".length)
    : webhookSecret;
  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const expected = createHmac("sha256", secretKey).update(signedContent).digest("base64");
  const candidates = parseSignatures(signatureHeader);

  const valid = candidates.some((candidate) => base64Equal(candidate, expected));
  if (!valid) {
    return { ok: false, errorCode: "invalid_signature" };
  }

  return { ok: true };
}
