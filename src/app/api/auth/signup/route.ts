import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/server/db";
import { attachSessionCookie } from "@/lib/server/security";
import { checkRateLimit, AUTH_RATE_LIMIT } from "@/lib/server/rateLimit";
import { sanitizeEmail, sanitizeString } from "@/lib/server/sanitize";
import { handleApiError } from "@/lib/server/errors";

export async function POST(request: NextRequest) {
  // Rate limiting defense against automated account creation
  const rateLimitResult = checkRateLimit(request, AUTH_RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  try {
    const body = await request.json();
    const cleanEmail = sanitizeEmail(body.email);
    const cleanName = sanitizeString(body.name, 100);

    if (!cleanEmail || !cleanName) {
      return NextResponse.json(
        { success: false, error: "A valid name and email address are required" },
        { status: 400 }
      );
    }

    const existing = await getUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    const newUser = await createUser({
      name: cleanName,
      email: cleanEmail,
      role: "customer",
    });

    const response = NextResponse.json(
      {
        success: true,
        user: newUser,
        message: "Account created successfully",
      },
      { status: 201 }
    );

    attachSessionCookie(response, newUser);
    return response;
  } catch (error) {
    return handleApiError(error, "Failed to create account");
  }
}
