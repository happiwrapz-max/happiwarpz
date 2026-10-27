import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, createUser } from "@/lib/server/db";
import { DEMO_ACCOUNTS } from "@/lib/store/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    // Handle demo quick login
    if (role) {
      const demoUser = DEMO_ACCOUNTS.find((u) => u.role === role);
      if (demoUser) {
        const response = NextResponse.json({
          success: true,
          user: demoUser,
          message: `Logged in as demo ${role}`,
        });
        response.cookies.set("hw_session", JSON.stringify(demoUser), {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
        return response;
      }
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Check existing demo or db users
    let user = await getUserByEmail(email);

    if (!user) {
      // Check demo accounts
      const demo = DEMO_ACCOUNTS.find((d) => d.email.toLowerCase() === email.toLowerCase());
      if (demo) {
        user = demo;
      } else {
        // Auto-provision customer for friction-free ordering
        user = await createUser({
          email,
          name: email.split("@")[0].replace(/[._-]/g, " "),
          role: "customer",
        });
      }
    }

    const response = NextResponse.json({
      success: true,
      user,
      message: "Authentication successful",
    });

    response.cookies.set("hw_session", JSON.stringify(user), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("API POST /api/auth/login error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}
