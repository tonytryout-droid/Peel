import { createHash } from "crypto";

interface RequestHashInput {
  imageUrl: string;
  maskUrl: string;
  imageSha256?: string;
  maskSha256?: string;
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function deriveRequestHash(input: RequestHashInput): string {
  if (input.imageSha256 && input.maskSha256) {
    return sha256(`${input.imageSha256}:${input.maskSha256}`);
  }
  return sha256(`${input.imageUrl}:${input.maskUrl}`);
}
