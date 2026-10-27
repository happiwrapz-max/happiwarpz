import { NextResponse } from "next/server";
import { getCoupons, createCoupon, validateCoupon } from "@/lib/server/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const subtotal = searchParams.get("subtotal");

    // If client is validating a coupon code for checkout
    if (code) {
      const res = await validateCoupon(code, subtotal ? Number(subtotal) : 0);
      return NextResponse.json(res);
    }

    const coupons = await getCoupons(false);
    return NextResponse.json({ success: true, coupons });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load coupons" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.code || !body.value) {
      return NextResponse.json(
        { success: false, error: "Coupon code and discount value are required." },
        { status: 400 }
      );
    }

    const coupon = await createCoupon(body);
    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create coupon" },
      { status: 400 }
    );
  }
}
