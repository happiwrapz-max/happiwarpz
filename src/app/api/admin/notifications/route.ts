import { NextResponse } from "next/server";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/server/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const notifications = await getNotifications(unreadOnly);
    return NextResponse.json({ success: true, notifications });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load notifications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (body.all) {
      await markAllNotificationsAsRead();
      return NextResponse.json({ success: true });
    }

    if (body.id) {
      const ok = await markNotificationAsRead(body.id);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ success: false, error: "Missing notification id" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update notification" },
      { status: 500 }
    );
  }
}
