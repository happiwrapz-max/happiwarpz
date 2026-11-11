import { NextResponse } from "next/server";
import { getWebsiteSettings } from "@/lib/server/db";
import { redisCache } from "@/lib/server/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await redisCache.getOrSet(
      "content:settings",
      () => getWebsiteSettings(),
      60
    );
    return NextResponse.json(
      { success: true, settings },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load content" },
      { status: 500 }
    );
  }
}

