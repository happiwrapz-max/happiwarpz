"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BagDrawer from "@/components/bag/BagDrawer";
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

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1E1E1E] selection:bg-[#E10600]/15 selection:text-[#E10600] overflow-x-hidden">
      <Navbar />
      <BagDrawer />

      <main className="flex-1">
        {/* =========================================================================
            MOBILE HERO SECTION (Dedicated View for Mobile Screens < 768px)
            Featuring the new vertical roses & pearls image with crisp top text
            ========================================================================= */}
        {/* =========================================================================
            MOBILE HERO SECTION (Dedicated View for Mobile Screens < 768px)
            Featuring the vertical roses & pearls image as full-screen background
            with pure white top under the fixed transparent navbar
            ========================================================================= */}
        <section className="md:hidden relative w-full min-h-[100dvh] flex flex-col justify-between bg-white overflow-hidden border-b border-[#EFEAE2]">
          {/* Fullscreen Mobile Hero Background Image anchored to bottom */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <Image
              src="/images/hero-mobile.jpg"
              alt="Handcrafted satin ribbon flowers and luxury gift hampers"
              fill
              priority
              sizes="100vw"
              className="object-cover object-bottom"
            />
            {/* Subtle soft white gradient at very top to guarantee 100% navbar & text legibility */}
            <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white via-white/85 to-transparent pointer-events-none" />
          </div>

          {/* Top Text Content Frame (Left-aligned in the pure white canvas area) */}
          <div className="relative z-10 pt-20 px-4 sm:px-6 space-y-3.5 max-w-sm">
            {/* Headline - strictly left aligned */}
            <h1 className="font-serif font-normal text-[38px] leading-[1.02] tracking-[-0.01em] text-[#1E1E1E]">
              The Moments{" "}
              <span className="italic text-[#E10600] font-light block">
                Deserve Flowers.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs font-sans text-[#5A5A5A] leading-relaxed max-w-[280px]">
              Handcrafted satin ribbon roses, golden sunflowers, and forever keepsake gift hampers.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <Link
                href="/catalog"
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#E10600] hover:bg-[#C20500] text-white py-3 rounded-full text-xs font-serif font-semibold uppercase tracking-[0.14em] shadow-[0_4px_16px_rgba(225,6,0,0.3)] transition-all"
              >
                <span>Shop Bouquets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={openDrawer}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white/95 hover:bg-white text-[#1E1E1E] border border-[#EFEAE2] py-3 rounded-full text-xs font-serif font-medium uppercase tracking-[0.12em] shadow-xs transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#E10600]" />
                <span>Order Process</span>
              </button>
            </div>

            {/* Quick Micro Trust Chips */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#666] pt-1">
              <span className="text-[#059669] font-medium">✓ 100% Handcrafted Ribbon</span>
              <span>•</span>
              <span className="text-[#059669] font-medium">✓ Never Wilts</span>
              <span>•</span>
              <span className="text-[#059669] font-medium">✓ WhatsApp Direct</span>
            </div>
          </div>

          {/* Bottom frame spacer to ensure roses and pearls remain visible and undisturbed */}
          <div className="relative z-10 h-44 sm:h-52 pointer-events-none" />
        </section>

        {/* =========================================================================
            DESKTOP & LAPTOP HERO SECTION (Screens >= 768px)
            Unblurred, unzoomed actual image with left-aligned typography
            ========================================================================= */}
        <section className="hidden md:flex relative w-full min-h-[90vh] lg:h-screen items-center bg-white overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-16 lg:py-0 border-b border-[#EFEAE2]">
          {/* Desktop Hero Image: Natural scale, unblurred, anchored right */}
          <div className="absolute inset-y-0 right-0 w-full lg:w-[62%] xl:w-[58%] pointer-events-none">
            <Image
              src="/images/hero-desktop.jpg"
              alt="Handcrafted satin ribbon flower and luxury gifts"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-contain lg:object-cover object-right"
            />
          </div>

          {/* Left-Aligned Text Content Frame */}
          <div className="container-main relative z-10 w-full px-4 sm:px-6">
            <div className="max-w-xl lg:max-w-2xl text-left space-y-6">
              {/* Main Headline */}
              <h1 className="font-serif font-normal text-5xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[84px] leading-[1.02] tracking-[-0.01em] text-[#1E1E1E]">
                The Moments{" "}
                <span className="italic text-[#E10600] block sm:inline font-light">
                  Deserve Flowers.
                </span>
              </h1>

              {/* Editorial Subtitle */}
              <p className="text-sm sm:text-base font-sans text-[#5A5A5A] leading-relaxed max-w-lg">
                Handcrafted satin ribbon roses & golden sunflowers that never wilt, luxury wrap, and bespoke gift hampers in Bangalore.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center gap-3 bg-[#E10600] hover:bg-[#C20500] text-white px-8 py-4 rounded-full text-xs font-serif font-semibold uppercase tracking-[0.16em] shadow-[0_6px_22px_rgba(225,6,0,0.3)] hover:shadow-[0_10px_30px_rgba(225,6,0,0.4)] transition-all duration-300"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={openDrawer}
                  className="inline-flex items-center justify-center gap-2 bg-[#FAF8F5] hover:bg-[#F2ECE4] text-[#1E1E1E] border border-[#EFEAE2] px-7 py-4 rounded-full text-xs font-serif font-medium uppercase tracking-[0.14em] transition-all cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#E10600]" />
                  <span>Order Procedure</span>
                </button>
              </div>

              {/* Trust Badges Bar */}
              <div className="pt-6 border-t border-[#EFEAE2] flex flex-wrap items-center gap-6 text-xs text-[#666]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E10600]" />
                  <span>100% Handcrafted Ribbon Flowers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E10600]" />
                  <span>Zero Online Payment Upfront</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E10600]" />
                  <span>WhatsApp Concierge Direct</span>
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
        <NewArrivals products={CATALOG} />



        {/* =========================================================================
            ABOUT ATELIER SECTION (Philosophy, Provenance Pillars & Concierge Story)
            ========================================================================= */}
        <AboutSection />

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
