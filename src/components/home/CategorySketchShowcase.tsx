"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";

interface OccasionItem {
  id: string;
  occasion: string;
  title: string;
  subtitle: string;
  curation: string;
  href: string;
  image: string;
}

// 4 Curated Gifting Occasions with Circular Image Displays
const OCCASIONS: OccasionItem[] = [
  {
    id: "anniversary",
    occasion: "ANNIVERSARY",
    title: "Anniversary & Love",
    subtitle: "Eternal Crimson Roses",
    curation: "Forever blooms that never wilt",
    href: "/catalog?q=rose",
    image: "/images/products/rose-bouquet-1.jpg",
  },
  {
    id: "birthdays",
    occasion: "BIRTHDAYS",
    title: "Birthday Cheer",
    subtitle: "Golden Ribbon Sunflowers",
    curation: "Radiant warmth & everlasting joy",
    href: "/catalog?q=sunflower",
    image: "/images/products/midnight-box-1.jpg",
  },
  {
    id: "weddings",
    occasion: "WEDDINGS",
    title: "Weddings & Nuptials",
    subtitle: "Signature Keepsake Duets",
    curation: "Glitter luxury & bespoke presentation",
    href: "/catalog?category=Flower+Bouquet",
    image: "/images/products/glitter-rose-1.jpg",
  },
  {
    id: "hampers",
    occasion: "LUXURY HAMPERS",
    title: "Keepsake Gift Hampers",
    subtitle: "Grand Curated Trunks",
    curation: "Chocolates, fairy lights & satin ribbon",
    href: "/catalog?category=Gift+Hamper",
    image: "/images/products/hamper-1.jpg",
  },
];

export default function CategorySketchShowcase() {
  return (
    <section
      id="occasions"
      className="py-14 sm:py-20 bg-white border-b border-[#EFEAE2] overflow-hidden"
    >
      <div className="container-main px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] text-[10px] font-serif uppercase tracking-[0.22em] text-[#E10600] font-semibold shadow-2xs">
            <RibbonEmblem className="w-3.5 h-3.5 text-[#E10600]" />
            <span>Curated For Life&apos;s Celebrations</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] text-[#1E1E1E] font-normal tracking-[-0.01em]">
            SHOP BY OCCASION
          </h2>

          <p className="text-xs sm:text-sm font-sans text-[#666] leading-relaxed max-w-lg mx-auto">
            Discover bespoke handcrafted ribbon flowers and luxury keepsake hampers tailored for your most unforgettable milestones. Everlasting blooms that preserve memories forever.
          </p>
        </div>

        {/* 4 Circular Image Occasion Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 justify-items-center max-w-5xl mx-auto">
          {OCCASIONS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex flex-col items-center text-center w-full max-w-[220px] transition-all duration-300 hover:-translate-y-1.5"
            >
              {/* Circular Image Container with Overlapping Occasion Badge */}
              <div className="relative mb-3 flex flex-col items-center">
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-full overflow-hidden border-2 border-[#EFEAE2] group-hover:border-[#E10600] group-hover:shadow-[0_16px_36px_rgba(225,6,0,0.18)] transition-all duration-500 bg-[#FAF8F5]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 120px, (max-width: 1024px) 160px, 180px"
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Subtle inner ring overlay */}
                  <div className="absolute inset-0 rounded-full border border-black/5 pointer-events-none" />
                  {/* Soft luxury shadow gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Overlapping Occasion Badge */}
                <span className="absolute -bottom-2 bg-white border border-[#E8E2D8] group-hover:border-[#E10600] text-[#666] group-hover:text-[#E10600] text-[9px] sm:text-[10px] font-serif font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-2xs transition-colors whitespace-nowrap">
                  {item.occasion}
                </span>
              </div>

              {/* Typography Labels */}
              <div className="mt-2 space-y-0.5">
                <h3 className="font-serif text-sm sm:text-base lg:text-lg font-semibold text-[#1E1E1E] group-hover:text-[#E10600] transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-xs font-medium text-[#E10600] tracking-wide">
                  {item.subtitle}
                </p>
                <p className="text-[10px] sm:text-[11px] font-sans text-[#777] leading-tight line-clamp-1 pt-0.5">
                  {item.curation}
                </p>
              </div>

              {/* Micro Action link on hover */}
              <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-serif uppercase tracking-wider text-[#999] group-hover:text-[#E10600] opacity-80 group-hover:opacity-100 transition-all font-semibold">
                <span>Explore</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>

        {/* View All Occasion Hampers Link */}
        <div className="mt-12 sm:mt-16 text-center">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-xs font-serif uppercase tracking-[0.16em] text-[#1E1E1E] hover:text-[#E10600] font-semibold transition-colors group"
          >
            <span>Explore All Occasion Hampers & Keepsakes</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#E10600]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
