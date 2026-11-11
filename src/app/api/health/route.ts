import { NextResponse } from "next/server";
import { getLiveSystemHealthReport } from "@/lib/server/errorMonitoring";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const report = await getLiveSystemHealthReport();
    const status = report.overall === "unavailable" ? 503 : 200;

    return NextResponse.json(
      {
        success: report.overall !== "unavailable",
        report,
      },
      {
        status,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "System health probe failure",
        details: err.message,
      },
      { status: 500 }
    );
  }
}

