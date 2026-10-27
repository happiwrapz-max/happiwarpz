"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingBag,
  User,
  X,
  Menu,
  ArrowRight,
  Calendar,
  ShieldCheck,
  MessageSquare,
  Flower2
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useBagStore } from "@/lib/store/useBagStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Link000 } from "@/components/ui/skiper-ui/skiper40";
import { searchProducts, POPULAR_SEARCH_TERMS } from "@/lib/search";
import { formatPrice } from "@/lib/utils";

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalItems = useBagStore((s) => s.totalItems);
  const openDrawer = useBagStore((s) => s.openDrawer);
  const { user, isAuthenticated } = useAuthStore();
  const itemCount = totalItems();

  const liveSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchProducts(searchQuery).slice(0, 4);
  }, [searchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const query = overrideQuery !== undefined ? overrideQuery : searchQuery;
    if (query.trim()) {
      setMobileMenuOpen(false);
      setSearchOpen(false);
      window.location.href = `/catalog?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-[#EFEAE2] shadow-[0_4px_20px_rgba(0,0,0,0.04)] pointer-events-auto py-0"
            : "bg-white/80 md:bg-transparent backdrop-blur-xs pointer-events-none"
        }`}
      >
        <div className={`container-main px-4 sm:px-6 transition-all duration-300 flex items-center justify-between pointer-events-auto ${
          scrolled ? "py-3 sm:py-3.5" : "py-3.5 sm:py-5"
        }`}>
          {/* Left: Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-1.5 sm:gap-2 text-[15px] sm:text-lg md:text-xl font-serif tracking-[0.14em] sm:tracking-[0.2em] text-[#1E1E1E] hover:text-[#E10600] transition-colors shrink-0"
          >
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#E10600] group-hover:scale-125 transition-transform duration-300 shadow-[0_0_8px_rgba(225,6,0,0.5)]" />
            <span className="font-bold uppercase tracking-[0.14em]">HAPPIWRAPZ</span>
          </Link>

          {/* Desktop Center: ONLY Home and Collection (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-10 font-serif">
            <Link000
              href="/"
              className="text-xs md:text-[13px] tracking-[0.16em] uppercase text-[#1E1E1E] font-semibold hover:text-[#E10600] transition-colors py-1"
            >
              Home
            </Link000>
            <Link000
              href="/catalog"
              className="text-xs md:text-[13px] tracking-[0.16em] uppercase text-[#1E1E1E] font-semibold hover:text-[#E10600] transition-colors py-1"
            >
              Collection
            </Link000>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Desktop Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="hidden md:flex p-2 sm:p-2.5 text-[#1E1E1E] hover:text-[#E10600] hover:bg-black/5 rounded-full transition-all duration-200 cursor-pointer"
              aria-label="Search"
            >
              {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>

            {/* Desktop User Account */}
            <Link
              href={
                isAuthenticated
                  ? user?.role === "customer"
                    ? "/dashboard"
                    : "/admin"
                  : "/login"
              }
              className="hidden md:flex p-2 sm:p-2.5 text-[#1E1E1E] hover:text-[#E10600] hover:bg-black/5 rounded-full transition-all duration-200"
              aria-label={isAuthenticated ? "Account" : "Sign in"}
            >
              <User className="w-4 h-4" />
            </Link>

            {/* Shopping Bag Trigger -> Opens In-Place Cart Drawer (Visible on all screens) */}
            <button
              onClick={openDrawer}
              className="relative p-2 sm:p-2.5 text-[#1E1E1E] hover:text-[#E10600] hover:bg-black/5 rounded-full transition-all duration-200 cursor-pointer"
              aria-label={`Shopping bag${itemCount > 0 ? `, ${itemCount} items` : ""}`}
            >
              <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] flex items-center justify-center bg-[#E10600] text-white text-[8.5px] sm:text-[9px] font-bold rounded-full shadow-[0_2px_8px_rgba(225,6,0,0.35)]">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Three-Bar Hamburger Menu Button (Visible ONLY on Mobile < 768px) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[#1E1E1E] hover:text-[#E10600] hover:bg-black/5 rounded-full transition-all duration-200 cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Desktop Expandable Search Input with Live Autocomplete */}
        {searchOpen && (
          <div className="hidden md:block pointer-events-auto container-main px-4 pb-3">
            <div className="relative max-w-lg mx-auto">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search handcrafted bouquets, hampers, roses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchSubmit();
                  }}
                  className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white/95 backdrop-blur-md border border-[#E5E0D8] rounded-full text-[#1E1E1E] shadow-xl focus:outline-hidden focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600] transition-all"
                />
                <Search className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#1E1E1E] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Floating Instant Results Dropdown */}
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-[#EFEAE2] p-3 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                {liveSearchResults.length > 0 ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-2 py-1 text-[11px] font-serif uppercase tracking-wider text-[#888] border-b border-[#EFEAE2] pb-1.5 mb-1">
                      <span>Matching Creations</span>
                      <span>Press Enter to search all</span>
                    </div>
                    {liveSearchResults.map(({ product }) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FAF8F5] transition-colors group"
                      >
                        <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-[#FAF8F5] border border-[#EFEAE2] shrink-0">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="44px"
                            className="object-contain p-1 group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-serif font-semibold text-[#1E1E1E] group-hover:text-[#E10600] transition-colors truncate">
                            {product.name}
                          </h4>
                          <span className="text-[10px] text-[#888] block truncate">
                            {product.category}
                          </span>
                        </div>
                        <span className="text-xs font-serif font-bold text-[#E10600] shrink-0">
                          {formatPrice(product.price)}
                        </span>
                      </Link>
                    ))}
                    <button
                      onClick={() => handleSearchSubmit()}
                      className="w-full mt-2 pt-2 border-t border-[#EFEAE2] text-center text-xs font-serif text-[#E10600] hover:underline font-semibold cursor-pointer block"
                    >
                      View all results for "{searchQuery}" →
                    </button>
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="p-4 text-center">
                    <p className="text-xs text-[#666] mb-2 font-serif">
                      No live matches found for "{searchQuery}"
                    </p>
                    <button
                      onClick={() => handleSearchSubmit()}
                      className="text-xs text-[#E10600] hover:underline font-semibold cursor-pointer"
                    >
                      Search catalog archive →
                    </button>
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] uppercase font-serif tracking-wider text-[#888] px-2 block mb-2 font-semibold">
                      Trending Searches
                    </span>
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {POPULAR_SEARCH_TERMS.slice(0, 5).map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSearchSubmit(undefined, term)}
                          className="text-xs px-2.5 py-1 rounded-full bg-[#FAF8F5] hover:bg-[#FEE2E2] text-[#555] hover:text-[#E10600] border border-[#EFEAE2] hover:border-[#E10600]/30 transition-colors cursor-pointer"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          MOBILE THREE-BAR MENU DRAWER (SLIDE-IN FROM RIGHT)
          All navigation items placed elegantly inside for mobile users
          ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Slide-in Menu Panel */}
          <div className="relative w-[85%] max-w-[340px] h-full bg-white text-[#1E1E1E] shadow-2xl flex flex-col justify-between z-10 overflow-y-auto border-l border-[#EFEAE2] animate-in slide-in-from-right duration-300">
            {/* Menu Header */}
            <div>
              <div className="p-5 flex items-center justify-between border-b border-[#EFEAE2] bg-[#FAF8F5]">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-base font-serif font-bold uppercase tracking-[0.16em] text-[#1E1E1E]"
                >
                  <span className="w-2 h-2 rounded-full bg-[#E10600]" />
                  <span>HAPPIWRAPZ</span>
                </Link>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-[#666] hover:text-[#E10600] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search Form with Live Results */}
              <div className="p-4 border-b border-[#EFEAE2]">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Search bouquets & gifts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-full text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600]"
                  />
                  <Search className="w-3.5 h-3.5 text-[#888] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#888] hover:text-[#1E1E1E]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </form>

                {/* Mobile Live Suggestions */}
                {liveSearchResults.length > 0 && (
                  <div className="mt-3 space-y-1.5 pt-2 border-t border-[#EFEAE2]">
                    <span className="text-[10px] uppercase font-serif tracking-wider text-[#888] block">
                      Matches ({liveSearchResults.length}):
                    </span>
                    {liveSearchResults.slice(0, 3).map(({ product }) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#FAF8F5] text-xs"
                      >
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#FAF8F5] shrink-0 border border-[#EFEAE2]">
                          <Image src={product.images[0]} alt={product.name} fill sizes="32px" className="object-contain p-0.5" />
                        </div>
                        <span className="flex-1 truncate font-medium text-[#1E1E1E]">{product.name}</span>
                        <span className="text-[#E10600] font-bold font-serif">{formatPrice(product.price)}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Navigation Links */}
              <nav className="p-4 space-y-1 font-serif">
                <span className="text-[10px] uppercase font-semibold text-[#888] tracking-[0.2em] px-3 block mb-2">
                  Navigation
                </span>

                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#FAF8F5] text-sm uppercase tracking-[0.14em] font-semibold text-[#1E1E1E] hover:text-[#E10600] transition-colors"
                >
                  <span>Home</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#888]" />
                </Link>

                <Link
                  href="/catalog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#FAF8F5] text-sm uppercase tracking-[0.14em] font-semibold text-[#1E1E1E] hover:text-[#E10600] transition-colors"
                >
                  <span>Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#888]" />
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openDrawer();
                  }}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#FAF8F5] text-sm uppercase tracking-[0.14em] font-semibold text-[#E10600] transition-colors text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#E10600]" />
                    <span>Order Procedure</span>
                  </span>
                  <span className="text-[10px] bg-[#E10600]/10 text-[#E10600] px-2 py-0.5 rounded-full font-sans font-medium">
                    Zero Charge
                  </span>
                </button>

                <Link
                  href="/order/lookup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#FAF8F5] text-sm uppercase tracking-[0.14em] font-semibold text-[#1E1E1E] hover:text-[#E10600] transition-colors"
                >
                  <span>Track Order</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#888]" />
                </Link>

                <Link
                  href={
                    isAuthenticated
                      ? user?.role === "customer"
                        ? "/dashboard"
                        : "/admin"
                      : "/login"
                  }
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#FAF8F5] text-sm uppercase tracking-[0.14em] font-semibold text-[#1E1E1E] hover:text-[#E10600] transition-colors"
                >
                  <span>{isAuthenticated ? "My Account" : "Sign In"}</span>
                  <User className="w-3.5 h-3.5 text-[#888]" />
                </Link>
              </nav>

              {/* Curated Categories */}
              <div className="p-4 pt-2 border-t border-[#EFEAE2]">
                <span className="text-[10px] uppercase font-serif font-semibold text-[#888] tracking-[0.2em] px-3 block mb-2">
                  Curated Categories
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-serif">
                  <Link
                    href="/catalog?category=Flower+Bouquet"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2] hover:border-[#E10600]/40 transition-all text-[#1E1E1E] hover:text-[#E10600] block"
                  >
                    🌹 Ribbon Flowers
                  </Link>
                  <Link
                    href="/catalog?category=Gift+Box"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2] hover:border-[#E10600]/40 transition-all text-[#1E1E1E] hover:text-[#E10600] block"
                  >
                    📦 Gift Boxes
                  </Link>
                  <Link
                    href="/catalog?category=Gift+Hamper"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2] hover:border-[#E10600]/40 transition-all text-[#1E1E1E] hover:text-[#E10600] block"
                  >
                    🎁 Hampers
                  </Link>
                  <Link
                    href="/catalog?category=Gift+Wrap"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2] hover:border-[#E10600]/40 transition-all text-[#1E1E1E] hover:text-[#E10600] block"
                  >
                    🎀 Gift Wraps
                  </Link>
                  <Link
                    href="/catalog?category=Custom+Order"
                    onClick={() => setMobileMenuOpen(false)}
                    className="col-span-2 p-2.5 rounded-xl bg-[#E10600]/[0.06] border border-[#E10600]/25 hover:bg-[#E10600]/10 transition-all text-[#E10600] font-semibold flex items-center justify-between"
                  >
                    <span>🎀 Bespoke Custom Orders</span>
                    <span className="text-[10px] bg-[#E10600] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                      New Studio
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Menu Footer with Direct WhatsApp Contact */}
            <div className="p-4 border-t border-[#EFEAE2] bg-[#FAF8F5] space-y-3">
              <a
                href="https://wa.me/919876543210?text=Hello%20Happiwrapz!%20I%20have%20an%20inquiry%20about%20your%20bouquets."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full text-xs font-serif uppercase tracking-wider font-semibold shadow-xs transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#777]">
                <ShieldCheck className="w-3 h-3 text-[#059669]" />
                <span>Bangalore Hand-Delivered • Zero Online Charge</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
