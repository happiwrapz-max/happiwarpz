import { NextRequest, NextResponse } from "next/server";
import { getNotifications, markNotificationAsRead } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/security";
import { handleApiError } from "@/lib/server/errors";
import { sanitizeString } from "@/lib/server/sanitize";

export async function GET(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }

  try {
    const notifications = await getNotifications();
    return NextResponse.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to fetch notifications");
  }
}

export async function PATCH(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }

  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: "Notification ID is required" }, { status: 400 });
    }

    const cleanId = sanitizeString(body.id, 64);
    const updated = await markNotificationAsRead(cleanId);
    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    return handleApiError(err, "Failed to update notification");
  }
}
