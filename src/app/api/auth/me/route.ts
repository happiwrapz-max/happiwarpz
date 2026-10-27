import { NextRequest, NextResponse } from "next/server";
import { User, DEMO_ACCOUNTS } from "@/lib/store/types";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("hw_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        user: null,
      });
    }

    try {
      const user: User = JSON.parse(sessionCookie.value);
      return NextResponse.json({
        success: true,
        authenticated: true,
        user,
      });
    } catch {
      return NextResponse.json({
        success: true,
        authenticated: false,
        user: null,
      });
    }
  } catch (error) {
    console.error("API GET /api/auth/me error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve user session" },
      { status: 500 }
    );
  }
}
