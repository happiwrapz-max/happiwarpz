"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { CATALOG } from "@/lib/data/catalog";
import { useBagStore } from "@/lib/store/useBagStore";
import AccordionApp, { AccordionItemData } from "@/components/watermelon/card-split-accordian";
import NewArrivals from "@/components/home/NewArrivals";
import AboutSection from "@/components/home/AboutSection";
import CategorySketchShowcase from "@/components/home/CategorySketchShowcase";
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  Heart,
  Flower2,
  MapPin,
  Star,
  Calendar,
  Gift,
  CheckCircle2,
  ShoppingBag,
  Check,
  ChevronRight
} from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";
import { buildCloudinaryUrl } from "@/lib/cloudinary";





interface ContentSettings {
  announcement?: string;
  announcementActive?: boolean;
  announcementLink?: string;
  heroHeading?: string;
  heroSubheading?: string;
  heroButtonText?: string;
  heroButtonLink?: string;
  heroDesktopImage?: string;
  heroMobileImage?: string;
  aboutImage?: string;
}

const FAQ_ITEMS: AccordionItemData[] = [
  {
    id: 1,
    title: "How does the zero online payment order procedure work?",
    icon: <ShieldCheck className="w-5 h-5 text-[#E10600]" />,
    content:
      "At Happiwrapz, every ribbon flower bouquet and gift is handcrafted with bespoke care. When you select an arrangement and submit your order request with your delivery date and time slot, zero online payment is charged. The store owner personally reviews flower colors, confirms availability, and coordinates directly with you on WhatsApp.",
  },
  {
    id: 2,
    title: "Can I choose specific delivery slots like Morning or Evening?",
    icon: <Clock className="w-5 h-5 text-[#E10600]" />,
    content:
      "Yes! Our interactive cart order procedure allows you to select your preferred day on a visual calendar and pick your exact delivery window: Morning (9:00 AM - 11:00 AM), Afternoon (12:00 PM - 2:00 PM), or Evening (3:00 PM - 6:00 PM).",
  },
  {
    id: 3,
    title: "Can I add complimentary handwritten greeting cards or chocolates?",
    icon: <Gift className="w-5 h-5 text-[#E10600]" />,
    content:
      "Absolutely. In the cart drawer order procedure, you can select add-on extras including custom handwritten greeting cards, luxury Belgian chocolates, sparkling celebration cider, and complimentary SMS delivery updates.",
  },
  {
    id: 4,
    title: "How do I track my order request in real-time?",
    icon: <RibbonEmblem className="w-5 h-5 text-[#E10600]" />,
    content:
      "Every order generates a unique reference code (such as HW-A3K7P9). You can track each stage—from Request Received to Bloom Selection, Hand-Wrapping, and Out for Delivery—using our Track Order page.",
  },
];

export default function HomePage() {
  const openDrawer = useBagStore((s) => s.openDrawer);
  const [products, setProducts] = useState(CATALOG);
  const [content, setContent] = useState<ContentSettings>({
    announcement: "🎀 Handcrafted with love — Order requests open for Coimbatore & pan-India delivery",
    announcementActive: true,
    announcementLink: "/catalog",
    heroHeading: "The Moments Deserve Flowers.",
    heroSubheading:
      "Handcrafted satin ribbon roses, golden sunflowers that never wilt, and signature European hand-tied wraps in Coimbatore with zero upfront payment.",
    heroButtonText: "Explore Collection",
    heroButtonLink: "/catalog",
    heroDesktopImage:
      "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793977633/happiwrapz/products/yajzmq3oy9mbcvb8muqj.jpg",
    heroMobileImage:
      "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793882678/happiwrapz/assets/hero-mobile-luxury.jpg",
    aboutImage:
      "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg",
  });

  useEffect(() => {
    fetch("/api/content?t=" + Date.now(), { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setContent((prev) => ({ ...prev, ...data.settings }));
        }
      })
      .catch((err) => console.error("Error fetching storefront content:", err));

    fetch("/api/products?t=" + Date.now(), { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.error("Error fetching live products for homepage:", err));
  }, []);

  const renderHeading = (heading: string, isMobile = false) => {
    const parts = (heading || "The Moments Deserve Flowers.").trim().split(" ");
    if (parts.length <= 2) {
      return (
        <>
          {parts[0]}{" "}
          <span
            className={`italic text-[#E10600] font-light ${
              isMobile ? "block" : "sm:inline"
            }`}
          >
            {parts.slice(1).join(" ")}
          </span>
        </>
      );
    }
    const splitIndex = Math.max(1, parts.length - 2);
    const firstPart = parts.slice(0, splitIndex).join(" ");
    const secondPart = parts.slice(splitIndex).join(" ");
    return (
      <>
        {firstPart}{" "}
        <span
          className={`italic text-[#E10600] font-light ${
            isMobile ? "block" : "sm:inline"
          }`}
        >
          {secondPart}
        </span>
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1E1E1E] selection:bg-[#E10600]/15 selection:text-[#E10600] overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        {/* Top Atelier Announcement Ribbon if active */}
        {content.announcementActive && content.announcement && (
          <div className="bg-[#1A1A1A] text-[#FAF8F5] text-[11px] sm:text-xs py-2 px-4 text-center tracking-wider font-sans flex items-center justify-center gap-2 border-b border-black/20">
            <span>{content.announcement}</span>
            {content.announcementLink && (
              <Link
                href={content.announcementLink}
                className="underline text-[#FFE082] hover:text-white font-medium ml-1 transition-colors"
              >
                Learn more →
              </Link>
            )}
          </div>
        )}

        {/* =========================================================================
            MOBILE HERO SECTION (Dedicated Fullscreen View for Mobile Screens < 768px)
            Featuring the luxury vertical roses, dew drops & pearls portrait artwork
            ========================================================================= */}
        <section className="md:hidden relative w-full min-h-[100dvh] flex flex-col justify-between bg-white overflow-hidden border-b border-[#EFEAE2]">
          {/* Fullscreen Mobile Hero Background Image anchored naturally to bottom */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <Image
              src={buildCloudinaryUrl(
                content.heroMobileImage ||
                "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793882678/happiwrapz/assets/hero-mobile-luxury.jpg",
                { preset: "hero-mobile" }
              )}
              alt="Handcrafted satin ribbon roses, water droplets and luxury pearls"
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover object-bottom"
            />
            {/* Soft white gradient at top to guarantee 100% legibility */}
            <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white via-white/85 to-transparent pointer-events-none" />
          </div>

          {/* Top Text Content Frame (Clean luxury layout on pure white canvas) */}
          <div className="relative z-10 pt-24 px-5 space-y-3.5 max-w-sm">
            {/* Headline */}
            <h1 className="font-serif font-normal text-[38px] leading-[1.02] tracking-[-0.01em] text-[#1A1A1A]">
              {renderHeading(content.heroHeading || "The Moments Deserve Flowers.", true)}
            </h1>

            {/* Subtitle */}
            <p className="text-xs font-sans text-[#5A5A5A] leading-relaxed max-w-[280px]">
              {content.heroSubheading ||
                "Handcrafted satin ribbon roses, golden sunflowers that never wilt, and signature European hand-tied wraps in Coimbatore with zero upfront payment."}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <Link
                href={content.heroButtonLink || "/catalog"}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#E10600] hover:bg-[#C20500] text-white py-3.5 rounded-full text-xs font-serif font-semibold uppercase tracking-[0.14em] shadow-[0_6px_20px_rgba(225,6,0,0.32)] transition-all"
              >
                <span>{content.heroButtonText || "Shop Bouquets"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={openDrawer}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white/95 hover:bg-white text-[#1A1A1A] border border-[#EFEAE2] py-3.5 rounded-full text-xs font-serif font-medium uppercase tracking-[0.12em] shadow-xs transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#E10600]" />
                <span>Order Process</span>
              </button>
            </div>

            {/* Micro Trust Chips */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#666] pt-1">
              <span className="text-[#059669] font-medium">✓ 100% Handcrafted</span>
              <span>•</span>
              <span className="text-[#059669] font-medium">✓ Zero Upfront Payment</span>
              <span>•</span>
              <span className="text-[#059669] font-medium">✓ WhatsApp Direct</span>
            </div>
          </div>

          {/* Bottom spacer ensuring roses and pearls are never blocked */}
          <div className="relative z-10 h-52 sm:h-64 pointer-events-none" />
        </section>

        {/* =========================================================================
            DESKTOP HERO SECTION (Screens >= 768px)
            Full screen luxury layout with pure white seamless canvas & velvet roses
            ========================================================================= */}
        <section className="hidden md:flex relative w-full min-h-[100dvh] lg:h-screen items-center bg-white overflow-hidden pt-20 border-b border-[#EFEAE2]">
          {/* Desktop Hero Image: Natural scale, unblurred, anchored right with zero seam */}
          <div className="absolute inset-y-0 right-0 w-full md:w-[60%] lg:w-[64%] xl:w-[68%] h-full pointer-events-none select-none z-0">
            <Image
              src={buildCloudinaryUrl(
                content.heroDesktopImage ||
                "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793977633/happiwrapz/products/yajzmq3oy9mbcvb8muqj.jpg",
                { preset: "hero-desktop" }
              )}
              alt="Handcrafted satin ribbon luxury flowers, water drops and pearls"
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-contain lg:object-cover object-right-bottom"
            />
            {/* Subtle soft white blend gradient on the left edge */}
            <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-white via-white/40 to-transparent pointer-events-none" />
          </div>

          {/* Left-Aligned Text Content Frame */}
          <div className="container-main relative z-10 w-full px-6 lg:px-12">
            <div className="max-w-xl lg:max-w-2xl text-left space-y-6">
              {/* Main Headline */}
              <h1 className="font-serif font-normal text-5xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[86px] leading-[1.0] tracking-[-0.02em] text-[#1A1A1A]">
                {renderHeading(content.heroHeading || "The Moments Deserve Flowers.")}
              </h1>

              {/* Editorial Subtitle */}
              <p className="text-sm sm:text-base font-sans text-[#5A5A5A] leading-relaxed max-w-lg">
                {content.heroSubheading ||
                  "Handcrafted satin ribbon roses, golden sunflowers that never wilt, and signature European hand-tied wraps in Coimbatore with zero upfront payment."}
              </p>

              {/* Action Buttons: Button-in-Button Trailing Icon Architecture */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href={content.heroButtonLink || "/catalog"}
                  className="group inline-flex items-center gap-4 bg-[#E10600] hover:bg-[#C20500] text-white pl-8 pr-3 py-3.5 rounded-full text-xs font-serif font-semibold uppercase tracking-[0.16em] shadow-[0_8px_25px_rgba(225,6,0,0.35)] hover:shadow-[0_12px_32px_rgba(225,6,0,0.45)] transition-all duration-300"
                >
                  <span>{content.heroButtonText || "Explore Collection"}</span>
                  <span className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-white group-hover:text-[#E10600] text-white flex items-center justify-center transition-all duration-300">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>

                <button
                  onClick={openDrawer}
                  className="inline-flex items-center justify-center gap-2.5 bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#1A1A1A] border border-[#EFEAE2] px-7 py-4 rounded-full text-xs font-serif font-medium uppercase tracking-[0.14em] transition-all cursor-pointer shadow-xs"
                >
                  <Calendar className="w-4 h-4 text-[#E10600]" />
                  <span>Order Procedure</span>
                </button>
              </div>

              {/* Trust Badges Bar */}
              <div className="pt-6 border-t border-[#EFEAE2] flex flex-wrap items-center gap-6 text-xs text-[#666]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                  <span className="font-medium text-[#1A1A1A]">100% Handcrafted Ribbon Flowers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                  <span className="font-medium text-[#1A1A1A]">Zero Online Payment Upfront</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                  <span className="font-medium text-[#1A1A1A]">WhatsApp Concierge Direct</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            MOBILE QUICK CATEGORY STRIP (Exclusive App-like Touch Experience)
            ========================================================================= */}
        <section className="md:hidden py-3 px-4 bg-white border-b border-[#EFEAE2] overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2.5 w-max">
            {[
              { label: "Ribbon Roses", icon: "🌹", href: "/catalog?category=Flower+Bouquet" },
              { label: "Ribbon Sunflowers", icon: "🌻", href: "/catalog?category=Flower+Bouquet" },
              { label: "Gift Boxes", icon: "📦", href: "/catalog?category=Gift+Box" },
              { label: "Luxury Hampers", icon: "🎁", href: "/catalog?category=Gift+Hamper" },
              { label: "Artisanal Wraps", icon: "🎀", href: "/catalog?category=Gift+Wrap" },
              { label: "Custom Studio", icon: "🎗️", href: "/catalog?category=Custom+Order" },
            ].map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] text-xs font-serif font-semibold text-[#1E1E1E] hover:text-[#E10600] hover:border-[#E10600]/40 transition-all shrink-0 active:scale-95 shadow-2xs"
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* =========================================================================
            CATEGORY SKETCH SHOWCASE (Under Hero - Fine-line Botanical Discs)
            ========================================================================= */}
        <CategorySketchShowcase />

        {/* =========================================================================
            NEW ARRIVALS SECTION (Infinite Auto-Scrolling Carousel & Quick Discovery)
            ========================================================================= */}
        <NewArrivals products={products} />



        {/* =========================================================================
            ABOUT SECTION (Philosophy, Provenance Pillars & Concierge Story)
            ========================================================================= */}
        <AboutSection imageSrc={content.aboutImage} />

        {/* =========================================================================
            FAQ ACCORDION SECTION
            ========================================================================= */}
        <section id="faq" className="py-12 sm:py-24 bg-[#FAF8F5]">
          <div className="container-main max-w-4xl px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <span className="text-[10px] sm:text-[11px] font-serif font-semibold tracking-[0.25em] text-[#E10600] uppercase block mb-1">
                TRANSPARENCY & ASSURANCE
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl text-[#1E1E1E] font-normal">
                Frequently Asked Questions
              </h2>
            </div>

            <AccordionApp items={FAQ_ITEMS} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
