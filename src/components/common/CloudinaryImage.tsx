"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import {
  buildCloudinaryUrl,
  getCloudinaryPlaceholder,
  getResponsiveSizes,
  CloudinaryPreset,
  FALLBACK_FLORAL_IMAGE,
  isCloudinaryUrl,
} from "@/lib/cloudinary";

export interface CloudinaryImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
  alt: string;
  preset?: CloudinaryPreset;
  fallbackSrc?: string;
  enableBlurPlaceholder?: boolean;
}

/**
 * High-performance, responsive Cloudinary Image component.
 * Automatically injects f_auto,q_auto and responsive sizing transformations.
 * Prevents CLS with proper aspect ratio boxes and graceful blur-up states.
 */
export default function CloudinaryImage({
  src,
  alt,
  preset = "card",
  fallbackSrc = FALLBACK_FLORAL_IMAGE,
  enableBlurPlaceholder = true,
  className = "",
  fill = false,
  sizes,
  priority = false,
  ...rest
}: CloudinaryImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(() => {
    return buildCloudinaryUrl(src, { preset });
  });
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Compute blur placeholder URL if applicable
  const placeholderUrl =
    enableBlurPlaceholder && isCloudinaryUrl(src)
      ? getCloudinaryPlaceholder(src)
      : undefined;

  // Compute responsive sizes if not explicitly provided
  const computedSizes = sizes || getResponsiveSizes(preset);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <div
      className={`relative overflow-hidden ${
        fill ? "w-full h-full" : ""
      } ${className}`}
    >
      {/* Optional Low-Quality Blur Placeholder backdrop */}
      {placeholderUrl && !isLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-lg scale-105 pointer-events-none transition-opacity duration-500 opacity-60"
          style={{ backgroundImage: `url(${placeholderUrl})` }}
          aria-hidden="true"
        />
      )}

      <Image
        src={currentSrc}
        alt={alt || "Happiwrapz Handcrafted Bouquet"}
        fill={fill}
        sizes={computedSizes}
        priority={priority}
        decoding={priority ? "sync" : "async"}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded || priority ? "opacity-100" : "opacity-0"
        } ${fill ? "object-contain" : ""}`}
        {...rest}
      />
    </div>
  );
}

