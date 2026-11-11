"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  ShoppingBag,
  Search,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1E1E1E] selection:bg-[#E10600]/15 selection:text-[#E10600]">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-6 text-center">
        <div className="max-w-md w-full mx-auto flex flex-col items-center space-y-3 sm:space-y-4 animate-in fade-in duration-300">
          
          {/* Authentic Playful 404 Cat & Unplugged Cord Artwork */}
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[16/9] flex items-center justify-center select-none">
            <Image
              src="/images/404-cat-illustration.jpg"
              alt="404 Not Found - Happiwrapz"
              fill
              priority
              sizes="(max-width: 640px) 280px, 320px"
              className="object-contain drop-shadow-2xs"
            />
          </div>

          {/* Heading & Artisanal Story */}
          <div className="space-y-1 max-w-sm mx-auto">
            <h1 className="font-serif text-xl sm:text-2xl text-[#1E1E1E] font-normal tracking-tight">
              This Ribbon Got <span className="italic text-[#E10600] font-light">Untangled.</span>
            </h1>

            <p className="text-xs text-[#666] leading-relaxed max-w-xs mx-auto font-sans">
              The creation you are looking for may have moved or rolled away with our studio kitten.
            </p>
          </div>

          {/* Primary Action Navigation Buttons - Directly Visible Above the Fold */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full pt-1">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#E10600] hover:bg-[#c00500] text-white text-xs font-serif font-semibold uppercase tracking-wider transition-all shadow-md shadow-[#E10600]/20 hover:shadow-lg hover:shadow-[#E10600]/30 cursor-pointer group"
            >
              <Home className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span>Return to Atelier Home</span>
            </Link>

            <Link
              href="/catalog"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#EFEAE2] text-[#1E1E1E] text-xs font-serif font-semibold uppercase tracking-wider transition-all shadow-2xs hover:border-[#1E1E1E]/20"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#E10600]" />
              <span>Explore Collection</span>
            </Link>
          </div>

          {/* Streamlined Compact Bouquet Search */}
          <form onSubmit={handleSearch} className="w-full max-w-xs mx-auto pt-0.5">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-[#888] absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bouquets, boxes..."
                className="w-full pl-8 pr-16 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-full text-xs text-[#1E1E1E] placeholder:text-[#999] focus:outline-hidden focus:border-[#E10600] focus:bg-white transition-all shadow-2xs"
              />
              <button
                type="submit"
                className="absolute right-1 px-3 py-1 bg-[#1E1E1E] hover:bg-[#E10600] text-white text-[11px] font-serif font-semibold rounded-full transition-colors cursor-pointer"
              >
                Find
              </button>
            </div>
          </form>

          {/* Direct Concierge Help */}
          <div className="pt-0.5">
            <a
              href="https://wa.me/917708354636?text=Hi%20Happiwrapz,%20I%20hit%20a%20missing%20page%20and%20need%20help%20with%20an%20order."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-[#666] hover:text-emerald-700 font-sans transition-colors group"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>Chat with Coimbatore Concierge on WhatsApp</span>
              <ArrowRight className="w-3 h-3 text-[#AAA] group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
