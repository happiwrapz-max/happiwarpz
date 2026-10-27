import { NextResponse } from "next/server";
import { getDashboardAnalytics } from "@/lib/server/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    const analytics = await getDashboardAnalytics(period);
    return NextResponse.json({ success: true, ...analytics });
  } catch (err: any) {
    console.error("Dashboard Analytics API Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load dashboard analytics" },
      { status: 500 }
    );
  }
}
