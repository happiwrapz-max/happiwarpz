import { NextRequest, NextResponse } from "next/server";
import { getInventoryMovements } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/security";
import { handleApiError } from "@/lib/server/errors";

export async function GET(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId") || undefined;

    const movements = await getInventoryMovements(productId);
    return NextResponse.json({
      success: true,
      count: movements.length,
      movements,
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to fetch inventory movements");
  }
}
