import { NextRequest, NextResponse } from "next/server";
import { getCategories, saveCategory, updateCategory, deleteCategory, getProducts } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/security";
import { handleApiError } from "@/lib/server/errors";
import { logAdminAction } from "@/lib/server/auditSecurity";

export async function GET(request: NextRequest) {
  try {
    const categories = await getCategories();
    const products = await getProducts();

    // Calculate live product count for each category
    const categoriesWithCount = categories.map((cat) => {
      const count = products.filter(
        (p) =>
          p.category.toLowerCase().replace(/[^a-z0-9]+/g, "-") === cat.slug ||
          p.category.toLowerCase() === cat.name.toLowerCase()
      ).length;
      return { ...cat, productCount: count };
    });

    return NextResponse.json({
      success: true,
      count: categoriesWithCount.length,
      categories: categoriesWithCount,
    });
  } catch (error) {
    return handleApiError(error, "Failed to retrieve categories");
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = requireAdmin(request);
  if ("errorResponse" in adminCheck) {
    return adminCheck.errorResponse;
  }

  try {
    const body = await request.json();
    const { name, slug, description, image, icon, featured, active } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    const newCategory = await saveCategory({
      name: name.trim(),
      slug: (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: description?.trim() || "",
      image: image || "",
      icon: icon || "🌹",
      featured: Boolean(featured),
      active: active !== undefined ? Boolean(active) : true,
    });

    logAdminAction({
      actor: adminCheck.user,
      action: "CATEGORY_CREATED",
      note: `Created category ${newCategory.name} (${newCategory.slug})`,
    });

    return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to create category");
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
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    const updated = await updateCategory(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    logAdminAction({
      actor: adminCheck.user,
      action: "CATEGORY_UPDATED",
      note: `Updated category ${updated.name} (${updated.slug})`,
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    return handleApiError(error, "Failed to update category");
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
        { success: false, error: "Category ID parameter is required" },
        { status: 400 }
      );
    }

    const deleted = await deleteCategory(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Category not found or already deleted" },
        { status: 404 }
      );
    }

    logAdminAction({
      actor: adminCheck.user,
      action: "CATEGORY_DELETED",
      note: `Deleted category ID: ${id}`,
    });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    return handleApiError(error, "Failed to delete category");
  }
}
