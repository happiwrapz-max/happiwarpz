import { NextRequest, NextResponse } from "next/server";
import { getWebsiteSettings, updateWebsiteSettings } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/security";
import { handleApiError } from "@/lib/server/errors";
import { logAdminAction } from "@/lib/server/auditSecurity";
import { redisCache } from "@/lib/server/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request: NextRequest) {
  try {
    const settings = await getWebsiteSettings();
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
    return handleApiError(err, "Failed to load website settings");
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }
  const { user: actor } = adminCheck;

  try {
    const body = await request.json();
    const settingsPayload = { ...(body.settings || body) };
    if ("settings" in settingsPayload) {
      delete (settingsPayload as any).settings;
    }
    const actorName = body.actorName || actor.name || "Happiwrapz Owner";
    const saved = await updateWebsiteSettings(settingsPayload, actorName);

    // Invalidate Redis content cache immediately
    await redisCache.del(["content:settings", "happiwrapz:content:settings"]);
    await redisCache.delPattern("content:*");

    await logAdminAction({
      actor,
      action: "content.published",
      note: "Updated live website hero & announcement banners",
    });

    return NextResponse.json({ success: true, settings: saved });
  } catch (err: any) {
    return handleApiError(err, "Failed to save website settings");
  }
}
