import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/security";
import { handleApiError } from "@/lib/server/errors";
import { sanitizeString } from "@/lib/server/sanitize";

export async function GET(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const cleanOrderId = orderId ? sanitizeString(orderId, 64) : undefined;

    const logs = await getAuditLogs(cleanOrderId);
    return NextResponse.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch audit logs");
  }
}
