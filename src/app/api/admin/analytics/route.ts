import { NextRequest, NextResponse } from "next/server";
import { getDashboardAnalytics } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/security";
import { handleApiError } from "@/lib/server/errors";

export async function GET(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    const data = await getDashboardAnalytics(period);
    return NextResponse.json({ success: true, ...data });
  } catch (err: any) {
    return handleApiError(err, "Failed to load analytics data");
  }
}
