import { NextRequest, NextResponse } from "next/server";
import { updateUserRole, updateUserPassword, deleteUser } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/security";
import { handleApiError } from "@/lib/server/errors";
import { sanitizeString } from "@/lib/server/sanitize";
import { logAdminAction } from "@/lib/server/auditSecurity";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }
  const { user: actor } = adminCheck;

  try {
    const { id } = await context.params;
    const cleanId = sanitizeString(id, 64);
    const body = await request.json();

    if (!body.role && !body.password) {
      return NextResponse.json(
        { success: false, error: "Role or password is required" },
        { status: 400 }
      );
    }

    let updatedUser: any = null;

    // 1. Password update by Admin / Store Owner only
    if (body.password) {
      const cleanPassword = String(body.password).trim();
      if (cleanPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: "Staff password must be at least 6 characters in length." },
          { status: 400 }
        );
      }
      updatedUser = await updateUserPassword(
        cleanId,
        cleanPassword,
        actor.name || "Happiwrapz Owner"
      );
      if (!updatedUser) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }
      await logAdminAction({
        actor,
        action: "user.password_updated_by_admin",
        note: `Admin ${actor.name} updated security password for staff ${cleanId}`,
      });
    }

    // 2. Role update by Admin / Store Owner
    if (body.role) {
      const cleanRole = sanitizeString(body.role, 32);
      // Prevent non-owner from elevating anyone to owner
      if (cleanRole === "owner" && actor.role !== "owner") {
        return NextResponse.json(
          { success: false, error: "Only the Store Owner can assign the owner role." },
          { status: 403 }
        );
      }

      updatedUser = await updateUserRole(cleanId, cleanRole as any);
      if (!updatedUser) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      await logAdminAction({
        actor,
        action: "user.role_updated",
        note: `Updated user ${cleanId} role to ${cleanRole}`,
      });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: body.password ? "Staff password successfully updated." : "Staff role updated.",
    });
  } catch (err: any) {
    return handleApiError(err, "Failed to update user");
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }
  const { user: actor } = adminCheck;

  try {
    const { id } = await context.params;
    const cleanId = sanitizeString(id, 64);

    // Prevent deleting oneself
    if (actor.id === cleanId) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own administrator account." },
        { status: 400 }
      );
    }

    const deleted = await deleteUser(cleanId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    await logAdminAction({
      actor,
      action: "user.deleted",
      note: `Deleted user ${cleanId}`,
    });

    return NextResponse.json({ success: true, message: `User ${cleanId} deleted` });
  } catch (err: any) {
    return handleApiError(err, "Failed to delete user");
  }
}
