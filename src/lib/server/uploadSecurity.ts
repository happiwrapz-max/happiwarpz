import crypto from "crypto";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFilename?: string;
  detectedMimeType?: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "pdf"]);

// Magic byte signatures for authorized file types
const MAGIC_SIGNATURES: { mime: string; ext: string; bytes: number[] }[] = [
  { mime: "image/jpeg", ext: "jpg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", ext: "png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mime: "image/webp", ext: "webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF header
  { mime: "application/pdf", ext: "pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
];

/**
 * Validates file buffer magic bytes, size, and filename against security policies
 */
export function validateUploadFile(
  buffer: Buffer,
  originalFilename: string
): FileValidationResult {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: "Empty file provided." };
  }

  // 1. Enforce size limit
  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds 5MB limit (${(buffer.length / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  // 2. Validate file extension
  const cleanFilename = originalFilename.replace(/[/\\?%*:|"<>]/g, "");
  const extensionMatch = cleanFilename.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extensionMatch ? extensionMatch[1].toLowerCase() : "";

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Unsupported file extension .${ext}. Only JPG, PNG, WEBP, and PDF files are permitted.`,
    };
  }

  // 3. Validate magic byte signatures (header inspection)
  let matchedSignature: (typeof MAGIC_SIGNATURES)[0] | null = null;
  for (const sig of MAGIC_SIGNATURES) {
    if (buffer.length >= sig.bytes.length) {
      const matches = sig.bytes.every((byte, idx) => buffer[idx] === byte);
      if (matches) {
        // For WebP (RIFF), verify bytes 8-11 are 'WEBP' (0x57, 0x45, 0x42, 0x50) to prevent WAV/AVI masquerading
        if (sig.ext === "webp") {
          if (
            buffer.length < 12 ||
            buffer[8] !== 0x57 ||
            buffer[9] !== 0x45 ||
            buffer[10] !== 0x42 ||
            buffer[11] !== 0x50
          ) {
            continue;
          }
        }
        matchedSignature = sig;
        break;
      }
    }
  }

  if (!matchedSignature) {
    return {
      valid: false,
      error: "File content signature does not match authorized binary formats (MIME spoofing detected).",
    };
  }

  // 4. Generate random cryptographic UUID filename to prevent path traversal
  const uniqueId = crypto.randomUUID();
  const sanitizedFilename = `${uniqueId}.${matchedSignature.ext}`;

  return {
    valid: true,
    sanitizedFilename,
    detectedMimeType: matchedSignature.mime,
  };
}

