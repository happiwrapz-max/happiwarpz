import { NextRequest, NextResponse } from "next/server";
import { addSubscriber, getSubscribers } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/security";
import { checkRateLimit, PUBLIC_FORM_RATE_LIMIT } from "@/lib/server/rateLimit";
import { sanitizeEmail } from "@/lib/server/sanitize";
import { handleApiError } from "@/lib/server/errors";

export async function POST(request: NextRequest) {
  const rateLimitResult = checkRateLimit(request, PUBLIC_FORM_RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  try {
    const body = await request.json();
    const cleanEmail = sanitizeEmail(body.email);

    if (!cleanEmail) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const sub = await addSubscriber(cleanEmail);
    return NextResponse.json(
      {
        success: true,
        message: "Welcome to the Happiwrapz Circle! Enjoy 10% off your first handcrafted ribbon bouquet.",
        subscriber: sub,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to subscribe");
  }
}

export async function GET(request: NextRequest) {
  // Only admins can view subscriber emails
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }

  try {
    const subscribers = await getSubscribers();
    return NextResponse.json({
      success: true,
      count: subscribers.length,
      subscribers,
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch subscribers");
  }
}
