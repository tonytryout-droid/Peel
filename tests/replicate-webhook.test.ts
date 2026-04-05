import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import { verifyReplicateWebhookSignature } from "@/lib/replicate-webhook";

function buildSignature(secret: string, webhookId: string, webhookTimestamp: string, body: string): string {
  const key = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  const signed = `${webhookId}.${webhookTimestamp}.${body}`;
  const digest = createHmac("sha256", key).update(signed).digest("base64");
  return `v1,${digest}`;
}

describe("verifyReplicateWebhookSignature", () => {
  const secret = "whsec_supersecretkey";
  const webhookId = "msg_123";
  const webhookTimestamp = "1700000000";
  const payload = JSON.stringify({ status: "succeeded" });

  it("accepts valid signatures", () => {
    const signatureHeader = buildSignature(secret, webhookId, webhookTimestamp, payload);

    const result = verifyReplicateWebhookSignature({
      rawBody: payload,
      webhookSecret: secret,
      webhookId,
      webhookTimestamp,
      signatureHeader,
      nowSeconds: 1700000001
    });

    expect(result.ok).toBe(true);
  });

  it("rejects invalid signatures", () => {
    const result = verifyReplicateWebhookSignature({
      rawBody: payload,
      webhookSecret: secret,
      webhookId,
      webhookTimestamp,
      signatureHeader: "v1,invalid",
      nowSeconds: 1700000001
    });

    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe("invalid_signature");
  });

  it("rejects stale timestamps", () => {
    const signatureHeader = buildSignature(secret, webhookId, webhookTimestamp, payload);

    const result = verifyReplicateWebhookSignature({
      rawBody: payload,
      webhookSecret: secret,
      webhookId,
      webhookTimestamp,
      signatureHeader,
      nowSeconds: 1700000800
    });

    expect(result.ok).toBe(false);
    expect(result.errorCode).toBe("timestamp_too_old");
  });
});
