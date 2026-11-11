/**
 * Central Cloudinary Image Optimization & Responsive Delivery Engine
 * Authoritative cloud name: w8fw2mbb
 * Enforces automatic format (AVIF/WebP), quality compression, responsive breakpoints,
 * low-quality image previews (LQIP) and zero layout shifts.
 */

export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME ||
  "w8fw2mbb";

export const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const FALLBACK_FLORAL_IMAGE =
  "https://res.cloudinary.com/w8fw2mbb/image/upload/f_auto,q_auto,w_800/v1793881756/happiwrapz/products/rose-bouquet-1.jpg";

export type CloudinaryPreset =
  | "thumbnail"     // 200px - cart drawers, compact lists
  | "card"          // 400px - collection cards, carousels
  | "detail"        // 800px - product page main display
  | "gallery"       // 1200px - zoom modals, full-screen lightbox
  | "hero-desktop"  // 1600px - desktop panoramic hero banners
  | "hero-mobile"   // 600px - mobile hero banners
  | "social-og"     // 1200x630 - OpenGraph social cards
  | "lqip"          // 40px - ultra-light blur-up placeholder
  | "custom";

export interface CloudinaryTransformOptions {
  preset?: CloudinaryPreset;
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "limit" | "thumb" | "scale" | "pad";
  gravity?: "auto" | "center" | "face" | "north" | "south";
  quality?: "auto" | "auto:best" | "auto:good" | "auto:eco" | "auto:low" | number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  blur?: number; // e.g. 1000 for LQIP
  dpr?: number | string; // e.g. "auto" or 2
}

/**
 * Standard preset transformation definitions matching Prompt Section 3
 */
const PRESET_CONFIGS: Record<Exclude<CloudinaryPreset, "custom">, CloudinaryTransformOptions> = {
  thumbnail: {
    width: 200,
    height: 200,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "auto",
  },
  card: {
    width: 400,
    height: 400,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "auto",
  },
  detail: {
    width: 800,
    crop: "limit",
    quality: "auto",
    format: "auto",
  },
  gallery: {
    width: 1200,
    crop: "limit",
    quality: "auto",
    format: "auto",
  },
  "hero-desktop": {
    width: 2880,
    crop: "limit",
    quality: "auto:best",
    format: "auto",
    dpr: "auto",
  },
  "hero-mobile": {
    width: 1400,
    crop: "limit",
    quality: "auto:best",
    format: "auto",
    dpr: "auto",
  },
  "social-og": {
    width: 1200,
    height: 630,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "auto",
  },
  lqip: {
    width: 40,
    blur: 1000,
    quality: "auto:low",
    format: "auto",
  },
};

/**
 * Checks whether an arbitrary URL is hosted on Cloudinary
 */
export function isCloudinaryUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  return url.includes("res.cloudinary.com") || url.includes("cloudinary.com");
}

/**
 * Extracts public ID from a Cloudinary URL
 */
export function extractCloudinaryPublicId(url: string | null | undefined): string | null {
  if (!url || !isCloudinaryUrl(url)) return null;

  try {
    // Cloudinary URL format:
    // https://res.cloudinary.com/<cloud>/image/upload/[transformations/][v12345/]<public_id>.<ext>
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    let pathPart = url.substring(uploadIndex + 8); // after "/upload/"

    // Strip version prefix if present (v1234567/)
    const versionMatch = pathPart.match(/^v\d+\//);
    if (versionMatch) {
      pathPart = pathPart.substring(versionMatch[0].length);
    } else {
      // If there are transformations before version: /upload/f_auto,q_auto/v123/...
      const versionInside = pathPart.match(/\/v\d+\//);
      if (versionInside && versionInside.index !== undefined) {
        pathPart = pathPart.substring(versionInside.index + versionInside[0].length);
      } else {
        // Strip leading transformations if they don't have a version tag
        const parts = pathPart.split("/");
        // Look for part with folder or filename
        while (parts.length > 0 && (parts[0].includes(",") || parts[0].startsWith("f_") || parts[0].startsWith("w_") || parts[0].startsWith("c_"))) {
          parts.shift();
        }
        pathPart = parts.join("/");
      }
    }

    // Strip file extension if present (.jpg, .png, etc.)
    const dotIndex = pathPart.lastIndexOf(".");
    if (dotIndex !== -1 && dotIndex > pathPart.lastIndexOf("/")) {
      pathPart = pathPart.substring(0, dotIndex);
    }

    return decodeURIComponent(pathPart);
  } catch {
    return null;
  }
}

/**
 * Builds a transformation string from options (e.g. "f_auto,q_auto,w_400,c_fill,g_auto")
 */
export function buildTransformString(options?: CloudinaryTransformOptions): string {
  const presetConfig =
    options?.preset && options.preset !== "custom" && options.preset in PRESET_CONFIGS
      ? PRESET_CONFIGS[options.preset as keyof typeof PRESET_CONFIGS]
      : {};

  const opts: CloudinaryTransformOptions = {
    ...presetConfig,
    ...options,
  };

  const parts: string[] = [];

  // 1. Format (default to f_auto)
  const format = opts.format || "auto";
  parts.push(`f_${format}`);

  // 2. Quality (default to q_auto)
  const quality = opts.quality || "auto";
  parts.push(`q_${quality}`);

  // 3. Width & Height
  if (opts.width) parts.push(`w_${opts.width}`);
  if (opts.height) parts.push(`h_${opts.height}`);

  // 4. Crop & Gravity
  if (opts.crop) parts.push(`c_${opts.crop}`);
  if (opts.gravity) parts.push(`g_${opts.gravity}`);

  // 5. Blur (for LQIP)
  if (opts.blur) parts.push(`e_blur:${opts.blur}`);

  // 6. Device Pixel Ratio
  if (opts.dpr) parts.push(`dpr_${opts.dpr}`);

  return parts.join(",");
}

/**
 * Injects transformations into any Cloudinary URL or builds one from a public ID.
 * Returns the original URL unaltered if it is not a Cloudinary image (e.g. local /images/ or external).
 */
export function buildCloudinaryUrl(
  source: string | null | undefined,
  options?: CloudinaryTransformOptions
): string {
  if (!source || typeof source !== "string") {
    return FALLBACK_FLORAL_IMAGE;
  }

  const transformStr = buildTransformString(options);

  // Case A: Full Cloudinary URL
  if (isCloudinaryUrl(source)) {
    const uploadIndex = source.indexOf("/upload/");
    if (uploadIndex === -1) return source;

    const base = source.substring(0, uploadIndex + 8); // includes "/upload/"
    let remainder = source.substring(uploadIndex + 8);

    // If remainder already starts with a transformation block, replace it
    // Transformations look like: f_auto,q_auto,w_400/...
    const segments = remainder.split("/");
    if (
      segments[0] &&
      (segments[0].includes(",") ||
        segments[0].startsWith("f_") ||
        segments[0].startsWith("w_") ||
        segments[0].startsWith("c_") ||
        segments[0].startsWith("q_"))
    ) {
      segments.shift(); // remove existing transformation segment
      remainder = segments.join("/");
    }

    return `${base}${transformStr}/${remainder}`;
  }

  // Case B: Public ID (e.g. "happiwrapz/products/rose-bouquet-1")
  if (source.startsWith("happiwrapz/") || !source.startsWith("http") && !source.startsWith("/")) {
    return `${CLOUDINARY_BASE_URL}/${transformStr}/${source}`;
  }

  // Case C: Local file or external URL - return as is
  return source;
}

/**
 * Generates an ultra-light blur-up placeholder URL (LQIP)
 */
export function getCloudinaryPlaceholder(source: string | null | undefined): string {
  return buildCloudinaryUrl(source, { preset: "lqip" });
}

/**
 * Generates responsive srcset string for HTML <img> or Next.js custom loaders
 */
export function generateCloudinarySrcSet(
  source: string | null | undefined,
  widths: number[] = [200, 400, 600, 800, 1200, 1600]
): string {
  if (!source) return "";

  return widths
    .map((w) => {
      const url = buildCloudinaryUrl(source, { width: w, quality: "auto", format: "auto" });
      return `${url} ${w}w`;
    })
    .join(", ");
}

/**
 * Pre-defined standard sizes attribute helper for responsive displays
 */
export function getResponsiveSizes(preset?: CloudinaryPreset): string {
  switch (preset) {
    case "thumbnail":
      return "(max-width: 640px) 56px, 72px";
    case "card":
      return "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";
    case "detail":
      return "(max-width: 768px) 100vw, 50vw";
    case "gallery":
      return "(max-width: 1024px) 100vw, 1200px";
    case "hero-desktop":
      return "100vw";
    case "hero-mobile":
      return "100vw";
    default:
      return "100vw";
  }
}
