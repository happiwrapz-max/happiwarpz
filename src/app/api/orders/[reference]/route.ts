import { NextRequest, NextResponse } from "next/server";
import { getOrderByReference, updateOrderStatus } from "@/lib/server/db";
import { OrderStatus } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await context.params;
    const order = await getOrderByReference(reference);

    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order reference ${reference} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("API GET /api/orders/[reference] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await context.params;
    const body = await request.json();

    if (body.internalNote) {
      const { addOrderInternalNote } = await import("@/lib/server/db");
      const updated = await addOrderInternalNote(
        reference,
        body.internalNote,
        body.actorName || "Admin"
      );
      if (!updated) {
        return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, order: updated });
    }

    if (!body.status) {
      return NextResponse.json(
        { success: false, error: "Status or internalNote field is required" },
        { status: 400 }
      );
    }

    const updated = await updateOrderStatus(
      reference,
      body.status as OrderStatus,
      body.actorName || "Store Owner",
      body.actorRole || "owner",
      body.note
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: `Order ${reference} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order ${reference} updated to ${body.status}`,
      order: updated,
    });
  } catch (error) {
    console.error("API PATCH /api/orders/[reference] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
