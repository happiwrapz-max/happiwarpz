import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createUser, sanitizeUser } from "@/lib/server/db";
import { attachSessionCookie, verifyPassword, isStaffRole } from "@/lib/server/security";
import { checkRateLimit, AUTH_RATE_LIMIT } from "@/lib/server/rateLimit";
import { sanitizeEmail, sanitizeString } from "@/lib/server/sanitize";
import { handleApiError } from "@/lib/server/errors";

export async function POST(request: NextRequest) {
  // 1. Rate Limiting defense against brute force & credential stuffing
  const rateLimitResult = checkRateLimit(request, AUTH_RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  try {
    const body = await request.json();
    const email = sanitizeEmail(body.email);
    const name = body.name ? sanitizeString(body.name) : undefined;
    const providedPassword = typeof body.password === "string" ? body.password : undefined;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required" },
        { status: 400 }
      );
    }

    // Retrieve verified account or provision new customer
    let user = await getUserByEmail(email);

    if (!user) {
      // Auto-provision verified customer (never default to staff/admin)
      user = await createUser({
        email,
        name: name || email.split("@")[0].replace(/[._-]/g, " "),
        role: "customer",
      });
    } else {
      if (name && !user.name) {
        user.name = name;
      }

      // If user is staff and has a password configured by Admin, verify it strictly
      if (isStaffRole(user.role) && user.passwordHash) {
        if (!providedPassword || !verifyPassword(providedPassword, user.passwordHash)) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Invalid staff password. If you forgot your password, contact your Store Administrator to reset it.",
            },
            { status: 401 }
          );
        }
      }
    }

    const safeUser = sanitizeUser(user);

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: "Authentication successful",
    });

    // Attach tamper-proof signed session cookie
    attachSessionCookie(response, safeUser);

    return response;
  } catch (error) {
    return handleApiError(error, "Authentication failed. Please verify credentials.");
  }
}
