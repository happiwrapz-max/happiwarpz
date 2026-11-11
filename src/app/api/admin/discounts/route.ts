import { NextRequest, NextResponse } from "next/server";
import { getCoupons, createCoupon } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/security";
import { handleApiError } from "@/lib/server/errors";
import { sanitizeString } from "@/lib/server/sanitize";
import { logAdminAction } from "@/lib/server/auditSecurity";

export async function GET(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }

  try {
    const coupons = await getCoupons();
    return NextResponse.json({
      success: true,
      count: coupons.length,
      coupons,
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to fetch coupons");
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }
  const { user: actor } = adminCheck;

  try {
    const body = await request.json();
    if (!body.code || body.value === undefined) {
      return NextResponse.json(
        { success: false, error: "Coupon code and value are required" },
        { status: 400 }
      );
    }

    const cleanCode = sanitizeString(body.code, 30).toUpperCase();

    const created = await createCoupon({
      ...body,
      code: cleanCode,
      type: body.type === "fixed" ? "fixed" : "percentage",
      value: Math.max(1, Math.min(10000, Number(body.value))),
      minOrderAmount: Math.max(0, Number(body.minOrderAmount || 0)),
      usageLimit: Math.max(1, Number(body.usageLimit || 100)),
    });

    await logAdminAction({
      actor,
      action: "coupon.created",
      note: `Created coupon ${cleanCode}`,
    });

    return NextResponse.json({ success: true, coupon: created }, { status: 201 });
  } catch (err: any) {
    return handleApiError(err, "Failed to create coupon");
  }
}
