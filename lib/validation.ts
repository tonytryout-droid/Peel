const MAX_IMAGE_PIXELS = 4_000_000;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE_MB = 10;

export function isAllowedMimeType(type: string): boolean {
  return ALLOWED_TYPES.has(type);
}

export function isWithinFileSizeLimit(fileSizeBytes: number): boolean {
  return fileSizeBytes <= MAX_FILE_SIZE_MB * 1024 * 1024;
}

export function isWithinPixelLimit(width: number, height: number): boolean {
  return width * height <= MAX_IMAGE_PIXELS;
}

export function getMaxImagePixels(): number {
  return MAX_IMAGE_PIXELS;
}
