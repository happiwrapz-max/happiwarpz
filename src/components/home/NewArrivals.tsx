"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/store/types";
import { formatPrice } from "@/lib/utils";
import { useBagStore } from "@/lib/store/useBagStore";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Star,
  Check,
  ArrowRight,
} from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";
import { buildCloudinaryUrl } from "@/lib/cloudinary";

interface NewArrivalsProps {
  products: Product[];
}

export default function NewArrivals({ products }: NewArrivalsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isInteracting = useRef(false);
  const manualTimeout = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const scrollPosRef = useRef<number>(0);

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);

  const addItem = useBagStore((s) => s.addItem);
  const openDrawer = useBagStore((s) => s.openDrawer);

  // If < 6 products, duplicate 3x; else duplicate 2x for seamless continuous loop
  const displayList =
    products.length < 6
      ? [...products, ...products, ...products]
      : [...products, ...products];

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAddedId(product.id);

    if (typeof window !== "undefined") {
      const rect = e.currentTarget.getBoundingClientRect();
      window.dispatchEvent(
        new CustomEvent("happiwrapz:product-picked", {
          detail: { product, sourceRect: rect },
        })
      );
    }

    setTimeout(() => {
      setAddedId(null);
    }, 1200);
  };

  // Pause interaction helper (No watchdog to forcibly interrupt users)
  const setInteracting = (val: boolean, autoResumeDelay?: number) => {
    if (manualTimeout.current) clearTimeout(manualTimeout.current);
    isInteracting.current = val;

    if (autoResumeDelay) {
      manualTimeout.current = setTimeout(() => {
        isInteracting.current = false;
        if (scrollContainerRef.current) {
          scrollPosRef.current = scrollContainerRef.current.scrollLeft;
        }
        lastTimeRef.current = performance.now();
      }, autoResumeDelay);
    }
  };

  const scrollByAmount = (amount: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;

    setInteracting(true, 2500);
    el.scrollBy({ left: amount, behavior: "smooth" });
    scrollPosRef.current = el.scrollLeft + amount;
  };

  // Glitch-free sub-pixel animation loop
  useEffect(() => {
    const el = scrollContainerRef.current;
    const track = trackRef.current;
    if (!el || !track) return;

    lastTimeRef.current = performance.now();
    const SPEED = 40; // px per second

    const step = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      if (!isInteracting.current && el) {
        scrollPosRef.current += SPEED * dt;

        // Exact wrap point: half the total scrollable track
        const halfWidth = el.scrollWidth / 2;

        if (halfWidth > 0) {
          if (scrollPosRef.current >= halfWidth) {
            scrollPosRef.current -= halfWidth;
          } else if (scrollPosRef.current < 0) {
            scrollPosRef.current += halfWidth;
          }
        }

        el.scrollLeft = scrollPosRef.current;
      }

      animFrameRef.current = requestAnimationFrame(step);
    };

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (manualTimeout.current) clearTimeout(manualTimeout.current);
    };
  }, []);

  return (
    <section id="new-arrivals" className="py-14 sm:py-24 bg-white border-b border-[#EFEAE2] overflow-hidden">
      <div className="container-main px-4 sm:px-6">
        {/* Section Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E10600]/[0.06] border border-[#E10600]/20 text-[#E10600] text-[10px] font-serif uppercase tracking-[0.22em] font-semibold mb-2">
              <RibbonEmblem className="w-3.5 h-3.5 text-[#E10600]" />
              <span>Autumn / Winter 2026 Archive</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1E1E1E] font-normal tracking-[-0.01em]">
              New Arrivals
            </h2>
            <p className="text-xs sm:text-sm font-sans text-[#666] mt-1 max-w-md">
              Handcrafted ribbon rose bouquets, eternal sunflowers, velvet surprise boxes, and forever keepsakes.
            </p>
          </div>

          {/* Stepper Controls & View All Link */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-1.5 text-xs font-serif uppercase tracking-[0.14em] text-[#E10600] hover:text-[#C20500] font-semibold transition-colors mr-2"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Manual Navigation Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scrollByAmount(-320)}
                className="w-9 h-9 rounded-full border border-[#EFEAE2] bg-[#FAF8F5] hover:bg-white hover:border-[#E10600] text-[#1E1E1E] hover:text-[#E10600] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollByAmount(320)}
                className="w-9 h-9 rounded-full border border-[#EFEAE2] bg-[#FAF8F5] hover:bg-white hover:border-[#E10600] text-[#1E1E1E] hover:text-[#E10600] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Infinite Auto-Scrolling Carousel Ribbon */}
      <div
        ref={scrollContainerRef}
        onMouseEnter={() => setInteracting(true)}
        onMouseLeave={() => setInteracting(false, 300)}
        onTouchStart={() => setInteracting(true)}
        onTouchEnd={() => {
          if (scrollContainerRef.current) {
            scrollPosRef.current = scrollContainerRef.current.scrollLeft;
          }
          setInteracting(false, 1500);
        }}
        onScroll={() => {
          if (isInteracting.current && scrollContainerRef.current) {
            scrollPosRef.current = scrollContainerRef.current.scrollLeft;
          }
        }}
        className="w-full overflow-x-auto scrollbar-none py-2 px-4 sm:px-6 cursor-grab active:cursor-grabbing select-none"
      >
        <div ref={trackRef} className="flex gap-4 sm:gap-6 w-max">
          {displayList.map((product, index) => {
            const isWishlisted = wishlist.includes(product.id);
            const isAdded = addedId === product.id;
            const compareAtPrice = product.price + 350;

            const primaryImg = product.images[0] || "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg";
            const secondaryImg = product.images[1] || primaryImg;

            return (
              <div
                key={`${product.id}-${index}`}
                className={`group min-w-[240px] sm:min-w-[280px] md:min-w-[300px] max-w-[300px] bg-white rounded-3xl border p-3 sm:p-3.5 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between shrink-0 ${
                  isAdded
                    ? "border-[#E10600] product-pick-pulse ring-2 ring-[#E10600]/30 shadow-lg"
                    : "border-[#EFEAE2] hover:border-[#E10600]/40"
                }`}
              >
                <div>
                  {/* Image Container with Pure-CSS Dual Image Swap on Hover (Zero flicker) */}
                  <Link
                    href={`/product/${product.slug}`}
                    className="block relative w-full aspect-square rounded-2xl overflow-hidden bg-[#FAF8F5] mb-3"
                  >
                    {/* Primary Image */}
                    <Image
                      src={buildCloudinaryUrl(primaryImg, { preset: "card" })}
                      alt={product.name}
                      fill
                      sizes="300px"
                      className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-105"
                    />

                    {/* Secondary Image Overlaid (smooth CSS fade with zero state re-renders) */}
                    {product.images[1] && (
                      <Image
                        src={buildCloudinaryUrl(secondaryImg, { preset: "card" })}
                        alt={`${product.name} alternate view`}
                        fill
                        sizes="300px"
                        className="object-contain p-2 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-out group-hover:scale-105"
                      />
                    )}

                    {/* Contextual Status Badge */}
                    <span className="absolute top-2.5 left-2.5 bg-[#E10600] text-white text-[9.5px] font-serif font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs z-10">
                      NEW
                    </span>

                    {/* Wishlist Heart Action */}
                    <button
                      onClick={(e) => toggleWishlist(product.id, e)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/95 backdrop-blur-xs text-[#888] hover:text-[#E10600] transition-colors shadow-2xs cursor-pointer z-10"
                      aria-label="Wishlist"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-colors ${
                          isWishlisted ? "fill-[#E10600] text-[#E10600]" : ""
                        }`}
                      />
                    </button>
                  </Link>

                  {/* Card Content */}
                  <div className="px-1">
                    <div className="flex items-center gap-1 text-[#E10600] text-[11px] mb-1">
                      <Star className="w-3 h-3 fill-[#E10600]" />
                      <Star className="w-3 h-3 fill-[#E10600]" />
                      <Star className="w-3 h-3 fill-[#E10600]" />
                      <Star className="w-3 h-3 fill-[#E10600]" />
                      <Star className="w-3 h-3 fill-[#E10600]" />
                      <span className="text-[10px] text-[#888] font-sans ml-1">5.0</span>
                    </div>

                    <span className="text-[9.5px] uppercase font-serif tracking-[0.16em] text-[#888] block mb-0.5">
                      {product.category}
                    </span>

                    <Link
                      href={`/product/${product.slug}`}
                      className="block font-serif text-sm font-semibold text-[#1E1E1E] group-hover:text-[#E10600] transition-colors line-clamp-1"
                    >
                      {product.name}
                    </Link>

                    <p className="text-[11px] text-[#666] line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Price & Quick Add Button */}
                <div className="pt-3 mt-3 border-t border-[#EFEAE2] flex items-center justify-between px-1">
                  <div>
                    <span className="text-sm font-serif font-bold text-[#E10600]">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-[10px] text-[#999] line-through ml-1.5 font-sans">
                      {formatPrice(compareAtPrice)}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleQuickAdd(product, e)}
                    className={`inline-flex items-center gap-1 text-[11px] font-serif uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      isAdded
                        ? "bg-[#059669] text-white"
                        : "bg-[#1E1E1E] hover:bg-[#E10600] text-white shadow-2xs"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <span>+ Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
