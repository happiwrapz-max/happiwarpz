import { NextResponse } from "next/server";
import {
  getCustomOrderById,
  updateCustomOrderStatus,
  saveQuotation,
  convertCustomOrderToStandardOrder,
} from "@/lib/server/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const custom = await getCustomOrderById(id);
    if (!custom) {
      return NextResponse.json(
        { success: false, error: "Custom order not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, customOrder: custom });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch custom order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const action = body.action || "update_status";

    if (action === "convert_to_order") {
      const result = await convertCustomOrderToStandardOrder(
        id,
        body.actorName || "Store Owner",
        body.actorRole || "owner"
      );
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, order: result.order });
    }

    if (action === "save_quotation") {
      const quotation = await saveQuotation(id, body.quotation);
      if (!quotation) {
        return NextResponse.json(
          { success: false, error: "Failed to save quotation for custom order" },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, quotation });
    }

    // Default status update
    if (body.status) {
      const updated = await updateCustomOrderStatus(
        id,
        body.status,
        body.actorName || "Store Owner",
        body.actorRole || "owner",
        body.note
      );
      if (!updated) {
        return NextResponse.json(
          { success: false, error: "Custom order not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, customOrder: updated });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process custom order action" },
      { status: 500 }
    );
  }
}
