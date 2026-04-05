import { App, cert, getApps, initializeApp } from "firebase-admin/app";
import { Firestore, getFirestore } from "firebase-admin/firestore";

let cachedApp: App | null = null;
let cachedDb: Firestore | null = null;

function getAdminApp(): App {
  if (cachedApp) {
    return cachedApp;
  }

  if (getApps().length > 0) {
    cachedApp = getApps()[0]!;
    return cachedApp;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase admin environment variables.");
  }

  cachedApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey
    })
  });
  return cachedApp;
}

export function getAdminDb(): Firestore {
  if (cachedDb) {
    return cachedDb;
  }
  cachedDb = getFirestore(getAdminApp());
  return cachedDb;
}
