import { NextRequest, NextResponse } from "next/server";
import { updateAppErrorStatus, addAppErrorNote } from "@/lib/server/errorMonitoring";
import { requireAdmin } from "@/lib/server/security";
import { handleApiError } from "@/lib/server/errors";
import { logAdminAction } from "@/lib/server/auditSecurity";
import { sanitizeString } from "@/lib/server/sanitize";
import { ErrorStatus } from "@/lib/server/errorTypes";

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

    if (body.status) {
      const validStatuses: ErrorStatus[] = ["UNRESOLVED", "INVESTIGATING", "RESOLVED", "IGNORED"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
      }

      const updated = await updateAppErrorStatus(
        cleanId,
        body.status,
        actor.name || "Happiwrapz Admin",
        body.note
      );

      if (!updated) {
        return NextResponse.json({ success: false, error: "Error record not found" }, { status: 404 });
      }

      await logAdminAction({
        actor,
        action: "monitoring.status_updated",
        note: `Updated error ${cleanId} status to ${body.status}`,
      });

      return NextResponse.json({ success: true, error: updated });
    }

    if (body.note) {
      const cleanNote = sanitizeString(body.note, 1000);
      const updated = await addAppErrorNote(cleanId, actor.name || "Happiwrapz Admin", cleanNote);

      if (!updated) {
        return NextResponse.json({ success: false, error: "Error record not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, error: updated });
    }

    return NextResponse.json({ success: false, error: "No action provided" }, { status: 400 });
  } catch (err: any) {
    return handleApiError(err, "Failed to update error record");
  }
}

