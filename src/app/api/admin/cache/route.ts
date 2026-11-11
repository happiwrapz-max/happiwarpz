import { NextRequest, NextResponse } from "next/server";
import { redisCache } from "@/lib/server/redis";
import { requireAdmin } from "@/lib/server/security";
import { logAdminAction } from "@/lib/server/auditSecurity";
import { handleApiError } from "@/lib/server/errors";

export const dynamic = "force-dynamic";

/**
 * GET: Retrieve live Redis caching status, hit/miss rates, and sampled keys
 */
export async function GET(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }

  try {
    const stats = await redisCache.getStats();
    return NextResponse.json({
      success: true,
      cache: stats,
    });
  } catch (error) {
    return handleApiError(error, "Failed to retrieve cache status");
  }
}

/**
 * POST: Purge all cached entries or clear specific keys/patterns
 */
export async function POST(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }
  const { user: actor } = adminCheck;

  try {
    const body = await request.json().catch(() => ({}));
    const pattern = body.pattern || "*";

    let deleted = 0;
    if (pattern === "*" || pattern === "all") {
      await redisCache.flushAll();
      deleted = -1; // All keys purged
    } else {
      deleted = await redisCache.delPattern(pattern);
    }

    await logAdminAction({
      actor,
      action: "cache.purged",
      note: `Purged cache pattern: ${pattern} (${deleted === -1 ? "all keys" : `${deleted} keys deleted`})`,
    });

    const updatedStats = await redisCache.getStats();

    return NextResponse.json({
      success: true,
      message: deleted === -1 ? "Entire cache successfully purged." : `Purged ${deleted} keys matching "${pattern}".`,
      cache: updatedStats,
    });
  } catch (error) {
    return handleApiError(error, "Failed to purge cache");
  }
}

