import { NextRequest, NextResponse } from "next/server";
import { getOccasions, saveOccasion, updateOccasion, deleteOccasion } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/security";
import { handleApiError } from "@/lib/server/errors";
import { logAdminAction } from "@/lib/server/auditSecurity";

export async function GET(request: NextRequest) {
  try {
    const occasions = await getOccasions();
    return NextResponse.json({
      success: true,
      count: occasions.length,
      occasions,
    });
  } catch (error) {
    return handleApiError(error, "Failed to retrieve occasions");
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }

  try {
    const body = await request.json();
    const { name, headline, recommendedSlug, bannerImage, badge, active } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Occasion name is required" },
        { status: 400 }
      );
    }

    const newOccasion = await saveOccasion({
      name: name.trim(),
      headline: headline?.trim() || "Handcrafted luxury ribbon flowers",
      recommendedSlug: recommendedSlug || "red-rose-bouquet",
      bannerImage: bannerImage || "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg",
      badge: badge || "Curated",
      active: active !== undefined ? Boolean(active) : true,
    });

    logAdminAction({
      actor: adminCheck.user,
      action: "OCCASION_CREATED",
      note: `Created occasion ${newOccasion.name}`,
    });

    return NextResponse.json({ success: true, occasion: newOccasion }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to create occasion");
  }
}

export async function PUT(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Occasion ID is required" },
        { status: 400 }
      );
    }

    const updated = await updateOccasion(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Occasion not found" },
        { status: 404 }
      );
    }

    logAdminAction({
      actor: adminCheck.user,
      action: "OCCASION_UPDATED",
      note: `Updated occasion ${updated.name}`,
    });

    return NextResponse.json({ success: true, occasion: updated });
  } catch (error) {
    return handleApiError(error, "Failed to update occasion");
  }
}

export async function DELETE(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Occasion ID parameter is required" },
        { status: 400 }
      );
    }

    const deleted = await deleteOccasion(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Occasion not found or already deleted" },
        { status: 404 }
      );
    }

    logAdminAction({
      actor: adminCheck.user,
      action: "OCCASION_DELETED",
      note: `Deleted occasion ID: ${id}`,
    });

    return NextResponse.json({ success: true, message: "Occasion deleted successfully" });
  } catch (error) {
    return handleApiError(error, "Failed to delete occasion");
  }
}
