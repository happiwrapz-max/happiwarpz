import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProducts, createProduct } from "@/lib/server/db";
import { redisCache } from "@/lib/server/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const inStockParam = searchParams.get("inStock");
    const inStock = inStockParam !== null ? inStockParam === "true" : undefined;
    const featuredParam = searchParams.get("featured");
    const featured = featuredParam !== null ? featuredParam === "true" : undefined;
    const bypassCache = searchParams.has("t"); // Timestamp cache-busting flag

    const cacheKey = `catalog:products:${category || "all"}:${search || "none"}:${inStock}:${featured}`;

    let products;
    if (!bypassCache) {
      products = await redisCache.getOrSet(
        cacheKey,
        () => getProducts({ category, search, inStock, featured }),
        60
      );
    } else {
      products = await getProducts({ category, search, inStock, featured });
    }

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("API GET /api/products error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.price || !body.category) {
      return NextResponse.json(
        { success: false, error: "Name, price, and category are required" },
        { status: 400 }
      );
    }

    const newProduct = await createProduct({
      name: body.name,
      slug: body.slug,
      category: body.category,
      description: body.description || "",
      price: Number(body.price),
      compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : undefined,
      images: body.images || [],
      inStock: body.inStock !== undefined ? body.inStock : true,
      featured: body.featured || false,
      options: body.options || [],
      flowerTiers: body.flowerTiers,
      tags: body.tags,
      flowerType: body.flowerType,
      ribbonColor: body.ribbonColor,
      wrappingStyle: body.wrappingStyle,
      stockQuantity: body.stockQuantity ?? 999,
      lowStockThreshold: 0,
      preparationHours: body.preparationHours ?? 3,
    });

    // Invalidate Redis catalog cache
    await redisCache.delPattern("catalog:*");

    try {
      revalidatePath("/catalog");
      revalidatePath("/shop");
      revalidatePath("/");
      revalidatePath("/admin/products");
    } catch {}

    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error("API POST /api/products error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}
