import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/security";
import { handleApiError } from "@/lib/server/errors";

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        user: null,
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user,
    });
  } catch (error) {
    return handleApiError(error, "Failed to retrieve user session");
  }
}
