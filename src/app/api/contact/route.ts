import { NextRequest, NextResponse } from "next/server";
import { createContactMessage, getContactMessages } from "@/lib/server/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { success: false, error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const newMessage = await createContactMessage({
      name: body.name,
      email: body.email,
      phone: body.phone,
      subject: body.subject,
      message: body.message,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for reaching out! Our floral concierge will reply promptly.",
        contact: newMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API POST /api/contact error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const messages = await getContactMessages();
    return NextResponse.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("API GET /api/contact error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch contact inquiries" },
      { status: 500 }
    );
  }
}
