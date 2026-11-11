import { NextRequest, NextResponse } from "next/server";
import { createContactMessage, getContactMessages } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/security";
import { checkRateLimit, PUBLIC_FORM_RATE_LIMIT, getClientIp } from "@/lib/server/rateLimit";
import { sanitizeString, sanitizeEmail, sanitizePhone } from "@/lib/server/sanitize";
import { verifyCaptchaToken } from "@/lib/server/captcha";
import { handleApiError } from "@/lib/server/errors";

export async function POST(request: NextRequest) {
  // Requirement 4: Rate Limiting
  const rateLimitResult = checkRateLimit(request, PUBLIC_FORM_RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  try {
    const body = await request.json();

    // Requirement 11: CAPTCHA Verification on public contact form
    const captchaResult = await verifyCaptchaToken(body.captchaToken, getClientIp(request));
    if (!captchaResult.success) {
      return NextResponse.json({ success: false, error: captchaResult.error }, { status: 400 });
    }

    const cleanEmail = sanitizeEmail(body.email);
    const cleanName = sanitizeString(body.name, 100);
    const cleanMessage = sanitizeString(body.message, 2000);

    if (!cleanEmail || !cleanName || !cleanMessage) {
      return NextResponse.json(
        { success: false, error: "Valid name, email, and message are required" },
        { status: 400 }
      );
    }

    const newMessage = await createContactMessage({
      name: cleanName,
      email: cleanEmail,
      phone: body.phone ? sanitizePhone(body.phone) : undefined,
      subject: body.subject ? sanitizeString(body.subject, 150) : "General Inquiry",
      message: cleanMessage,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for reaching out! Our floral concierge will reply promptly via WhatsApp or email.",
        contact: newMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to submit contact message");
  }
}

export async function GET(request: NextRequest) {
  // Requirement 2 & 9: Only authorized administrators may view customer inquiries
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }

  try {
    const messages = await getContactMessages();
    return NextResponse.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch contact inquiries");
  }
}
