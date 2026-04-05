"use client";

import { useEffect } from "react";
import { initFirebaseAnalytics } from "@/lib/firebase-analytics";

export function FirebaseAnalytics() {
  useEffect(() => {
    void initFirebaseAnalytics();
  }, []);

  return null;
}
