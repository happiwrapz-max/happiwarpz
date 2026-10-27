import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/server/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId") || undefined;

    const logs = await getAuditLogs(orderId);
    return NextResponse.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("API GET /api/admin/audit error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
