"use client";

import Image from "next/image";
import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Heart, Maximize2, ShieldCheck, ChevronLeft, ChevronRight, X, Eye } from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";
import {
  buildCloudinaryUrl,
  getCloudinaryPlaceholder,
  FALLBACK_FLORAL_IMAGE,
} from "@/lib/cloudinary";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  // Touch swipe support for mobile
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Guarantee at least 4 images for luxury gallery browsing
  const galleryImages =
    images && images.length > 0
      ? images
      : [
          "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg",
          "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881758/happiwrapz/products/rose-bouquet-2.jpg",
          "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881759/happiwrapz/products/rose-bouquet-3.jpg",
          "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881761/happiwrapz/products/rose-bouquet-4.jpg",
        ];

  // Secondary angle index for smooth hover switch animation
  const alternateIndex = (selectedIndex + 1) % galleryImages.length;
  const primaryImage = galleryImages[selectedIndex] || galleryImages[0];
  const secondaryImage = galleryImages[alternateIndex] || primaryImage;

  // Optimized Cloudinary URLs for each display context
  const optimizedPrimary = buildCloudinaryUrl(primaryImage, { preset: "detail" });
  const optimizedSecondary = buildCloudinaryUrl(secondaryImage, { preset: "detail" });
  const primaryLQIP = getCloudinaryPlaceholder(primaryImage);

  // Preload next gallery image in background to ensure instant transition
  useEffect(() => {
    if (typeof window !== "undefined" && galleryImages.length > 1) {
      const nextIdx = (selectedIndex + 1) % galleryImages.length;
      const nextUrl = buildCloudinaryUrl(galleryImages[nextIdx], { preset: "detail" });
      const img = new window.Image();
      img.src = nextUrl;
    }
  }, [selectedIndex, galleryImages]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % galleryImages.length);
  }, [galleryImages.length]);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  }, [galleryImages.length]);

  // Touch event handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = touchStartY.current ? e.changedTouches[0].clientY - touchStartY.current : 0;

    // Only swipe if horizontal motion exceeds vertical motion
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <>
      <div className="flex flex-col-reverse sm:flex-row items-center sm:items-start gap-3 sm:gap-4 w-full select-none">
        {/* ── Thumbnail Rail (Vertical on sm+, horizontal on mobile) ── */}
        <div className="flex sm:flex-col gap-2 shrink-0 overflow-x-auto sm:overflow-visible py-1 sm:py-0 w-full sm:w-auto justify-center sm:justify-start scrollbar-none">
          {galleryImages.map((img, idx) => {
            const isSelected = selectedIndex === idx;
            const thumbUrl = buildCloudinaryUrl(img, { preset: "thumbnail" });
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={cn(
                  "relative w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-2xl overflow-hidden bg-white cursor-pointer transition-all duration-300 border p-1 shrink-0 group shadow-2xs",
                  isSelected
                    ? "border-[#E10600] ring-2 ring-[#E10600]/30 shadow-xs scale-102"
                    : "border-[#EFEAE2] hover:border-[#BBB] opacity-75 hover:opacity-100"
                )}
                aria-label={`View photo ${idx + 1} of ${productName}`}
              >
                <Image
                  src={thumbUrl}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 56px, 72px"
                  decoding="async"
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
                {isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#E10600]" />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Main Showcase Viewport with Animated Hover Image Switch (NO ZOOM) ── */}
        <div className="relative w-full flex-1">
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative w-full aspect-square bg-[#FAF8F5] rounded-3xl border border-[#EFEAE2] flex items-center justify-center p-3 sm:p-5 shadow-xs overflow-hidden cursor-pointer"
            onClick={handleNext}
            title="Click to view next image • Hover to switch angle"
          >
            {/* Badges Overlay */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E10600] text-white text-[10px] sm:text-[11px] font-serif uppercase tracking-wider font-semibold shadow-xs">
                <RibbonEmblem className="w-3 h-3 text-white" />
                <span>Signature Atelier</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[#059669] text-[9px] sm:text-[10px] font-sans font-medium border border-[#EFEAE2] shadow-2xs">
                <ShieldCheck className="w-3 h-3" />
                <span>100% Everlasting Satin</span>
              </span>
            </div>

            {/* Quick Action Buttons (Fullscreen Expand + Wishlist) */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomModalOpen(true);
                }}
                className="p-2 rounded-full bg-white/95 backdrop-blur-xs text-[#666] hover:text-[#1E1E1E] transition-all shadow-xs hover:shadow-md cursor-pointer hover:scale-105"
                title="Expand high-resolution view"
                aria-label="Expand photo"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWishlisted(!isWishlisted);
                }}
                className="p-2 rounded-full bg-white/95 backdrop-blur-xs text-[#888] hover:text-[#E10600] transition-all shadow-xs hover:shadow-md cursor-pointer hover:scale-105"
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isWishlisted ? "fill-[#E10600] text-[#E10600]" : ""
                  )}
                />
              </button>
            </div>

            {/* Prev / Next Chevrons */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-sm border border-[#EFEAE2] flex items-center justify-center text-[#555] hover:text-[#E10600] hover:scale-110 transition-all cursor-pointer opacity-75 hover:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow-sm border border-[#EFEAE2] flex items-center justify-center text-[#555] hover:text-[#E10600] hover:scale-110 transition-all cursor-pointer opacity-75 hover:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* ── Animated Showcase Image Layers (Crossfade Switch on Hover, NO ZOOM) ── */}
            <div className="relative w-full h-full">
              {/* Primary Image Layer */}
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center p-2 sm:p-4 transition-all duration-500 ease-out will-change-transform",
                  isHovered && galleryImages.length > 1
                    ? "opacity-0 scale-95 pointer-events-none"
                    : "opacity-100 scale-100"
                )}
              >
                <Image
                  src={optimizedPrimary}
                  alt={`${productName} view ${selectedIndex + 1}`}
                  fill
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
                  className="object-contain"
                />
              </div>

              {/* Secondary Alternate Image Layer (Revealed smoothly on hover) */}
              {galleryImages.length > 1 && (
                <div
                  className={cn(
                    "absolute inset-0 flex items-center justify-center p-2 sm:p-4 transition-all duration-500 ease-out will-change-transform",
                    isHovered
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-105 pointer-events-none"
                  )}
                >
                  <Image
                    src={optimizedSecondary}
                    alt={`${productName} alternate view ${alternateIndex + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
                    decoding="async"
                    className="object-contain"
                  />
                </div>
              )}
            </div>

            {/* Interactive Angle Switch Status Badge */}
            <div className="hidden sm:inline-flex absolute bottom-3 left-3 items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[10px] border border-[#EFEAE2] shadow-2xs pointer-events-none transition-all duration-300">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                  isHovered ? "bg-[#E10600] animate-pulse" : "bg-[#888]"
                )}
              />
              <span className={cn("font-medium transition-colors duration-300", isHovered ? "text-[#E10600]" : "text-[#666]")}>
                {isHovered ? `Angle ${alternateIndex + 1} of ${galleryImages.length} (Preview)` : "Hover to switch angle"}
              </span>
            </div>

            {/* Photo count indicator pill */}
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-sans pointer-events-none tracking-wide">
              {selectedIndex + 1} / {galleryImages.length}
            </div>
          </div>

          {/* Mobile Swipe Pagination Dots Indicator */}
          <div className="flex sm:hidden items-center justify-center gap-1.5 mt-2.5">
            {galleryImages.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setSelectedIndex(dotIdx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  selectedIndex === dotIdx
                    ? "w-5 h-1.5 bg-[#E10600]"
                    : "w-1.5 h-1.5 bg-[#DDD] hover:bg-[#BBB]"
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen High-Resolution Modal */}
      {isZoomModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fade-in select-none"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsZoomModalOpen(false)}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer z-50"
            aria-label="Close fullscreen view"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative w-full max-w-4xl max-h-[85vh] aspect-square flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={buildCloudinaryUrl(galleryImages[selectedIndex] || galleryImages[0], { preset: "gallery" })}
              alt={`${productName} fullscreen`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {/* Chevrons in fullscreen */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </>
  );
}

