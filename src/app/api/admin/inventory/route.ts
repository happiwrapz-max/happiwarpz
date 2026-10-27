import { NextResponse } from "next/server";
import { getInventoryStatus, getInventoryMovements } from "@/lib/server/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId") || undefined;

    const status = await getInventoryStatus();
    const movements = await getInventoryMovements(productId);

    return NextResponse.json({
      success: true,
      ...status,
      movements,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load inventory status" },
      { status: 500 }
    );
  }
}
