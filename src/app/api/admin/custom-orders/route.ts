import { NextRequest, NextResponse } from "next/server";
import { getCustomOrders, createCustomOrder } from "@/lib/server/db";
import { requireAdmin, getAuthenticatedUser } from "@/lib/server/security";
import { handleApiError } from "@/lib/server/errors";
import { sanitizeString, sanitizeEmail, sanitizePhone } from "@/lib/server/sanitize";
import { checkRateLimit, ORDER_RATE_LIMIT } from "@/lib/server/rateLimit";

export async function GET(request: NextRequest) {
  // Only admins can view the custom orders index
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const customOrders = await getCustomOrders({ status, search });
    return NextResponse.json({ success: true, customOrders });
  } catch (err: any) {
    return handleApiError(err, "Failed to fetch custom orders");
  }
}

export async function POST(request: NextRequest) {
  // Public custom inquiry endpoint: Rate limit
  const rateLimitResult = checkRateLimit(request, ORDER_RATE_LIMIT);
  if (!rateLimitResult.allowed) {
    return rateLimitResult.response;
  }

  try {
    const body = await request.json();
    if (!body.customer?.name || !body.customer?.phone) {
      return NextResponse.json(
        { success: false, error: "Customer name and phone number are required." },
        { status: 400 }
      );
    }

    const cleanCustomer = {
      name: sanitizeString(body.customer.name, 100),
      phone: sanitizePhone(body.customer.phone),
      email: body.customer.email ? sanitizeEmail(body.customer.email) : undefined,
      address: body.customer.address ? sanitizeString(body.customer.address, 300) : undefined,
      city: body.customer.city ? sanitizeString(body.customer.city, 100) : "Bangalore",
    };

    const created = await createCustomOrder({
      ...body,
      customer: cleanCustomer,
      occasion: sanitizeString(body.occasion || "Bespoke Gift", 100),
      productType: sanitizeString(body.productType || "Ribbon Flower Bouquet", 100),
      flowerPreferences: sanitizeString(body.flowerPreferences || "", 300),
      wrappingStyle: sanitizeString(body.wrappingStyle || "Classic Korean Satin", 100),
      personalizationText: sanitizeString(body.personalizationText || "", 200),
      specialInstructions: body.specialInstructions ? sanitizeString(body.specialInstructions, 500) : undefined,
    });

    return NextResponse.json({ success: true, customOrder: created }, { status: 201 });
  } catch (err: any) {
    return handleApiError(err, "Failed to create custom order");
  }
}
