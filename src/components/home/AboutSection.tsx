"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buildCloudinaryUrl } from "@/lib/cloudinary";

export default function AboutSection({ imageSrc }: { imageSrc?: string }) {
  return (
    <section id="about" className="py-16 sm:py-24 bg-white border-b border-[#EFEAE2] overflow-hidden">
      <div className="container-main px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Visual Frame: Clean editorial photography without distracting overlays */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden border border-[#EFEAE2] shadow-xs bg-[#FAF8F5]">
              <Image
                src={buildCloudinaryUrl(
                  imageSrc || "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881719/happiwrapz/assets/collection-hero.jpg",
                  { preset: "detail" }
                )}
                alt="Happiwrapz Floral Studio in Coimbatore, Tamil Nadu, India"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* Editorial Content: Pure, refined typography & purposeful craft pillars */}
          <div className="lg:col-span-7 space-y-6 lg:pl-4">
            <div className="space-y-3">
              <span className="text-[11px] font-serif font-semibold tracking-[0.25em] text-[#E10600] uppercase block">
                ABOUT HAPPIWRAPZ
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1E1E1E] font-normal leading-tight tracking-[-0.01em]">
                Ribbon Flowers Crafted With <span className="italic text-[#E10600] font-light">Devotion.</span>
              </h2>

              <p className="text-sm font-sans text-[#5A5A5A] leading-relaxed max-w-xl pt-1">
                Happiwrapz crafts everlasting floral gifts that never wilt. Every satin ribbon rose and golden sunflower is meticulously hand-folded, shaped, and petal-sculpted using premium double-faced satin ribbons. Unlike real flowers that fade in days, our ribbon flower creations remain vibrant forever as cherished keepsakes.
              </p>
            </div>

            {/* 3 Clean Provenance Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3 border-t border-[#EFEAE2]">
              <div className="space-y-1">
                <span className="text-xs font-serif font-semibold text-[#1E1E1E] tracking-wide block">
                  Hand-Folded Satin
                </span>
                <p className="text-xs text-[#777] leading-relaxed font-sans">
                  Artisan ribbon petals sculpted petal-by-petal for everlasting elegance.
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-serif font-semibold text-[#1E1E1E] tracking-wide block">
                  Forever Keepsake
                </span>
                <p className="text-xs text-[#777] leading-relaxed font-sans">
                  Zero water, wilting, or maintenance — stays pristine year after year.
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-serif font-semibold text-[#1E1E1E] tracking-wide block">
                  Personal Care
                </span>
                <p className="text-xs text-[#777] leading-relaxed font-sans">
                  Direct coordination on WhatsApp with custom ribbons and zero online payment.
                </p>
              </div>
            </div>

            {/* Clean Understated Link */}
            <div className="pt-2">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 text-xs font-serif uppercase tracking-[0.16em] text-[#1E1E1E] hover:text-[#E10600] font-semibold transition-colors group"
              >
                <span>Explore The Ribbon Flower Collection</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#E10600]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
