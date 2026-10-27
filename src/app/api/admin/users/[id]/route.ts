import { NextRequest, NextResponse } from "next/server";
import { updateUserRole, deleteUser } from "@/lib/server/db";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    if (!body.role) {
      return NextResponse.json(
        { success: false, error: "Role is required" },
        { status: 400 }
      );
    }

    const updated = await updateUserRole(id, body.role);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update user role" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const deleted = await deleteUser(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
