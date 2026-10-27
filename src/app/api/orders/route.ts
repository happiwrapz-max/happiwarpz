import { NextRequest, NextResponse } from "next/server";
import { getOrders, createOrder } from "@/lib/server/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const email = searchParams.get("email") || undefined;
    const search = searchParams.get("search") || undefined;

    const orders = await getOrders({ status, email, search });

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("API GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one gift item is required" },
        { status: 400 }
      );
    }

    if (
      !body.customer ||
      !body.customer.name ||
      !body.customer.email ||
      !body.customer.phone ||
      !body.customer.address
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Recipient contact details (name, email, phone, address) are required",
        },
        { status: 400 }
      );
    }

    const newOrder = await createOrder({
      items: body.items,
      customer: {
        name: body.customer.name.trim(),
        email: body.customer.email.trim(),
        phone: body.customer.phone.trim(),
        address: body.customer.address.trim(),
        city: body.customer.city?.trim() || "Bangalore",
        pincode: body.customer.pincode?.trim() || "",
      },
      deliveryDate: body.deliveryDate,
      deliverySlot: body.deliverySlot || "Morning (9:00 AM - 12:00 PM)",
      notes: body.notes?.trim() || undefined,
      couponCode: body.couponCode?.trim() || undefined,
      discountAmount: body.discountAmount ? Number(body.discountAmount) : 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order request created successfully. Our concierge will confirm via WhatsApp.",
        order: newOrder,
        reference: newOrder.reference,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order request" },
      { status: 500 }
    );
  }
}
