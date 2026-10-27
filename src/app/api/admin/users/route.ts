import { NextResponse } from "next/server";
import { getUsers, createUser } from "@/lib/server/db";

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.email || !body.name) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    const user = await createUser({
      name: body.name,
      email: body.email,
      role: body.role || "fulfillment",
    });

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create user" },
      { status: 500 }
    );
  }
}
