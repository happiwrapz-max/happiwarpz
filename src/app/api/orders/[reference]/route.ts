import { NextRequest, NextResponse } from "next/server";
import { getOrderByReference, updateOrderStatus, addOrderInternalNote, updateOrderTracking } from "@/lib/server/db";
import { OrderStatus } from "@/lib/utils";
import { getAuthenticatedUser, requireAuth } from "@/lib/server/security";
import { handleApiError } from "@/lib/server/errors";
import { sanitizeString } from "@/lib/server/sanitize";
import { logAdminAction } from "@/lib/server/auditSecurity";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await context.params;
    const cleanRef = sanitizeString(reference, 50);
    const order = await getOrderByReference(cleanRef);

    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order reference ${cleanRef} not found` },
        { status: 404 }
      );
    }

    const user = getAuthenticatedUser(request);

    // Requirement 9: IDOR protection
    // If user is logged in as customer, ensure they only view their own order
    if (user && user.role === "customer" && order.customer?.email) {
      if (order.customer.email.toLowerCase() !== user.email.toLowerCase()) {
        return NextResponse.json(
          { success: false, error: "Forbidden: You are not authorized to view this order." },
          { status: 403 }
        );
      }
    }

    // Public tracker (unauthenticated): Return order without sensitive phone / address details unless staff
    if (!user) {
      const publicOrder = {
        ...order,
        customer: {
          name: order.customer?.name || "Customer",
          city: order.customer?.city || "Coimbatore",
        },
      };
      return NextResponse.json({ success: true, order: publicOrder });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return handleApiError(error, "Failed to fetch order");
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ reference: string }> }
) {
  // Requirement 2: Authentication on sensitive update route
  const auth = requireAuth(request);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }
  const { user } = auth;

  // Only authorized staff can alter order status or internal notes
  if (user.role === "customer") {
    return NextResponse.json(
      { success: false, error: "Forbidden: Only store staff can modify order state." },
      { status: 403 }
    );
  }

  try {
    const { reference } = await context.params;
    const cleanRef = sanitizeString(reference, 50);
    const body = await request.json();

    if (body.internalNote) {
      const cleanNote = sanitizeString(body.internalNote, 500);
      const updated = await addOrderInternalNote(cleanRef, cleanNote, user.name || "Admin");
      if (!updated) {
        return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
      }

      await logAdminAction({
        actor: user,
        action: "order.note_added",
        reference: cleanRef,
        note: cleanNote,
      });

      return NextResponse.json({ success: true, order: updated });
    }

    // Update Third-Party Courier Tracking Link & ID
    if (
      body.trackingUrl !== undefined ||
      body.trackingNumber !== undefined ||
      body.courierName !== undefined
    ) {
      const cleanUrl = body.trackingUrl ? sanitizeString(body.trackingUrl, 1000) : "";
      const cleanNum = body.trackingNumber ? sanitizeString(body.trackingNumber, 100) : "";
      const cleanCourier = body.courierName ? sanitizeString(body.courierName, 100) : "";

      const updated = await updateOrderTracking(
        cleanRef,
        {
          trackingUrl: cleanUrl,
          trackingNumber: cleanNum,
          courierName: cleanCourier,
        },
        user.name || "Staff"
      );

      if (!updated) {
        return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
      }

      await logAdminAction({
        actor: user,
        action: "order.tracking_updated",
        reference: cleanRef,
        note: `Tracking: ${cleanCourier} - ${cleanNum}`,
      });

      return NextResponse.json({
        success: true,
        message: "Tracking details saved successfully",
        order: updated,
      });
    }

    if (!body.status) {
      return NextResponse.json(
        { success: false, error: "Status or internalNote field is required" },
        { status: 400 }
      );
    }

    const newStatus = sanitizeString(body.status, 50) as OrderStatus;
    const updated = await updateOrderStatus(
      cleanRef,
      newStatus,
      user.name || "Staff",
      user.role || "admin",
      body.note ? sanitizeString(body.note, 500) : undefined
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: `Order ${cleanRef} not found` }, { status: 404 });
    }

    await logAdminAction({
      actor: user,
      action: "order.status_updated",
      reference: cleanRef,
      toStatus: newStatus,
      note: body.note ? sanitizeString(body.note, 300) : undefined,
    });

    return NextResponse.json({
      success: true,
      message: `Order ${cleanRef} updated to ${newStatus}`,
      order: updated,
    });
  } catch (error) {
    return handleApiError(error, "Failed to update order status");
  }
}
