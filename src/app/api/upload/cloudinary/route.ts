import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { validateUploadFile } from "@/lib/server/uploadSecurity";
import { handleApiError } from "@/lib/server/errors";
import { requireAuth } from "@/lib/server/security";
import { logAdminAction } from "@/lib/server/auditSecurity";

// Configure Cloudinary from environment
const cloudName =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  "w8fw2mbb";
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

// Prompt Section 10: Standardized Cloudinary folder structure
const ALLOWED_FOLDERS: Record<string, string> = {
  products: "happiwrapz/products",
  categories: "happiwrapz/categories",
  banners: "happiwrapz/banners",
  hero: "happiwrapz/hero",
  thumbnails: "happiwrapz/thumbnails",
  promotions: "happiwrapz/promotions",
  "website-assets": "happiwrapz/website-assets",
};

/**
 * GET: Retrieve live Cloudinary account usage metrics or folder assets
 */
export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view"); // "usage" | "resources"
    const folderKey = searchParams.get("folder") || "products";

    if (!apiKey || !apiSecret) {
      return NextResponse.json({
        success: true,
        cloudName,
        connected: false,
        notice: "Cloudinary credentials not configured in environment.",
      });
    }

    if (view === "resources") {
      const targetFolder = ALLOWED_FOLDERS[folderKey] || "happiwrapz/products";
      const resources = await cloudinary.api.resources({
        type: "upload",
        prefix: targetFolder,
        max_results: 30,
      });

      return NextResponse.json({
        success: true,
        folder: targetFolder,
        resources: resources.resources.map((r: any) => ({
          publicId: r.public_id,
          url: r.secure_url,
          format: r.format,
          bytes: r.bytes,
          width: r.width,
          height: r.height,
          createdAt: r.created_at,
        })),
      });
    }

    // Default: Return live Free Plan quota and usage metrics
    const usage = await cloudinary.api.usage();
    return NextResponse.json({
      success: true,
      cloudName,
      connected: true,
      plan: usage.plan || "Free",
      metrics: {
        credits: usage.credits,
        storage: {
          bytes: usage.storage?.usage || 0,
          creditsUsage: usage.storage?.credits_usage || 0,
          readable: `${((usage.storage?.usage || 0) / (1024 * 1024)).toFixed(2)} MB`,
        },
        bandwidth: {
          bytes: usage.bandwidth?.usage || 0,
          creditsUsage: usage.bandwidth?.credits_usage || 0,
          readable: `${((usage.bandwidth?.usage || 0) / (1024 * 1024)).toFixed(2)} MB`,
        },
        transformations: {
          count: usage.transformations?.usage || 0,
          creditsUsage: usage.transformations?.credits_usage || 0,
        },
        objects: {
          count: usage.objects?.usage || 0,
        },
      },
    });
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch Cloudinary usage");
  }
}

/**
 * POST: Upload an image securely to Cloudinary with validation & auto-optimization
 */
export async function POST(request: NextRequest) {
  // 1. Verify authenticated staff session (Requirement 14 / Security)
  const auth = requireAuth(request);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const requestedFolder = (formData.get("folder") as string) || "products";
    const targetFolder = ALLOWED_FOLDERS[requestedFolder] || "happiwrapz/products";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided for upload." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Security validation: Verify magic bytes, file format (JPG, PNG, WebP, AVIF), max size 10MB
    const validation = validateUploadFile(buffer, file.name);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // 3. Upload to Cloudinary Cloud Space with automatic format & quality transformations
    if (apiKey && apiSecret) {
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: targetFolder,
            resource_type: "image",
            allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      return NextResponse.json({
        success: true,
        message: "Image uploaded successfully to Cloudinary cloud space.",
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        folder: targetFolder,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
        storage: "cloudinary_cloud",
      });
    }

    // Fallback: If credentials missing, save locally
    const uploadsDir = path.join(process.cwd(), "public", "uploads", requestedFolder);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const cleanFilename = `prod-${Date.now()}-${validation.sanitizedFilename}`;
    const filePath = path.join(uploadsDir, cleanFilename);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${requestedFolder}/${cleanFilename}`;

    return NextResponse.json({
      success: true,
      message: "Image saved to local storage buffer.",
      url: publicUrl,
      publicId: `${targetFolder}/${cleanFilename}`,
      bytes: buffer.length,
      storage: "local_buffer",
    });
  } catch (error: any) {
    return handleApiError(error, "Failed to upload image to Cloudinary");
  }
}

/**
 * DELETE: Safely delete an image from Cloudinary by publicId
 */
export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request);
  if ("errorResponse" in auth) {
    return auth.errorResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    let publicId = searchParams.get("publicId");

    if (!publicId) {
      // Check body
      try {
        const body = await request.json();
        publicId = body.publicId;
      } catch {}
    }

    if (!publicId || typeof publicId !== "string") {
      return NextResponse.json(
        { success: false, error: "A valid publicId is required for deletion." },
        { status: 400 }
      );
    }

    // Security Guard: Prevent deleting assets outside the happiwrapz/ sandbox
    if (!publicId.startsWith("happiwrapz/")) {
      return NextResponse.json(
        {
          success: false,
          error: "Permission denied: can only delete assets inside happiwrapz/ workspace.",
        },
        { status: 403 }
      );
    }

    if (apiKey && apiSecret) {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true,
      });

      if (result.result !== "ok" && result.result !== "not found") {
        return NextResponse.json(
          { success: false, error: `Cloudinary delete returned: ${result.result}` },
          { status: 400 }
        );
      }

      await logAdminAction({
        actor: auth.user,
        action: "cloudinary.image_deleted",
        note: `Deleted Cloudinary asset ${publicId}`,
      });

      return NextResponse.json({
        success: true,
        message: "Image deleted successfully from Cloudinary.",
        publicId,
        status: result.result,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Cloudinary credentials not active; skipped remote deletion.",
      publicId,
    });
  } catch (error: any) {
    return handleApiError(error, "Failed to delete image from Cloudinary");
  }
}
