import { NextRequest, NextResponse } from "next/server";

export interface WebVitalMetric {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  route: string;
  device: "mobile" | "desktop";
  timestamp: number;
}

// Global buffer in memory (last 200 metrics)
const vitalsBuffer: WebVitalMetric[] = [
  {
    id: "v-seed-1",
    name: "LCP",
    value: 1420,
    rating: "good",
    delta: 1420,
    route: "/",
    device: "mobile",
    timestamp: Date.now() - 300000,
  },
  {
    id: "v-seed-2",
    name: "INP",
    value: 48,
    rating: "good",
    delta: 48,
    route: "/catalog",
    device: "mobile",
    timestamp: Date.now() - 250000,
  },
  {
    id: "v-seed-3",
    name: "CLS",
    value: 0.012,
    rating: "good",
    delta: 0.012,
    route: "/",
    device: "mobile",
    timestamp: Date.now() - 200000,
  },
  {
    id: "v-seed-4",
    name: "TTFB",
    value: 120,
    rating: "good",
    delta: 120,
    route: "/",
    device: "desktop",
    timestamp: Date.now() - 150000,
  },
];

export async function POST(request: NextRequest) {
  try {
    let metric: WebVitalMetric;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      metric = await request.json();
    } else {
      const text = await request.text();
      metric = JSON.parse(text);
    }

    if (metric && metric.name) {
      vitalsBuffer.unshift(metric);
      if (vitalsBuffer.length > 200) {
        vitalsBuffer.pop();
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}

export async function GET() {
  // Compute aggregated 75th percentiles (p75) and summary
  const lcpValues = vitalsBuffer.filter((m) => m.name === "LCP").map((m) => m.value).sort((a, b) => a - b);
  const inpValues = vitalsBuffer.filter((m) => m.name === "INP").map((m) => m.value).sort((a, b) => a - b);
  const clsValues = vitalsBuffer.filter((m) => m.name === "CLS").map((m) => m.value).sort((a, b) => a - b);
  const ttfbValues = vitalsBuffer.filter((m) => m.name === "TTFB").map((m) => m.value).sort((a, b) => a - b);

  const getP75 = (arr: number[]) => {
    if (!arr.length) return 0;
    const idx = Math.floor(arr.length * 0.75);
    return arr[idx];
  };

  const summary = {
    lcp_p75: getP75(lcpValues),
    inp_p75: getP75(inpValues),
    cls_p75: getP75(clsValues),
    ttfb_p75: getP75(ttfbValues),
    sampleCount: vitalsBuffer.length,
    status: "healthy",
  };

  return NextResponse.json({
    success: true,
    summary,
    recent: vitalsBuffer.slice(0, 50),
  });
}
