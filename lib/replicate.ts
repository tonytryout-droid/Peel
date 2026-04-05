import Replicate from "replicate";

let cachedReplicate: Replicate | null = null;

export function getReplicateClient(): Replicate {
  if (cachedReplicate) {
    return cachedReplicate;
  }
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error("Missing REPLICATE_API_TOKEN.");
  }
  cachedReplicate = new Replicate({ auth: token });
  return cachedReplicate;
}

export function getLamaModelVersion(): string {
  const version = process.env.REPLICATE_MODEL_VERSION ?? "";
  if (!version) {
    throw new Error("Missing REPLICATE_MODEL_VERSION.");
  }
  return version;
}
