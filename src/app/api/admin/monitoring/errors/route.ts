import { NextRequest, NextResponse } from "next/server";
import { getAppErrors, clearResolvedAppErrors } from "@/lib/server/errorMonitoring";
import { requireAdmin } from "@/lib/server/security";
import { handleApiError } from "@/lib/server/errors";
import { logAdminAction } from "@/lib/server/auditSecurity";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity") || undefined;
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await getAppErrors({
      severity,
      category,
      status,
      search,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to fetch error monitoring records");
  }
}

export async function DELETE(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }
  const { user: actor } = adminCheck;

  try {
    const purged = await clearResolvedAppErrors();

    await logAdminAction({
      actor,
      action: "monitoring.errors_purged",
      note: `Admin purged ${purged} resolved error incidents`,
    });

    return NextResponse.json({
      success: true,
      purgedCount: purged,
      message: `Successfully cleared ${purged} resolved incidents.`,
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to purge resolved errors");
  }
}

