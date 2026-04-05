export function getPollDelay(attempt: number, baseIntervalMs: number): number {
  if (attempt <= 3) {
    return Math.max(1000, Math.floor(baseIntervalMs / 2));
  }
  if (attempt <= 10) {
    return baseIntervalMs;
  }
  return Math.min(baseIntervalMs * 2, 10000);
}
