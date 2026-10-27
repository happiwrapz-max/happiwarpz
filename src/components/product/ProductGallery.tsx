"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Heart, ZoomIn, ShieldCheck } from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const galleryImages =
    images.length >= 4
      ? images
      : [
          ...images,
          ...Array(4 - images.length).fill(
            images[0] || "/images/products/rose-bouquet-1.jpg"
          ),
        ];

  return (
    <div className="flex flex-col-reverse md:flex-row items-center md:items-start gap-4 lg:gap-6 w-full max-w-[620px] mx-auto sticky top-24">
      {/* Vertical Thumbnail Rail */}
      <div className="flex md:flex-col gap-3 shrink-0 overflow-x-auto md:overflow-visible py-1 md:py-0 w-full md:w-auto justify-center md:justify-start">
        {galleryImages.map((img, idx) => {
          const isSelected = selectedIndex === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#FAF8F5] cursor-pointer transition-all duration-300 border p-1 shrink-0",
                isSelected
                  ? "border-[#E10600] ring-2 ring-[#E10600]/25 shadow-sm scale-102"
                  : "border-[#EFEAE2] hover:border-[#BBB] opacity-75 hover:opacity-100"
              )}
              aria-label={`View photo ${idx + 1} of ${productName}`}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 64px, 80px"
                className="object-contain"
              />
            </button>
          );
        })}
      </div>

      {/* Main Showcase Viewport */}
      <div className="relative w-full aspect-square max-w-[500px] bg-[#FAF8F5] rounded-3xl border border-[#EFEAE2] flex items-center justify-center p-6 sm:p-8 shadow-xs overflow-hidden group">
        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E10600] text-white text-[11px] font-serif uppercase tracking-wider font-semibold shadow-xs">
            <RibbonEmblem className="w-3.5 h-3.5 text-white" />
            <span>Signature Atelier</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[#059669] text-[10px] font-sans font-medium border border-[#EFEAE2] shadow-2xs">
            <ShieldCheck className="w-3 h-3" />
            <span>100% Handcrafted Ribbon</span>
          </span>
        </div>

        {/* Floating Wishlist Heart Button */}
        <button
          type="button"
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/95 backdrop-blur-xs text-[#888] hover:text-[#E10600] transition-all shadow-xs hover:shadow-md cursor-pointer hover:scale-105"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-colors",
              isWishlisted ? "fill-[#E10600] text-[#E10600]" : ""
            )}
          />
        </button>

        {/* Hero Image */}
        <div className="relative w-full h-full">
          <Image
            src={galleryImages[selectedIndex] || galleryImages[0]}
            alt={productName}
            fill
            priority
            sizes="(max-width: 640px) 100vw, 500px"
            className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>

        {/* Image index indicator pill */}
        <div className="absolute bottom-3 right-4 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-xs text-white text-[10px] font-sans">
          {selectedIndex + 1} / {galleryImages.length}
        </div>
      </div>
    </div>
  );
}
