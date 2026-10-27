import { NextRequest, NextResponse } from "next/server";
import { addSubscriber, getSubscribers } from "@/lib/server/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email || !body.email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required" },
        { status: 400 }
      );
    }

    const result = await addSubscriber(body.email);

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("API POST /api/newsletter error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const subscribers = await getSubscribers();
    return NextResponse.json({
      success: true,
      count: subscribers.length,
      subscribers,
    });
  } catch (error) {
    console.error("API GET /api/newsletter error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}
