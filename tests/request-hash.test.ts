import { describe, expect, it } from "vitest";
import { deriveRequestHash } from "@/lib/request-hash";

describe("deriveRequestHash", () => {
  it("uses source hashes when both are provided", () => {
    const hash = deriveRequestHash({
      imageUrl: "https://example.com/image.png",
      maskUrl: "https://example.com/mask.png",
      imageSha256: "image-hash",
      maskSha256: "mask-hash"
    });

    const hash2 = deriveRequestHash({
      imageUrl: "https://other.com/image.png",
      maskUrl: "https://other.com/mask.png",
      imageSha256: "image-hash",
      maskSha256: "mask-hash"
    });

    expect(hash).toBe(hash2);
  });

  it("falls back to url-based hash when source hashes are missing", () => {
    const hash1 = deriveRequestHash({
      imageUrl: "https://example.com/image.png",
      maskUrl: "https://example.com/mask.png"
    });
    const hash2 = deriveRequestHash({
      imageUrl: "https://example.com/image.png",
      maskUrl: "https://example.com/mask.png"
    });
    const hash3 = deriveRequestHash({
      imageUrl: "https://example.com/image-2.png",
      maskUrl: "https://example.com/mask.png"
    });

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
  });
});
