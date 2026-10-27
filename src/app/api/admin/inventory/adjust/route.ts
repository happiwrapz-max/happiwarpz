import { NextResponse } from "next/server";
import { adjustStock } from "@/lib/server/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, change, reason, actorName, actorRole, referenceId } = body;

    if (!productId || change === undefined || !reason) {
      return NextResponse.json(
        { success: false, error: "Product ID, change amount, and reason are required." },
        { status: 400 }
      );
    }

    const updated = await adjustStock({
      productId,
      change: Number(change),
      reason,
      actorName: actorName || "Store Manager",
      actorRole: actorRole || "manager",
      referenceId,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to adjust inventory" },
      { status: 500 }
    );
  }
}
