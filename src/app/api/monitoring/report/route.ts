import { NextRequest, NextResponse } from "next/server";
import { recordAppError } from "@/lib/server/errorMonitoring";
import { sanitizeString } from "@/lib/server/sanitize";
import { checkRateLimit, GENERAL_RATE_LIMIT } from "@/lib/server/rateLimit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit client error submissions
    const rateLimitResult = checkRateLimit(request, GENERAL_RATE_LIMIT);
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response;
    }

    const body = await request.json();
    const message = sanitizeString(body.message || "Unknown client error", 500);
    const stack = body.stack ? sanitizeString(body.stack, 2000) : undefined;
    const route = body.route ? sanitizeString(body.route, 200) : undefined;
    const category = body.category === "NETWORK" ? "NETWORK" : "RUNTIME";

    const event = await recordAppError({
      category,
      message: `[Client]: ${message}`,
      stack,
      route,
      severity: body.severity === "HIGH" ? "HIGH" : "MEDIUM",
      statusCode: body.statusCode || 400,
      metadata: {
        viewportWidth: body.viewportWidth,
        viewportHeight: body.viewportHeight,
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({ success: true, errorId: event.id });
  } catch (err: any) {
    console.error("[MONITORING REPORT ERROR]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to record client error" },
      { status: 500 }
    );
  }
}
