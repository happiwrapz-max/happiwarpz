"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getFirebaseAnalytics } from "@/lib/firebase/config";
import { logEvent } from "firebase/analytics";

export default function FirebaseAnalyticsReporter() {
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    getFirebaseAnalytics().then((analytics) => {
      if (analytics && isMounted) {
        logEvent(analytics, "page_view", {
          page_path: pathname,
          page_location: window.location.href,
          page_title: document.title,
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  return null;
}
