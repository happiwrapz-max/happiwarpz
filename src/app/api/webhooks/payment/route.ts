import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/server/webhookSecurity";
import { handleApiError } from "@/lib/server/errors";

const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || "happiwrapz-secure-webhook-secret-key-2026";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature") || request.headers.get("x-webhook-signature");
    const timestamp = request.headers.get("x-timestamp");
    const eventId = request.headers.get("x-event-id");

    // Requirement 19: Signature, Replay & Idempotency Verification
    const verification = verifyWebhookSignature({
      secret: WEBHOOK_SECRET,
      signatureHeader: signature,
      rawBody,
      timestampHeader: timestamp,
      eventId,
      maxAgeSeconds: 300, // 5 minutes tolerance
    });

    if (!verification.valid) {
      return NextResponse.json({ success: false, error: verification.error }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    return NextResponse.json({
      success: true,
      message: "Webhook processed and validated with tamper-proof signature.",
      eventId,
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to process incoming webhook.");
  }
}

