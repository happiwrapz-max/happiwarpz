import { NextRequest, NextResponse } from "next/server";
import { getUsers, createUser } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/security";
import { handleApiError } from "@/lib/server/errors";
import { sanitizeString, sanitizeEmail } from "@/lib/server/sanitize";
import { logAdminAction } from "@/lib/server/auditSecurity";

export async function GET(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }

  try {
    const users = await getUsers();
    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to fetch users");
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }
  const { user: actor } = adminCheck;

  try {
    const body = await request.json();
    const cleanEmail = sanitizeEmail(body.email);
    const cleanName = sanitizeString(body.name, 100);

    if (!cleanEmail || !cleanName) {
      return NextResponse.json(
        { success: false, error: "Valid name and email are required" },
        { status: 400 }
      );
    }

    // Only owners can assign owner or admin roles
    const role = body.role || "fulfillment";
    if (["owner", "admin"].includes(role) && actor.role !== "owner") {
      return NextResponse.json(
        { success: false, error: "Only the Store Owner can assign admin or owner roles." },
        { status: 403 }
      );
    }

    const password = body.password ? String(body.password).trim() : undefined;
    if (password && password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Staff password must be at least 6 characters in length." },
        { status: 400 }
      );
    }

    const newUser = await createUser({
      name: cleanName,
      email: cleanEmail,
      role,
      password: password || undefined,
      actorName: actor.name || "Happiwrapz Owner",
    });

    await logAdminAction({
      actor,
      action: "user.created",
      note: `Created staff user ${cleanEmail} with role ${role}${password ? " (with admin-assigned password)" : ""}`,
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (err: any) {
    return handleApiError(err, "Failed to create user");
  }
}
