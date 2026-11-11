"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getFirebaseAnalytics } from "@/lib/firebase/config";
import { logEvent } from "firebase/analytics";

export default function FirebaseAnalyticsReporter() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Never run analytics on admin dashboard routes or in local development
    if (
      pathname.startsWith("/admin") ||
      process.env.NODE_ENV === "development" ||
      typeof window === "undefined"
    ) {
      return;
    }

    // 2. Intercept unhandled network rejections from third-party tracking scripts (e.g. Brave Shields / uBlock)
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reasonStr = String(event?.reason?.message || event?.reason?.stack || event?.reason || "");
      if (
        reasonStr.includes("Failed to fetch") ||
        reasonStr.includes("@firebase") ||
        reasonStr.includes("firebaseinstallations") ||
        reasonStr.includes("installations")
      ) {
        // Prevent Turbopack development modal overlay from popping up on adblocked tracker calls
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleRejection);

    let isMounted = true;

    getFirebaseAnalytics()
      .then((analytics) => {
        if (analytics && isMounted) {
          try {
            logEvent(analytics, "page_view", {
              page_path: pathname,
              page_location: window.location.href,
              page_title: document.title,
            });
          } catch {
            // Non-blocking
          }
        }
      })
      .catch(() => {
        // Silently ignore tracking failures
      });

    return () => {
      isMounted = false;
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, [pathname]);

  return null;
}
