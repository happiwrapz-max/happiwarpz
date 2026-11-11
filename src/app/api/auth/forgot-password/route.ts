import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/server/db";
import { isStaffRole } from "@/lib/server/security";
import { checkRateLimit, AUTH_RATE_LIMIT } from "@/lib/server/rateLimit";
import { sanitizeEmail } from "@/lib/server/sanitize";
import { handleApiError } from "@/lib/server/errors";

export async function POST(request: NextRequest) {
  // 1. Rate limiting defense against enumeration and mail bombing
  const rateLimitResult = checkRateLimit(request, AUTH_RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  try {
    const body = await request.json();
    const email = sanitizeEmail(body.email);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Check if user exists in records
    const user = await getUserByEmail(email);

    // Security Rule: Team members/staff cannot reset their own password. Only Admin can change it.
    if (user && isStaffRole(user.role)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Staff and team member passwords cannot be changed by users. Under studio security governance, staff passwords can only be set or changed directly by the Store Owner/Administrator.",
        },
        { status: 403 }
      );
    }

    if (user && process.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || "Happiwrapz <security@happiwrapz.com>",
            to: [email],
            subject: "Happiwrapz — Password Reset Instructions",
            html: `
              <div style="font-family: serif; color: #180308; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #EFEAE2; border-radius: 16px;">
                <h2 style="color: #E10600; font-size: 24px; margin-bottom: 8px;">Happiwrapz</h2>
                <p style="font-size: 14px; color: #666; margin-bottom: 24px;">Preserving Your Cherished Moments</p>
                <p>Hello ${user.name || "Valued Client"},</p>
                <p>A password reset request was received for your Happiwrapz account. You may reset your password securely via our authenticated client portal.</p>
                <div style="margin: 28px 0;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login?mode=reset&email=${encodeURIComponent(email)}" 
                     style="background: #180308; color: #E5C69F; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-weight: 600; display: inline-block;">
                    Reset Account Password
                  </a>
                </div>
                <p style="font-size: 12px; color: #888;">If you did not request this change, please ignore this notice. Your account remains completely secure.</p>
              </div>
            `,
          }),
        });
      } catch (mailErr) {
        console.warn("[ForgotPassword] Email delivery notice:", mailErr);
      }
    }

    // Generic response to prevent user enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, password reset instructions have been dispatched.",
    });
  } catch (error) {
    return handleApiError(error, "Failed to process password reset request");
  }
}
