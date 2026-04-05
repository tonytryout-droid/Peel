import { app } from "@/lib/firebase";

let analyticsStarted = false;

export async function initFirebaseAnalytics(): Promise<void> {
  if (analyticsStarted || typeof window === "undefined") {
    return;
  }

  const measurementId = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;
  if (!measurementId) {
    return;
  }

  const [{ getAnalytics, isSupported }] = await Promise.all([
    import("firebase/analytics")
  ]);

  const supported = await isSupported();
  if (!supported) {
    return;
  }

  getAnalytics(app);
  analyticsStarted = true;
}
