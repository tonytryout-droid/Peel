import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

export type UploadSlot = "images" | "masks";

export function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, encoded] = dataUrl.split(",");
  const mimeMatch = meta.match(/data:(.*?);base64/);
  if (!mimeMatch) {
    throw new Error("Invalid data URL format.");
  }
  const mime = mimeMatch[1];
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export async function sha256Blob(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((value) => value.toString(16).padStart(2, "0")).join("");
}

export async function uploadBlob(blob: Blob, slot: UploadSlot, jobId: string): Promise<string> {
  const ext = blob.type === "image/png" ? "png" : "jpg";
  const path = `jobs/${jobId}/${slot}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob, { contentType: blob.type });
  return getDownloadURL(storageRef);
}
