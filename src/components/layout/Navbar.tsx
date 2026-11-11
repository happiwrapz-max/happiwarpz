"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  User,
  X,
  Menu,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Phone,
  MessageSquare,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useBagStore } from "@/lib/store/useBagStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { searchProducts, POPULAR_SEARCH_TERMS } from "@/lib/search";
import { formatPrice } from "@/lib/utils";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";

export default function Navbar({ darkHero = false }: { darkHero?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
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

  const isDark = darkHero && !scrolled;

  const totalItems = useBagStore((s) => s.totalItems);
  const openDrawer = useBagStore((s) => s.openDrawer);
  const { user, isAuthenticated, openAuthModal } = useAuthStore();
  const itemCount = totalItems();
  const [navProducts, setNavProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/products?t=" + Date.now(), { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.products) && d.products.length > 0) {
          setNavProducts(d.products);
        }
      })
      .catch(() => {});
  }, []);

  const liveSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchProducts(searchQuery, navProducts.length > 0 ? navProducts : undefined).slice(0, 4);
  }, [searchQuery, navProducts]);

  const handleSearchSubmit = (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault();
    const query = overrideQuery !== undefined ? overrideQuery : searchQuery;
    if (query.trim()) {
      setMobileMenuOpen(false);
      setSearchOpen(false);
      router.push(`/catalog?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Collection", href: "/catalog" },
    { label: "Custom Orders", href: "/catalog?category=Custom+Order" },
    { label: "Track Order", href: "/order/lookup" },
    { label: "Our Story", href: "/about" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-[#EFEAE2] shadow-[0_4px_20px_rgba(0,0,0,0.04)] py-2.5 sm:py-3"
            : isDark
            ? "bg-transparent text-white py-3.5 sm:py-4.5"
            : "bg-white/85 backdrop-blur-sm border-b border-[#EFEAE2]/60 py-3.5 sm:py-4.5"
        }`}
      >
        <div className="container-main px-4 sm:px-6 flex items-center justify-between">
          
          {/* ── Left: Brand Marque & Atelier Crest ── */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 sm:gap-3 transition-opacity hover:opacity-90 shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] flex items-center justify-center text-[#E10600] group-hover:scale-105 transition-transform shadow-2xs">
              <RibbonEmblem className="w-4 h-4 text-[#E10600]" />
            </div>
            <div className="flex flex-col">
              <span
                className={`font-serif text-[17px] sm:text-xl font-bold tracking-[0.18em] uppercase transition-colors ${
                  isDark ? "text-white" : "text-[#1E1E1E]"
                }`}
              >
                HAPPIWRAPZ
              </span>
              <span className="hidden sm:block text-[8px] font-mono uppercase tracking-[0.28em] text-[#888] -mt-0.5">
                Coimbatore • Atelier
              </span>
            </div>
          </Link>

          {/* ── Center: Desktop Navigation Links ── */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-9 font-serif">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(link.href.split("?")[0]);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative text-[12px] xl:text-[13px] tracking-[0.16em] uppercase font-semibold transition-all py-1.5 group ${
                    isActive
                      ? isDark
                        ? "text-white font-bold"
                        : "text-[#E10600] font-bold"
                      : isDark
                      ? "text-white/80 hover:text-white"
                      : "text-[#333] hover:text-[#E10600]"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E10600] rounded-full animate-in fade-in" />
                  )}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#E10600] rounded-full group-hover:w-full transition-all duration-200" />
                </Link>
              );
            })}
          </nav>

          {/* ── Right: Action Buttons (Search, Bag, Account, Mobile Menu) ── */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Desktop Search Button */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 sm:p-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                isDark
                  ? "text-white hover:text-[#FF6B6B] hover:bg-white/10"
                  : "text-[#1E1E1E] hover:text-[#E10600] hover:bg-black/5"
              }`}
              aria-label="Search Collection"
            >
              {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>

            {/* Shopping Bag Trigger with Animated Badge */}
            <button
              type="button"
              onClick={openDrawer}
              className={`relative p-2 sm:p-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                isDark
                  ? "text-white hover:text-[#FF6B6B] hover:bg-white/10"
                  : "text-[#1E1E1E] hover:text-[#E10600] hover:bg-black/5"
              }`}
              aria-label="View Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#E10600] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in-75 duration-150">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Desktop User Account or Popup Login Trigger */}
            {isAuthenticated ? (
              <Link
                href={user?.role === "customer" ? "/dashboard" : "/admin"}
                className={`hidden sm:flex items-center gap-2 p-1.5 pr-3 rounded-full border transition-all duration-200 ${
                  isDark
                    ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                    : "border-[#EFEAE2] bg-[#FAF8F5] text-[#1E1E1E] hover:border-[#CCC]"
                }`}
                aria-label="My Account"
              >
                <div className="w-6 h-6 rounded-full bg-[#E10600] text-white flex items-center justify-center text-[11px] font-bold uppercase">
                  {user?.name ? user.name[0] : "U"}
                </div>
                <span className="text-xs font-serif font-semibold tracking-wider max-w-[100px] truncate">
                  {user?.name?.split(" ")[0] || "Account"}
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className={`hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer text-xs font-serif font-semibold uppercase tracking-wider ${
                  isDark
                    ? "border-white/30 text-white hover:bg-white hover:text-black"
                    : "border-[#1E1E1E] text-[#1E1E1E] hover:bg-[#1E1E1E] hover:text-white"
                }`}
                aria-label="Sign in"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className={`lg:hidden p-2 rounded-full transition-all duration-200 cursor-pointer ${
                isDark
                  ? "text-white hover:text-[#FF6B6B] hover:bg-white/10"
                  : "text-[#1E1E1E] hover:text-[#E10600] hover:bg-black/5"
              }`}
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Desktop Expandable Search Overlay ── */}
        {searchOpen && (
          <div className="container-main px-4 pb-4 pt-2">
            <div className="relative max-w-xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search handcrafted bouquets, hampers, ribbon roses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchSubmit();
                  }}
                  className="w-full pl-11 pr-10 py-3 text-xs sm:text-sm bg-white/95 backdrop-blur-md border border-[#E5E0D8] rounded-full text-[#1E1E1E] shadow-xl focus:outline-hidden focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600] transition-all"
                />
                <Search className="w-4 h-4 text-[#888] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#1E1E1E] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown */}
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
                      type="button"
                      onClick={() => handleSearchSubmit()}
                      className="w-full mt-2 pt-2 border-t border-[#EFEAE2] text-center text-xs font-serif text-[#E10600] hover:underline font-semibold cursor-pointer block"
                    >
                      View all results for &quot;{searchQuery}&quot; →
                    </button>
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="p-4 text-center">
                    <p className="text-xs text-[#666] mb-2 font-serif">
                      No live matches found for &quot;{searchQuery}&quot;
                    </p>
                    <button
                      type="button"
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
                          type="button"
                          onClick={() => handleSearchSubmit(undefined, term)}
                          className="text-xs px-3 py-1 rounded-full bg-[#FAF8F5] hover:bg-[#FEE2E2] text-[#555] hover:text-[#E10600] border border-[#EFEAE2] hover:border-[#E10600]/30 transition-colors cursor-pointer"
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
          MOBILE SLIDE-OVER NAVIGATION DRAWER
          Refined editorial menu with smooth animations and complete studio access
          ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Slide-in Menu Panel */}
          <div className="relative w-[85%] max-w-[340px] h-full bg-white text-[#1E1E1E] shadow-2xl flex flex-col justify-between z-10 overflow-y-auto border-l border-[#EFEAE2] animate-in slide-in-from-right duration-300">
            <div>
              {/* Menu Header with Atelier Crest */}
              <div className="p-5 flex items-center justify-between border-b border-[#EFEAE2] bg-[#FAF8F5]">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 text-base font-serif font-bold uppercase tracking-[0.16em] text-[#1E1E1E]"
                >
                  <RibbonEmblem className="w-4 h-4 text-[#E10600]" />
                  <span>HAPPIWRAPZ</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-[#666] hover:text-[#E10600] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search Form */}
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

                {/* Mobile Autocomplete Suggestions */}
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
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="32px"
                            className="object-contain p-0.5"
                          />
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

                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#FAF8F5] text-xs uppercase tracking-[0.14em] font-semibold text-[#1E1E1E] hover:text-[#E10600] transition-colors"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#888]" />
                  </Link>
                ))}

                {/* Direct Order Request & Cart Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openDrawer();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#FAF8F5] text-xs uppercase tracking-[0.14em] font-semibold text-[#E10600] transition-colors text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#E10600]" />
                    <span>Shopping Bag ({itemCount})</span>
                  </span>
                  <span className="text-[10px] bg-[#E10600]/10 text-[#E10600] px-2 py-0.5 rounded-full font-sans font-medium">
                    Zero Charge
                  </span>
                </button>

                {/* Account / Sign In */}
                {isAuthenticated ? (
                  <Link
                    href={user?.role === "customer" ? "/dashboard" : "/admin"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#FAF8F5] text-xs uppercase tracking-[0.14em] font-semibold text-[#1E1E1E] hover:text-[#E10600] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#888]" />
                      <span>{user?.name || "Client Portal"}</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#888]" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal("login");
                    }}
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl hover:bg-[#FAF8F5] text-xs uppercase tracking-[0.14em] font-semibold text-[#1E1E1E] hover:text-[#E10600] transition-colors cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#888]" />
                      <span>Sign In / Register</span>
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-[#E10600]" />
                  </button>
                )}
              </nav>

              {/* Curated Categories */}
              <div className="p-4 pt-2 border-t border-[#EFEAE2]">
                <span className="text-[10px] uppercase font-serif font-semibold text-[#888] tracking-[0.2em] px-3 block mb-2">
                  Atelier Categories
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

            {/* Menu Footer with Concierge Contact */}
            <div className="p-4 border-t border-[#EFEAE2] bg-[#FAF8F5] space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:+917708354636"
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 bg-[#1E1E1E] hover:bg-black text-white rounded-full text-xs font-serif uppercase tracking-wider font-semibold shadow-xs transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Us</span>
                </a>
                <a
                  href="https://wa.me/917708354636?text=Hello%20Happiwrapz!%20I%20have%20an%20inquiry%20about%20your%20bouquets."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full text-xs font-serif uppercase tracking-wider font-semibold shadow-xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <div className="text-center pt-1">
                <a
                  href="https://www.instagram.com/happiwrapz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#E10600] hover:underline font-medium inline-block"
                >
                  Instagram: @happiwrapz
                </a>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#777]">
                <ShieldCheck className="w-3 h-3 text-[#059669]" />
                <span>Coimbatore, Tamil Nadu • Zero Online Charge</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
