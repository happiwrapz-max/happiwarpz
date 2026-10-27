import { NextResponse } from "next/server";
import { getWebsiteSettings, updateWebsiteSettings } from "@/lib/server/db";

export async function GET() {
  try {
    const settings = await getWebsiteSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load website settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actorName = body.actorName || "Happiwrapz Owner";

    const updated = await updateWebsiteSettings(body.settings || body, actorName);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update website settings" },
      { status: 500 }
    );
  }
}
