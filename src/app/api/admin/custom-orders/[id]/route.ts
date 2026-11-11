import { NextRequest, NextResponse } from "next/server";
import {
  getCustomOrderById,
  updateCustomOrderStatus,
  saveQuotation,
  convertCustomOrderToStandardOrder,
} from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/security";
import { handleApiError } from "@/lib/server/errors";
import { sanitizeString } from "@/lib/server/sanitize";
import { logAdminAction } from "@/lib/server/auditSecurity";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }

  try {
    const { id } = await params;
    const cleanId = sanitizeString(id, 64);
    const custom = await getCustomOrderById(cleanId);
    if (!custom) {
      return NextResponse.json(
        { success: false, error: "Custom order not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, customOrder: custom });
  } catch (err: any) {
    return handleApiError(err, "Failed to fetch custom order");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }
  const { user: actor } = adminCheck;

  try {
    const { id } = await params;
    const cleanId = sanitizeString(id, 64);
    const body = await request.json();
    const action = body.action || "update_status";

    if (action === "convert_to_order") {
      const result = await convertCustomOrderToStandardOrder(
        cleanId,
        actor.name || "Store Owner",
        actor.role || "owner"
      );
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      await logAdminAction({
        actor,
        action: "custom_order.converted",
        orderId: cleanId,
        note: `Converted custom order ${cleanId} to standard order`,
      });

      return NextResponse.json({ success: true, order: result.order });
    }

    if (action === "save_quotation") {
      const quotation = await saveQuotation(cleanId, body.quotation);
      if (!quotation) {
        return NextResponse.json(
          { success: false, error: "Failed to save quotation for custom order" },
          { status: 400 }
        );
      }

      await logAdminAction({
        actor,
        action: "custom_order.quoted",
        orderId: cleanId,
        note: `Issued quotation for custom order ${cleanId}`,
      });

      return NextResponse.json({ success: true, quotation });
    }

    // Default: update status
    if (!body.status) {
      return NextResponse.json({ success: false, error: "Status is required." }, { status: 400 });
    }

    const cleanStatus = sanitizeString(body.status, 50);
    const updated = await updateCustomOrderStatus(
      cleanId,
      cleanStatus as any,
      actor.name || "Store Owner",
      actor.role || "owner",
      body.note ? sanitizeString(body.note, 500) : undefined
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Custom order not found" }, { status: 404 });
    }

    await logAdminAction({
      actor,
      action: "custom_order.status_updated",
      orderId: cleanId,
      toStatus: cleanStatus,
      note: body.note ? sanitizeString(body.note, 300) : undefined,
    });

    return NextResponse.json({ success: true, customOrder: updated });
  } catch (err: any) {
    return handleApiError(err, "Failed to update custom order");
  }
}
