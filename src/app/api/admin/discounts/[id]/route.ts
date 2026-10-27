import { NextResponse } from "next/server";
import { updateCoupon, deleteCoupon } from "@/lib/server/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateCoupon(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, coupon: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update coupon" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteCoupon(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
