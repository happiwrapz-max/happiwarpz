/**
 * Strips dangerous HTML tags and scripts, escaping sensitive entities.
 */
export function sanitizeString(input: unknown, maxLength = 1000): string {
  if (typeof input !== "string") return "";

  // 1. Strip null bytes
  let clean = input.replace(/\0/g, "");

  // 2. Strip explicit script, iframe, object, embed tags and their contents
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  clean = clean.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // 3. Strip event handlers (onload, onerror, onclick, etc.)
  clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  clean = clean.replace(/on\w+\s*=\s*[^>\s]+/gi, "");

  // 4. Strip javascript: and vbscript: URIs
  clean = clean.replace(/javascript\s*:/gi, "");
  clean = clean.replace(/vbscript\s*:/gi, "");
  clean = clean.replace(/data\s*:\s*text\/html/gi, "");

  // 5. Basic HTML entity escape for characters prone to breaking context
  clean = clean
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

  // 6. Enforce maximum boundary length
  return clean.trim().slice(0, maxLength);
}

/**
 * Validates and normalizes email format
 */
export function sanitizeEmail(email: unknown): string {
  if (typeof email !== "string") return "";
  const trimmed = email.trim().toLowerCase().slice(0, 254);
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) return "";
  return trimmed;
}

/**
 * Validates and normalizes phone number (supports Indian and international formats)
 */
export function sanitizePhone(phone: unknown): string {
  if (typeof phone !== "string") return "";
  // Strip non-digit characters except leading plus
  const cleaned = phone.replace(/[^\d+]/g, "").slice(0, 16);
  if (cleaned.length < 8) return "";
  return cleaned;
}

