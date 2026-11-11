import { NextRequest, NextResponse } from "next/server";
import { redisCache } from "./redis";

interface RateLimitRecord {
  timestamps: number[];
  blockedUntil?: number;
}

// In-memory sliding window store (isolated by bucket prefix)
const rateLimitMap = new Map<string, RateLimitRecord>();

// Periodic cleanup of expired records every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < 120000);
      if (record.timestamps.length === 0 && (!record.blockedUntil || record.blockedUntil < now)) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();
}

/**
 * Extracts best-effort client IP from headers
 */
export function getClientIp(request: NextRequest | Request): string {
  const headers = "headers" in request ? request.headers : null;
  if (!headers) return "127.0.0.1";

  // Prioritize trusted proxy headers (e.g. Cloudflare or reverse proxy)
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((s) => s.trim()).filter(Boolean);
    // Use last proxy entry when available or first
    if (parts.length > 0) return parts[0];
  }

  return "127.0.0.1";
}

export interface RateLimitOptions {
  windowMs: number; // e.g. 60000 for 1 minute
  maxRequests: number; // e.g. 5
  blockDurationMs?: number; // cooldown duration if exceeded, e.g. 120000
  prefix?: string;
}

/**
 * Enforces sliding-window rate limit. Returns null if allowed, or 429 NextResponse if rate exceeded.
 */
export function checkRateLimit(
  request: NextRequest | Request,
  options?: Partial<RateLimitOptions>
): { allowed: true; remaining: number } | { allowed: false; response: NextResponse } {
  // Allow test automation bypass if explicit safe testing header is provided
  const testBypass = request.headers.get("x-security-test-bypass");
  if (testBypass === "happiwrapz-automated-security-test-suite" && process.env.NODE_ENV !== "production") {
    return { allowed: true, remaining: 999 };
  }

  const opts: RateLimitOptions = {
    prefix: options?.prefix || "global",
    windowMs: options?.windowMs || 60 * 1000,
    maxRequests: options?.maxRequests || 60,
    blockDurationMs: options?.blockDurationMs || 60 * 1000,
  };

  const ip = getClientIp(request);
  const prefix = opts.prefix || "global";
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  let record = rateLimitMap.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(key, record);
  }

  // Check if currently under block cooldown
  if (record.blockedUntil && record.blockedUntil > now) {
    const retryAfterSec = Math.ceil((record.blockedUntil - now) / 1000);
    return {
      allowed: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Too many requests. Temporary abuse cooldown active. Please try again later.",
          retryAfter: retryAfterSec,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSec),
            "X-RateLimit-Limit": String(opts.maxRequests),
            "X-RateLimit-Remaining": "0",
          },
        }
      ),
    };
  }

  // Filter timestamps within sliding window
  record.timestamps = record.timestamps.filter((t) => now - t < opts.windowMs);

  if (record.timestamps.length >= opts.maxRequests) {
    // Exceeded limit -> apply cooldown if configured
    if (opts.blockDurationMs) {
      record.blockedUntil = now + opts.blockDurationMs;
    }
    const oldestTimestamp = record.timestamps[0] || now;
    const retryAfterSec = Math.ceil((opts.windowMs - (now - oldestTimestamp)) / 1000);

    return {
      allowed: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded. Please slow down.",
          retryAfter: retryAfterSec,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(1, retryAfterSec)),
            "X-RateLimit-Limit": String(opts.maxRequests),
            "X-RateLimit-Remaining": "0",
          },
        }
      ),
    };
  }

  // Add current request timestamp
  record.timestamps.push(now);
  const remaining = opts.maxRequests - record.timestamps.length;

  return { allowed: true, remaining };
}

// Pre-configured rate limiters
export const AUTH_RATE_LIMIT: RateLimitOptions = {
  prefix: "auth",
  windowMs: 60 * 1000, // 1 min
  maxRequests: 10,
  blockDurationMs: 60 * 1000,
};

export const ORDER_RATE_LIMIT: RateLimitOptions = {
  prefix: "order",
  windowMs: 60 * 1000,
  maxRequests: 20,
  blockDurationMs: 60 * 1000,
};

export const PUBLIC_FORM_RATE_LIMIT: RateLimitOptions = {
  prefix: "public-form",
  windowMs: 60 * 1000,
  maxRequests: 10,
  blockDurationMs: 60 * 1000,
};

export const GENERAL_RATE_LIMIT: RateLimitOptions = {
  prefix: "general",
  windowMs: 60 * 1000,
  maxRequests: 60,
  blockDurationMs: 60 * 1000,
};

export const MONITORING_RATE_LIMIT: RateLimitOptions = {
  prefix: "monitoring",
  windowMs: 60 * 1000,
  maxRequests: 60,
  blockDurationMs: 60 * 1000,
};

