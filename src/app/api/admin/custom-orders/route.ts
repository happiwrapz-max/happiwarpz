import { NextResponse } from "next/server";
import { getCustomOrders, createCustomOrder } from "@/lib/server/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const customOrders = await getCustomOrders({ status, search });
    return NextResponse.json({ success: true, customOrders });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch custom orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.customer?.name || !body.customer?.phone) {
      return NextResponse.json(
        { success: false, error: "Customer name and phone number are required." },
        { status: 400 }
      );
    }

    const created = await createCustomOrder(body);
    return NextResponse.json({ success: true, customOrder: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create custom order" },
      { status: 500 }
    );
  }
}
