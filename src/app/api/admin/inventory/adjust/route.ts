import { NextRequest, NextResponse } from "next/server";
import { adjustStock } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/security";
import { handleApiError } from "@/lib/server/errors";
import { sanitizeString } from "@/lib/server/sanitize";
import { logAdminAction } from "@/lib/server/auditSecurity";

export async function POST(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }
  const { user: actor } = adminCheck;

  try {
    const body = await request.json();
    if (!body.productId || body.change === undefined) {
      return NextResponse.json(
        { success: false, error: "Product ID and stock change amount are required" },
        { status: 400 }
      );
    }

    const cleanProductId = sanitizeString(body.productId, 64);
    const change = Math.max(-1000, Math.min(1000, Math.floor(Number(body.change))));
    const cleanReason = (sanitizeString(body.reason || "audit_correction", 50) as any);

    const updatedProduct = await adjustStock({
      productId: cleanProductId,
      change,
      reason: cleanReason,
      actorName: actor.name || "Admin",
      actorRole: actor.role || "owner",
      referenceId: body.referenceId ? sanitizeString(body.referenceId, 64) : undefined,
    });

    if (!updatedProduct) {
      return NextResponse.json({ success: false, error: "Product not found or failed to adjust stock" }, { status: 404 });
    }

    await logAdminAction({
      actor,
      action: "inventory.adjusted",
      orderId: cleanProductId,
      note: `Stock change ${change > 0 ? "+" : ""}${change} for product ${cleanProductId}. New stock: ${updatedProduct.stockQuantity}`,
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to adjust inventory stock");
  }
}
