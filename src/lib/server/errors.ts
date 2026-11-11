import { NextResponse } from "next/server";
import { recordAppError, sanitizeLogContent } from "./errorMonitoring";
import { ErrorCategory, ErrorSeverity } from "./errorTypes";

/**
 * Sanitizes server error messages to prevent database passwords and paths leaking
 */
export function sanitizeErrorMessage(msg: string): string {
  if (!msg) return "";
  return msg
    .replace(/postgres:\/\/[^@\s]+@/gi, "postgres://***:***@")
    .replace(/bearer\s+[A-Za-z0-9\-_.]+/gi, "Bearer ***")
    .replace(/[A-Z]:\\[^\n\r]+/gi, "[INTERNAL_PATH]")
    .replace(/\/home\/[^\n\r]+/gi, "[INTERNAL_PATH]");
}

/**
 * Sanitizes server errors to prevent information disclosure in production,
 * and records structured diagnostic events into the central error monitoring engine.
 */
export function handleApiError(
  error: unknown,
  fallbackMessage = "An internal server error occurred. Please try again later.",
  status = 500,
  options?: {
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    route?: string;
    endpoint?: string;
    method?: string;
    requestId?: string;
    metadata?: Record<string, any>;
  }
): NextResponse {
  const isDev = process.env.NODE_ENV !== "production";
  const errMessage = error instanceof Error ? error.message : String(error || fallbackMessage);
  const errStack = error instanceof Error ? error.stack : undefined;
  const requestId = options?.requestId || `req-${Date.now().toString(36)}`;

  // Detailed console log
  console.error(`[API Error ${status}][${requestId}]:`, error);

  // Infer error category if not explicitly provided
  let category: ErrorCategory = options?.category || "RUNTIME";
  if (status === 401 || status === 403) category = "AUTHENTICATION";
  else if (status === 400 || status === 422) category = "VALIDATION";
  else if (errMessage.toLowerCase().includes("database") || errMessage.toLowerCase().includes("postgres"))
    category = "DATABASE";
  else if (errMessage.toLowerCase().includes("order")) category = "PAYMENT_ORDER";
  else if (errMessage.toLowerCase().includes("cloudinary") || errMessage.toLowerCase().includes("upload"))
    category = "IMAGE_UPLOAD";

  // Asynchronously record into error monitoring database
  recordAppError({
    category,
    severity: options?.severity,
    message: errMessage,
    stack: errStack,
    route: options?.route,
    endpoint: options?.endpoint,
    method: options?.method,
    statusCode: status,
    requestId,
    metadata: options?.metadata,
  }).catch((recordErr) => {
    console.warn("[ErrorMonitoring] Failed to record error event:", recordErr);
  });

  let clientMessage = fallbackMessage;

  // In development, return informative diagnostic message
  if (isDev && error instanceof Error) {
    clientMessage = error.message;
  }

  // Strip sensitive internal keywords and secrets from client responses
  clientMessage = sanitizeLogContent(clientMessage);

  return NextResponse.json(
    {
      success: false,
      error: clientMessage,
      requestId,
    },
    {
      status,
      headers: {
        "X-Request-Id": requestId,
      },
    }
  );
}
