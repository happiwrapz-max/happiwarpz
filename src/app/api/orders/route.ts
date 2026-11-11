import { NextRequest, NextResponse } from "next/server";
import { getOrders, createOrder } from "@/lib/server/db";
import { getAuthenticatedUser } from "@/lib/server/security";
import { checkRateLimit, ORDER_RATE_LIMIT } from "@/lib/server/rateLimit";
import { sanitizeString, sanitizeEmail, sanitizePhone } from "@/lib/server/sanitize";
import { calculateOrderPricing } from "@/lib/server/pricing";
import { handleApiError } from "@/lib/server/errors";

export async function GET(request: NextRequest) {
  try {
    const user = getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const requestedEmail = searchParams.get("email") || undefined;
    const search = searchParams.get("search") || undefined;

    // Requirement 9 (Stop IDOR): Listing orders strictly requires an authenticated session
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to view orders." },
        { status: 401 }
      );
    }

    // Customer role: strictly bound to their own email, ignoring any spoofed query params
    if (user.role === "customer") {
      const orders = await getOrders({ status, email: user.email, search });
      return NextResponse.json({ success: true, count: orders.length, orders });
    }

    // Admin / Owner / Fulfillment: Authorized to query global orders with filters
    const orders = await getOrders({ status, email: requestedEmail, search });
    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch orders");
  }
}

export async function POST(request: NextRequest) {
  // Requirement 4 (Rate Limiting)
  const rateLimitResult = checkRateLimit(request, ORDER_RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  try {
    const body = await request.json();

    if (!body.customer || !body.customer.name || !body.customer.email || !body.customer.phone || !body.customer.address) {
      return NextResponse.json(
        {
          success: false,
          error: "Recipient contact details (name, email, phone, address) are required",
        },
        { status: 400 }
      );
    }

    const cleanEmail = sanitizeEmail(body.customer.email);
    const cleanPhone = sanitizePhone(body.customer.phone);
    if (!cleanEmail || !cleanPhone) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email and phone number." },
        { status: 400 }
      );
    }

    // Requirement 3 (Never Trust the Frontend) - Calculate prices & coupon discounts server-side
    const pricingResult = await calculateOrderPricing(body.items, body.couponCode);
    if (!pricingResult.success) {
      return NextResponse.json({ success: false, error: pricingResult.error }, { status: 400 });
    }

    const { validatedItems, subtotal, discountAmount, couponCode, deliveryFee, totalAmount } =
      pricingResult.data;

    const newOrder = await createOrder({
      items: validatedItems,
      customer: {
        name: sanitizeString(body.customer.name, 100),
        email: cleanEmail,
        phone: cleanPhone,
        address: sanitizeString(body.customer.address, 300),
        city: sanitizeString(body.customer.city || "Coimbatore", 100),
        pincode: sanitizeString(body.customer.pincode || "", 20),
      },
      deliveryDate: sanitizeString(body.deliveryDate, 50),
      deliverySlot: sanitizeString(body.deliverySlot || "Morning (9:00 AM - 12:00 PM)", 100),
      notes: body.notes ? sanitizeString(body.notes, 500) : undefined,
      couponCode,
      discountAmount,
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
    return handleApiError(error, "Failed to create order request");
  }
}
