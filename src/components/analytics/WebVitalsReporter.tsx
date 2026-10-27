"use client";

import { useReportWebVitals } from "next/web-vitals";

export default function WebVitalsReporter() {
  useReportWebVitals((metric: any) => {
    // Send metric to our real-user monitoring endpoint
    try {
      const body = JSON.stringify({
        id: metric.id,
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        route: typeof window !== "undefined" ? window.location.pathname : "/",
        device: typeof window !== "undefined" && window.innerWidth < 768 ? "mobile" : "desktop",
        timestamp: Date.now(),
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics/vitals", body);
      } else {
        fetch("/api/analytics/vitals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Non-blocking telemetry
    }
  });

  return null;
}
