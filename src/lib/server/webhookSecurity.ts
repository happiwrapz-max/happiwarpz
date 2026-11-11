import crypto from "crypto";

// In-memory idempotency cache for webhooks (prevents replay attacks)
const processedWebhookEventIds = new Set<string>();

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    // Clear processed webhooks older than 24 hours
    if (processedWebhookEventIds.size > 10000) {
      processedWebhookEventIds.clear();
    }
  }, 60 * 60 * 1000);
}

export interface WebhookVerificationOptions {
  secret: string;
  signatureHeader: string | null;
  rawBody: string | Buffer;
  timestampHeader?: string | null;
  eventId?: string | null;
  maxAgeSeconds?: number;
}

/**
 * Validates webhook HMAC-SHA256 signature, timestamp tolerance, and idempotency
 */
export function verifyWebhookSignature({
  secret,
  signatureHeader,
  rawBody,
  timestampHeader,
  eventId,
  maxAgeSeconds = 300, // 5 minutes
}: WebhookVerificationOptions): { valid: boolean; error?: string } {
  if (!signatureHeader) {
    return { valid: false, error: "Missing webhook signature header." };
  }

  // 1. Check idempotency if event ID is supplied
  if (eventId) {
    if (processedWebhookEventIds.has(eventId)) {
      return { valid: false, error: "Duplicate webhook event already processed (Idempotency rejected)." };
    }
  }

  // 2. Check timestamp freshness if supplied
  if (timestampHeader) {
    const timestamp = Number(timestampHeader);
    const nowSec = Math.floor(Date.now() / 1000);
    if (isNaN(timestamp) || Math.abs(nowSec - timestamp) > maxAgeSeconds) {
      return { valid: false, error: "Webhook timestamp expired or out of tolerance (Replay attack defense)." };
    }
  }

  // 3. Recompute HMAC-SHA256 signature
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  // Format signature header (handles sha256= prefix if present)
  const cleanReceived = signatureHeader.replace(/^sha256=/, "").trim();

  // 4. Constant-time signature comparison
  const expectedBuf = Buffer.from(expectedSignature);
  const receivedBuf = Buffer.from(cleanReceived);

  if (expectedBuf.length !== receivedBuf.length) {
    return { valid: false, error: "Invalid webhook signature." };
  }

  if (!crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
    return { valid: false, error: "Invalid webhook signature." };
  }

  // Register event ID in idempotency store
  if (eventId) {
    processedWebhookEventIds.add(eventId);
  }

  return { valid: true };
}

