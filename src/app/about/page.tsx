import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShieldCheck, Flower2, ArrowRight } from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-[#1E1E1E]">
      <Navbar />

      <main className="container-main max-w-5xl pt-28 pb-20 sm:pt-36 sm:pb-28 px-4 sm:px-6">
        {/* Hero */}
        <div className="text-center mb-14 sm:mb-20">
          <span className="text-[11px] font-serif font-semibold tracking-[0.25em] text-[#E10600] uppercase block mb-2">
            OUR ATELIER HERITAGE
          </span>
          <h1 className="font-serif text-3xl sm:text-6xl text-[#1E1E1E] font-normal leading-tight">
            Artisanal Ribbon Flowers <br />
            <span className="italic font-light text-[#E10600]">Crafted to Bloom Forever</span>
          </h1>
          <p className="text-xs sm:text-sm font-sans text-[#666] mt-4 max-w-2xl mx-auto leading-relaxed">
            Happiwrapz was founded on a simple revelation: flowers are the world's purest language of emotion, yet fresh stems wither within days. We handcraft exquisite satin ribbon roses and golden sunflowers that preserve your most cherished memories for a lifetime.
          </p>
        </div>

        {/* Narrative Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-16 sm:mb-24">
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden border border-[#EFEAE2] shadow-md bg-[#FAF8F5]">
            <Image
              src="/images/products/rose-bouquet-1.jpg"
              alt="Handcrafted Satin Ribbon Roses"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-serif font-semibold tracking-[0.2em] text-[#E10600] uppercase block">
              THE ART OF RIBBON FLORISTRY
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1E1E1E]">
              Every Petal Folded by Hand
            </h2>
            <p className="text-xs sm:text-sm text-[#555] leading-relaxed">
              In our Bangalore atelier, master artisans sculpt premium double-faced satin ribbons into true-to-nature botanical blooms. Each crimson rose demands over 25 precision folds; each radiant golden sunflower combines layered velvety petals with textured center stippling.
            </p>
            <p className="text-xs sm:text-sm text-[#555] leading-relaxed">
              No artificial plastics or disposable stems are used. Instead, our keepsakes are finished with luxury matte European wraps, soft tissue flourishes, and handwritten calligraphy tags.
            </p>
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 sm:mb-24">
          <div className="p-8 bg-[#FAF8F5] rounded-3xl border border-[#EFEAE2] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#E10600]/10 text-[#E10600] flex items-center justify-center mx-auto">
              <Flower2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-[#1E1E1E] font-medium">Never Wilts or Fades</h3>
            <p className="text-xs text-[#666] leading-relaxed">
              Ribbon flowers require zero water, sunlight, or maintenance. They remain as radiant on your 10th anniversary as on day one.
            </p>
          </div>

          <div className="p-8 bg-[#FAF8F5] rounded-3xl border border-[#EFEAE2] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#E10600]/10 text-[#E10600] flex items-center justify-center mx-auto">
              <RibbonEmblem className="w-6 h-6 text-[#E10600]" />
            </div>
            <h3 className="font-serif text-lg text-[#1E1E1E] font-medium">Glitter Luxury Editions</h3>
            <p className="text-xs text-[#666] leading-relaxed">
              Subtle hand-dusted diamond glitter accents shimmer delicately under evening candlelight, elevating every romantic gesture.
            </p>
          </div>

          <div className="p-8 bg-[#FAF8F5] rounded-3xl border border-[#EFEAE2] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#E10600]/10 text-[#E10600] flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-[#1E1E1E] font-medium">Zero Online Charges</h3>
            <p className="text-xs text-[#666] leading-relaxed">
              Our direct WhatsApp concierge verifies your bouquet, timing, and address before any delivery, ensuring total peace of mind.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bg-[#1E1E1E] text-white rounded-3xl p-8 sm:p-14 text-center space-y-6">
          <h2 className="font-serif text-2xl sm:text-4xl font-normal">
            Ready to Celebrate with Forever Blooms?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto">
            Explore our curated catalog of handcrafted ribbon rose bouquets, sun & rose signature duets, and bespoke keepsake hampers.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/catalog"
              className="px-8 py-3.5 bg-[#E10600] hover:bg-[#C20500] text-white rounded-full text-xs font-serif uppercase tracking-wider font-semibold transition-all duration-300 shadow-md inline-flex items-center gap-2"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-serif uppercase tracking-wider font-semibold transition-all duration-300"
            >
              Contact Concierge
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
