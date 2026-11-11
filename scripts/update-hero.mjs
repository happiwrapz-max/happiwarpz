import fs from "fs";
import path from "path";

const pagePath = path.resolve("./src/app/page.tsx");
let content = fs.readFileSync(pagePath, "utf8");

// Define the new luxury hero section
const newHeroSections = `        {/* =========================================================================
            MOBILE HERO SECTION (Dedicated Fullscreen View for Mobile Screens < 768px)
            Featuring the luxury vertical roses, dew drops & pearls portrait artwork
            ========================================================================= */}
        <section className="md:hidden relative w-full min-h-[100dvh] flex flex-col justify-between bg-white overflow-hidden border-b border-[#EFEAE2]">
          {/* Fullscreen Mobile Hero Background Image anchored naturally to bottom */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <Image
              src="https://res.cloudinary.com/w8fw2mbb/image/upload/v1793882678/happiwrapz/assets/hero-mobile-luxury.jpg"
              alt="Handcrafted satin ribbon roses, water droplets and luxury pearls"
              fill
              priority
              sizes="100vw"
              className="object-cover object-bottom"
            />
            {/* Soft white gradient at top to guarantee 100% legibility */}
            <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white via-white/85 to-transparent pointer-events-none" />
          </div>

          {/* Top Text Content Frame (Clean luxury layout on pure white canvas) */}
          <div className="relative z-10 pt-20 px-5 space-y-3.5 max-w-sm">
            {/* Eyebrow Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#722F37]/5 border border-[#722F37]/15 text-[10px] font-serif uppercase tracking-[0.18em] text-[#722F37]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] animate-pulse" />
              <span>Coimbatore Bespoke Atelier</span>
            </div>

            {/* Headline */}
            <h1 className="font-serif font-normal text-[38px] leading-[1.02] tracking-[-0.01em] text-[#1A1A1A]">
              The Moments{" "}
              <span className="italic text-[#E10600] font-light block">
                Deserve Flowers.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs font-sans text-[#5A5A5A] leading-relaxed max-w-[280px]">
              Handcrafted satin ribbon roses, golden sunflowers that never wilt, and signature European hand-tied wraps in Coimbatore with zero upfront payment.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-1">
              <Link
                href="/catalog"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#E10600] hover:bg-[#C20500] text-white py-3.5 rounded-full text-xs font-serif font-semibold uppercase tracking-[0.14em] shadow-[0_6px_20px_rgba(225,6,0,0.32)] transition-all"
              >
                <span>Shop Bouquets</span>
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
              src="https://res.cloudinary.com/w8fw2mbb/image/upload/v1793882676/happiwrapz/assets/hero-desktop-luxury.jpg"
              alt="Handcrafted satin ribbon luxury flowers, water drops and pearls"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 68vw"
              className="object-contain lg:object-cover object-right-bottom"
            />
            {/* Subtle soft white blend gradient on the left edge */}
            <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-white via-white/40 to-transparent pointer-events-none" />
          </div>

          {/* Left-Aligned Text Content Frame */}
          <div className="container-main relative z-10 w-full px-6 lg:px-12">
            <div className="max-w-xl lg:max-w-2xl text-left space-y-6">
              {/* Eyebrow Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#722F37]/5 border border-[#722F37]/15 text-[11px] font-serif uppercase tracking-[0.2em] text-[#722F37]">
                <span className="w-2 h-2 rounded-full bg-[#E10600] animate-pulse" />
                <span>Coimbatore Bespoke Ribbon Atelier • Zero Upfront Payment</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif font-normal text-5xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[86px] leading-[1.0] tracking-[-0.02em] text-[#1A1A1A]">
                The Moments{" "}
                <span className="italic text-[#E10600] block sm:inline font-light">
                  Deserve Flowers.
                </span>
              </h1>

              {/* Editorial Subtitle */}
              <p className="text-sm sm:text-base font-sans text-[#5A5A5A] leading-relaxed max-w-lg">
                Handcrafted satin ribbon roses, golden sunflowers that never wilt, and signature European hand-tied wraps in Coimbatore with zero upfront payment.
              </p>

              {/* Action Buttons: Button-in-Button Trailing Icon Architecture */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/catalog"
                  className="group inline-flex items-center gap-4 bg-[#E10600] hover:bg-[#C20500] text-white pl-8 pr-3 py-3.5 rounded-full text-xs font-serif font-semibold uppercase tracking-[0.16em] shadow-[0_8px_25px_rgba(225,6,0,0.35)] hover:shadow-[0_12px_32px_rgba(225,6,0,0.45)] transition-all duration-300"
                >
                  <span>Explore Collection</span>
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
        </section>`;

// Replace from '<main className="flex-1">' up to the category strip
const startMarker = '<main className="flex-1">';
const endMarker = '{/* =========================================================================\n            MOBILE QUICK CATEGORY STRIP';
const altEndMarker = '{/* =========================================================================\r\n            MOBILE QUICK CATEGORY STRIP';

let actualEndMarker = endMarker;
if (!content.includes(endMarker) && content.includes(altEndMarker)) {
  actualEndMarker = altEndMarker;
}

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(actualEndMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.slice(0, startIndex + startMarker.length) + "\n" + newHeroSections + "\n\n        " + content.slice(endIndex);
  fs.writeFileSync(pagePath, newContent, "utf8");
  console.log("✔ Successfully updated page.tsx hero section!");
} else {
  console.error("Marker not found! Start:", startIndex, "End:", endIndex);
}

