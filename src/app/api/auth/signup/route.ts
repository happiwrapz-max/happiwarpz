import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/server/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      // Return existing user
      const response = NextResponse.json({
        success: true,
        user: existing,
        message: "Account already exists, signed in successfully",
      });
      response.cookies.set("hw_session", JSON.stringify(existing), {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    const newUser = await createUser({
      name,
      email,
      role: "customer",
    });

    const response = NextResponse.json(
      {
        success: true,
        user: newUser,
        message: "Account created successfully",
      },
      { status: 201 }
    );

    response.cookies.set("hw_session", JSON.stringify(newUser), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("API POST /api/auth/signup error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create account" },
      { status: 500 }
    );
  }
}
