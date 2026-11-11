import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProductById, updateProduct, deleteProduct } from "@/lib/server/db";
import { redisCache } from "@/lib/server/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const product = await redisCache.getOrSet(
      `catalog:product:${id}`,
      () => getProductById(id),
      120
    );

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("API GET /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updated = await updateProduct(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Invalidate product & catalog cache
    await redisCache.delPattern("catalog:*");

    try {
      revalidatePath("/catalog");
      revalidatePath("/shop");
      revalidatePath("/");
      revalidatePath(`/product/${id}`);
      if (updated.slug) revalidatePath(`/product/${updated.slug}`);
      revalidatePath("/admin/products");
    } catch {}

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("API PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const success = await deleteProduct(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Product not found or already deleted" },
        { status: 404 }
      );
    }

    // Invalidate product & catalog cache
    await redisCache.delPattern("catalog:*");

    try {
      revalidatePath("/catalog");
      revalidatePath("/shop");
      revalidatePath("/");
      revalidatePath("/admin/products");
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Product ${id} deleted successfully`,
    });
  } catch (error) {
    console.error("API DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
