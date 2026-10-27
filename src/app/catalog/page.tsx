"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BagDrawer from "@/components/bag/BagDrawer";
import { Product } from "@/lib/store/types";
import { CATALOG } from "@/lib/data/catalog";
import { formatPrice } from "@/lib/utils";
import { useBagStore } from "@/lib/store/useBagStore";
import { searchProducts, POPULAR_SEARCH_TERMS } from "@/lib/search";
import {
  Search,
  ArrowRight,
  SlidersHorizontal,
  Star,
  Check,
  Heart,
  Calendar,
  ShieldCheck,
  Clock,
  MessageSquare,
  X,
  CheckCircle2,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";

function CatalogContent() {
  const searchParams = useSearchParams();
  const paramCategory = searchParams.get("category");
  const paramQuery = searchParams.get("q") || searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState(paramCategory || "all");
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(paramQuery);
  const [sortBy, setSortBy] = useState("featured");
  const [addedId, setAddedId] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const togglePriceRange = (rangeId: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(rangeId)
        ? prev.filter((id) => id !== rangeId)
        : [...prev, rangeId]
    );
  };

  useEffect(() => {
    if (paramCategory) {
      setSelectedCategory(paramCategory);
    }
  }, [paramCategory]);

  useEffect(() => {
    if (paramQuery !== undefined) {
      setSearchQuery(paramQuery);
    }
  }, [paramQuery]);

  // Custom Order Builder States
  const [customStemCount, setCustomStemCount] = useState<"25" | "50" | "100">("50");
  const [customFlowerColor, setCustomFlowerColor] = useState("Crimson Red");
  const [customBoxStyle, setCustomBoxStyle] = useState("European Matte Wrap");
  const [customRibbonText, setCustomRibbonText] = useState("Happy Anniversary My Love • 2026");
  const [customAddons, setCustomAddons] = useState<string[]>(["chocolates"]);

  const addItem = useBagStore((s) => s.addItem);
  const openDrawer = useBagStore((s) => s.openDrawer);

  const categories = [
    { label: "All Products", value: "all" },
    { label: "Flower Boxes", value: "Flower Boxes" },
    { label: "Gift Hampers", value: "Gift Hampers" },
    { label: "Personalized Gifts", value: "Personalized Gifts" },
    { label: "Home & Decor", value: "Home & Decor" },
    { label: "Sweet Treats", value: "Sweet Treats" },
  ];

  const priceRanges = [
    { id: "under-999", label: "Under ₹999" },
    { id: "1000-1999", label: "₹1,000 - ₹1,999" },
    { id: "2000-2999", label: "₹2,000 - ₹2,999" },
    { id: "3000-plus", label: "₹3,000+" },
  ];

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleQuickAdd = (product: (typeof CATALOG)[0], e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    addItem(product, 1);
    setAddedId(product.id);
    setTimeout(() => {
      setAddedId(null);
    }, 1000);
  };

  // Custom Order Pricing Calculation
  const stemPriceDelta =
    customStemCount === "25" ? 0 : customStemCount === "50" ? 1500 : 3500;
  const boxPriceDelta =
    customBoxStyle === "Velvet Keepsake Box"
      ? 450
      : customBoxStyle === "Grand Acrylic Showcase"
        ? 750
        : 0;
  const addonsPriceDelta =
    (customAddons.includes("chocolates") ? 299 : 0) +
    (customAddons.includes("wine") ? 499 : 0) +
    (customAddons.includes("fairylights") ? 149 : 0);

  const totalCustomPrice = 1999 + stemPriceDelta + boxPriceDelta + addonsPriceDelta;

  const handleAddCustomOrderToBag = () => {
    const customProduct = {
      id: `custom-${Date.now()}`,
      slug: "bespoke-custom-order",
      name: `Bespoke Custom Arrangement (${customStemCount} ${customFlowerColor} Roses)`,
      category: "Custom Order",
      description: `${customStemCount} ${customFlowerColor} roses in ${customBoxStyle}. Custom Ribbon: "${customRibbonText.trim() || "With Love"}". Add-ons: ${customAddons.length > 0 ? customAddons.join(", ") : "None"
        }`,
      price: totalCustomPrice,
      images: [
        "/images/hero-desktop.jpg",
        "/images/hero-mobile.jpg",
      ],
      inStock: true,
      featured: true,
      options: [
        {
          id: "stem-count",
          label: "Stem Count",
          values: [`${customStemCount} Roses`],
        },
        {
          id: "presentation",
          label: "Presentation",
          values: [customBoxStyle],
        },
      ],
    };

    addItem(customProduct, 1);
    setAddedId(customProduct.id);
    setTimeout(() => {
      setAddedId(null);
    }, 1000);
  };

  const customWhatsAppUrl = useMemo(() => {
    const text = `Hello Happiwrapz! I want to commission a Custom Ribbon Flower Gift:%0A• Blooms: ${customStemCount} ${customFlowerColor}%0A• Presentation: ${customBoxStyle}%0A• Custom Ribbon Text: "${customRibbonText}"%0A• Add-ons: ${customAddons.join(", ") || "None"
      }%0A• Estimated Total: ₹${totalCustomPrice}%0APlease confirm crafting schedule and dispatch availability.`;
    return `https://wa.me/919876543210?text=${text}`;
  }, [customStemCount, customFlowerColor, customBoxStyle, customRibbonText, customAddons, totalCustomPrice]);

  const filtered = useMemo(() => {
    // 1. Initial pool from Search Engine (if search query exists) or full CATALOG
    let pool: Product[];
    const hasSearch = searchQuery.trim().length > 0;

    if (hasSearch) {
      const searchResults = searchProducts(searchQuery, CATALOG);
      pool = searchResults.map((r) => r.product);
    } else {
      pool = CATALOG;
    }

    // 2. Category matching
    const matchesCategoryFunc = (item: Product) => {
      if (selectedCategory === "all") return true;
      if (selectedCategory === item.category) return true;
      if (
        selectedCategory === "Flower Boxes" &&
        (item.category === "Flower Bouquet" ||
          item.category === "Gift Box" ||
          item.category === "Flower Boxes")
      )
        return true;
      if (
        selectedCategory === "Gift Hampers" &&
        (item.category === "Gift Hamper" || item.category === "Gift Hampers")
      )
        return true;
      if (
        selectedCategory === "Personalized Gifts" &&
        (item.category === "Personalized Gifts" ||
          item.category === "Custom Order")
      )
        return true;
      if (
        selectedCategory === "Home & Decor" &&
        (item.category === "Home & Decor" || item.category === "Gift Wrap")
      )
        return true;
      if (
        selectedCategory === "Sweet Treats" &&
        item.category === "Sweet Treats"
      )
        return true;
      if (
        paramCategory &&
        item.category.toLowerCase().replace(/\s+/g, "-") ===
          paramCategory.toLowerCase().replace(/\s+/g, "-")
      )
        return true;
      return false;
    };

    let result = pool;
    if (selectedCategory !== "all") {
      const inCategory = pool.filter(matchesCategoryFunc);
      // If user typed a search that has results in the chosen category, use them;
      // if not, but pool has matches across other categories, show them so user finds what they searched!
      if (inCategory.length > 0 || !hasSearch) {
        result = inCategory;
      }
    }

    // 3. Price range multi-checkbox filter
    if (selectedPriceRanges.length > 0) {
      result = result.filter((item) => {
        return selectedPriceRanges.some((range) => {
          if (range === "under-999") return item.price < 1000;
          if (range === "1000-1999") return item.price >= 1000 && item.price <= 1999;
          if (range === "2000-2999") return item.price >= 2000 && item.price <= 2999;
          if (range === "3000-plus") return item.price >= 3000;
          return true;
        });
      });
    }

    // 4. Sorting (if no search, or explicit sort chosen)
    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result = [...result].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [selectedCategory, selectedPriceRanges, searchQuery, sortBy, paramCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1E1E1E] selection:bg-[#E10600]/15 selection:text-[#E10600]">
      {/* Solid Top Fixed Navbar */}
      <Navbar />
      <BagDrawer />

      <main className="flex-1">
        {/* =========================================================================
            CINEMATIC LUXURY FLORAL ATELIER COLLECTION HERO
            High-fashion panoramic vista with pristine white marble workshop,
            dewy crimson roses, flowing satin ribbons, and crystal vases
            ========================================================================= */}
        {/* =========================================================================
            CINEMATIC LUXURY FLORAL ATELIER COLLECTION HERO
            Text moved to top over natural atelier wall, white box removed,
            leaving roses, satin ribbons, and marble counter completely unobstructed
            ========================================================================= */}
        <section className="relative w-full h-[400px] sm:h-[460px] md:h-[500px] flex flex-col justify-between items-center pt-18 sm:pt-22 pb-4 border-b border-[#EFEAE2] overflow-hidden">
          {/* Panoramic Cinematic Atelier Background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image
              src="/images/collection-hero.jpg"
              alt="Luxury Parisian floral atelier with crimson roses and satin ribbons on white marble"
              fill
              priority
              sizes="100vw"
              className="object-cover object-bottom sm:object-center"
            />
            {/* Subtle soft white gradient at top for crystal-clear typography legibility */}
            <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-white/90 via-white/60 to-transparent pointer-events-none" />
            {/* Soft fade at the very bottom into the filter bar */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/30 to-transparent pointer-events-none" />
          </div>

          {/* Elevated Top Wording (No white card background, moved up) */}
          <div className="container-main max-w-3xl px-4 sm:px-6 relative z-10 text-center pt-2 sm:pt-3 space-y-2">
            {/* Micro Kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-[#E10600]/25 shadow-2xs backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] animate-pulse" />
              <span className="text-[10px] font-serif font-semibold tracking-[0.25em] uppercase text-[#E10600]">
                Happiwrapz Atelier Archive
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1E1E1E] font-normal tracking-[-0.01em] leading-tight">
              The Floral <span className="italic text-[#E10600] font-light">Collection</span>
            </h1>

            {/* Poetic Narrative */}
            <p className="text-xs sm:text-sm font-sans text-[#4A4A4A] max-w-lg mx-auto leading-relaxed">
              Handcrafted satin ribbon roses, eternal sunflowers that never wilt, and signature European hand-tied wraps. Handcrafted in Bangalore with zero upfront online payment.
            </p>

            {/* Minimalist Trust Badges */}
            <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5 sm:gap-6 text-[11px] text-[#555] font-serif">
              <span className="flex items-center gap-1.5 text-[#059669] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Handcrafted Ribbon Flowers</span>
              </span>
              <span className="text-[#AAA] hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 text-[#059669] font-medium">
                <Clock className="w-3.5 h-3.5 text-[#E10600]" />
                <span>Same-Day 2hr Express Dispatch</span>
              </span>
              <span className="text-[#AAA] hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5 text-[#059669] font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Online Upfront Charge</span>
              </span>
            </div>
          </div>

          {/* Bottom View Area: Transparent spacer keeping flowers, ribbons, and marble 100% visible */}
          <div className="relative z-10 w-full h-24 sm:h-32 pointer-events-none" />
        </section>



        {/* =========================================================================
        {/* =========================================================================
            SHOP VIEW WITH LEFT NAVIGATION BAR (DESKTOP) & HORIZONTAL BAR (MOBILE)
            ========================================================================= */}
        <section id="shop" className="container-main px-4 sm:px-6 py-6 sm:py-12">
          {/* ── MOBILE CATEGORY SCROLL PILLS (Visible only on mobile < 768px) ── */}
          <div className="md:hidden mb-5">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
              {categories.map((c) => {
                const isActive = selectedCategory === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedCategory(c.value)}
                    className={`px-4 py-2 rounded-full text-xs font-serif uppercase tracking-wider whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-[#E10600] text-white shadow-[0_2px_10px_rgba(225,6,0,0.3)] font-semibold"
                        : "bg-[#FAF8F5] text-[#555] border border-[#EFEAE2] hover:border-[#BBB]"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 lg:gap-10 items-start">
            {/* ── LEFT NAVIGATION BAR (Desktop screens >= 768px) ── */}
            <aside className="hidden md:block w-56 lg:w-60 shrink-0 md:sticky md:top-24 self-start">
              {/* Category Filter */}
              <div className="mb-7">
                <h3 className="text-sm font-bold text-[#1E1E1E] mb-3 font-sans">
                  Category
                </h3>
                <nav className="flex flex-col space-y-1">
                  {categories.map((c) => {
                    const isActive = selectedCategory === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setSelectedCategory(c.value)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer ${
                          isActive
                            ? "bg-[#FEE2E2] text-[#E10600] font-semibold"
                            : "text-[#555] hover:text-[#1E1E1E] hover:bg-[#FAF8F5] font-normal"
                        }`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Price Range Checkbox Filter */}
              <div>
                <h3 className="text-sm font-bold text-[#1E1E1E] mb-3 font-sans">
                  Price Range
                </h3>
                <div className="flex flex-col space-y-2.5">
                  {priceRanges.map((pr) => {
                    const isChecked = selectedPriceRanges.includes(pr.id);
                    return (
                      <label
                        key={pr.id}
                        className="flex items-center gap-2.5 text-sm text-[#555] hover:text-[#1E1E1E] cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePriceRange(pr.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#E10600] accent-[#E10600] focus:ring-[#E10600] cursor-pointer"
                        />
                        <span className={isChecked ? "font-medium text-[#1E1E1E]" : "font-normal"}>
                          {pr.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* ── RIGHT MAIN CONTENT AREA ── */}
            <div className="flex-1 min-w-0 w-full space-y-6">
              {/* Top Search & Sort Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
                  <input
                    type="text"
                    placeholder="Search gifts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 text-sm bg-white border border-[#E5E0D8] rounded-full text-[#1E1E1E] placeholder:text-[#999] focus:outline-hidden focus:border-[#E10600] shadow-2xs transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#1E1E1E] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort By Dropdown */}
                <div className="relative shrink-0 flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs text-[#888] hidden sm:inline">Sort By:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-[#E5E0D8] rounded-full pl-3 pr-8 py-2 text-xs sm:text-sm text-[#444] cursor-pointer focus:outline-hidden focus:border-[#E10600] shadow-2xs font-sans"
                    >
                      <option value="featured">Popular</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#888] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Active Search Query Feedback Banner */}
              {searchQuery.trim() && (
                <div className="flex items-center justify-between bg-[#FAF8F5] border border-[#EFEAE2] px-4 py-2.5 rounded-2xl text-xs shadow-2xs">
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-[#E10600]" />
                    <span className="text-[#555]">
                      Found <strong className="text-[#1E1E1E]">{filtered.length}</strong> {filtered.length === 1 ? "creation" : "creations"} matching{" "}
                      <strong className="text-[#E10600]">"{searchQuery}"</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-[11px] text-[#E10600] hover:underline font-semibold cursor-pointer"
                  >
                    Clear Search
                  </button>
                </div>
              )}

              {/* Interactive Custom Commission Studio */}
              {(selectedCategory === "Personalized Gifts" || selectedCategory === "Custom Order") && (
                <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-[#E10600]/30 shadow-sm relative overflow-hidden">
              <div className="max-w-3xl space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E10600]/10 border border-[#E10600]/25 text-[#E10600] text-[10px] font-serif uppercase tracking-[0.2em] font-semibold mb-2">
                    <RibbonEmblem className="w-3.5 h-3.5" />
                    <span>Interactive Custom Commission Studio</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-4xl text-[#1E1E1E] font-normal">
                    Craft Your Personal Flower & Gift Statement
                  </h2>
                  <p className="text-xs sm:text-sm text-[#666] mt-1 leading-relaxed">
                    Personalize your stem count, flower palette, packaging style, and custom ribbon calligraphy. Hand-assembled by our head florist with zero upfront payment.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Stem Count Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider block">
                      1. Ribbon Flower Count
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "25", label: "25 Blooms", subtitle: "Handcrafted" },
                        { id: "50", label: "50 Blooms", subtitle: "+₹1,500" },
                        { id: "100", label: "100 Blooms", subtitle: "+₹3,500" },
                      ].map((stem) => (
                        <button
                          key={stem.id}
                          type="button"
                          onClick={() => setCustomStemCount(stem.id as any)}
                          className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${customStemCount === stem.id
                            ? "bg-white border-[#E10600] shadow-xs text-[#E10600]"
                            : "bg-white/60 border-[#EFEAE2] text-[#555] hover:border-[#CCC]"
                            }`}
                        >
                          <span className="block font-serif text-xs font-bold">{stem.label}</span>
                          <span className="text-[10px] text-[#888] font-sans">{stem.subtitle}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Flower Palette Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider block">
                      2. Ribbon Flower Variety & Palette
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { name: "Crimson Roses", color: "bg-[#E10600]" },
                        { name: "Golden Sunflowers", color: "bg-[#E5A83B]" },
                        { name: "Rose & Sunflower Mix", color: "bg-[#D97706]" },
                      ].map((pal) => (
                        <button
                          key={pal.name}
                          type="button"
                          onClick={() => setCustomFlowerColor(pal.name)}
                          className={`p-2.5 rounded-2xl border flex items-center gap-2 transition-all cursor-pointer ${customFlowerColor === pal.name
                            ? "bg-white border-[#E10600] shadow-xs text-[#E10600]"
                            : "bg-white/60 border-[#EFEAE2] text-[#555] hover:border-[#CCC]"
                            }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full ${pal.color} shrink-0 border border-black/10`} />
                          <span className="text-[11px] font-serif font-medium truncate">{pal.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Packaging Style */}
                  <div className="space-y-2">
                    <label className="text-xs font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider block">
                      3. Presentation Format
                    </label>
                    <div className="space-y-1.5">
                      {[
                        { name: "European Matte Wrap", price: "Included" },
                        { name: "Velvet Keepsake Box", price: "+₹450" },
                        { name: "Grand Acrylic Showcase", price: "+₹750" },
                      ].map((box) => (
                        <button
                          key={box.name}
                          type="button"
                          onClick={() => setCustomBoxStyle(box.name)}
                          className={`w-full p-2.5 px-3 rounded-2xl border flex items-center justify-between text-xs transition-all cursor-pointer ${customBoxStyle === box.name
                            ? "bg-white border-[#E10600] shadow-xs text-[#E10600]"
                            : "bg-white/60 border-[#EFEAE2] text-[#555] hover:border-[#CCC]"
                            }`}
                        >
                          <span className="font-serif font-medium">{box.name}</span>
                          <span className="text-[10px] text-[#888] font-sans">{box.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Ribbon Calligraphy Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider block">
                      4. Custom Ribbon Calligraphy
                    </label>
                    <input
                      type="text"
                      value={customRibbonText}
                      onChange={(e) => setCustomRibbonText(e.target.value)}
                      placeholder="e.g. Happy Anniversary Sarah • Forever & Always"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#EFEAE2] rounded-2xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600]"
                    />
                    <p className="text-[10px] text-[#888]">
                      Embossed in gold leaf lettering onto double-face Italian satin ribbon.
                    </p>
                  </div>
                </div>

                {/* Keepsake Add-on Extras */}
                <div className="pt-2 border-t border-[#EFEAE2]">
                  <label className="text-xs font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider block mb-2">
                    5. Complimentary Keepsake Add-ons
                  </label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {[
                      { id: "chocolates", label: "Belgian Truffles (+₹299)" },
                      { id: "wine", label: "Celebration Cider (+₹499)" },
                      { id: "fairylights", label: "Twinkle Fairy Lights (+₹149)" },
                    ].map((addon) => {
                      const isSelected = customAddons.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => {
                            setCustomAddons((prev) =>
                              prev.includes(addon.id)
                                ? prev.filter((a) => a !== addon.id)
                                : [...prev, addon.id]
                            );
                          }}
                          className={`px-3 py-1.5 rounded-full border text-xs font-sans transition-all cursor-pointer ${isSelected
                            ? "bg-[#E10600] text-white border-[#E10600]"
                            : "bg-white text-[#666] border-[#EFEAE2] hover:border-[#BBB]"
                            }`}
                        >
                          {isSelected ? "✓ " : "+ "}
                          {addon.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Estimated Price & Action Bar */}
                <div className="pt-4 border-t border-[#EFEAE2] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-serif text-[#888] tracking-wider block">
                      Estimated Bespoke Value
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-serif font-bold text-[#E10600]">
                        {formatPrice(totalCustomPrice)}
                      </span>
                      <span className="text-xs text-[#059669] font-sans">
                        (Zero upfront payment charged)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <a
                      href={customWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full text-xs font-serif uppercase tracking-wider font-semibold shadow-xs transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Specs</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleAddCustomOrderToBag}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E10600] hover:bg-[#C20500] text-white rounded-full text-xs font-serif uppercase tracking-wider font-semibold shadow-xs transition-all cursor-pointer"
                    >
                      <span>Add to Bag & Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Product Collection Grid */}
        {filtered.length === 0 ? (
          /* Empty State with Smart Fallbacks */
          <div className="bg-[#FAF8F5] rounded-3xl p-8 sm:p-14 text-center border border-[#EFEAE2] max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#E10600]/10 text-[#E10600] flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl sm:text-2xl text-[#1E1E1E] mb-2 font-normal">
              {searchQuery ? `No creations found for "${searchQuery}"` : "No matching creations found"}
            </h3>
            <p className="text-xs text-[#666] mb-5 leading-relaxed">
              We couldn't find an exact match. Explore popular collections or reset your search.
            </p>

            {/* Popular Search Suggestions */}
            <div className="mb-6">
              <span className="text-[10px] uppercase font-serif tracking-wider text-[#888] block mb-2 font-semibold">
                Popular Searches:
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {POPULAR_SEARCH_TERMS.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchQuery(term);
                      setSelectedCategory("all");
                      setSelectedPriceRanges([]);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full bg-white border border-[#EFEAE2] text-[#555] hover:border-[#E10600] hover:text-[#E10600] hover:bg-[#FEE2E2]/40 transition-colors cursor-pointer shadow-2xs"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedPriceRanges([]);
                setSearchQuery("");
                setSortBy("featured");
              }}
              className="bg-[#E10600] hover:bg-[#C20500] text-white px-6 py-2.5 rounded-full text-xs font-serif uppercase tracking-wider font-semibold cursor-pointer shadow-xs transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filtered.map((product) => {
              const isAdded = addedId === product.id;
              const isWishlisted = wishlist.includes(product.id);
              const isCustomOrder = product.category === "Custom Order" || product.id === "bespoke-custom-order";

              return (
                <div
                  key={product.id}
                  className={`group bg-white rounded-2xl sm:rounded-3xl border p-2.5 sm:p-3.5 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${isCustomOrder
                    ? "border-[#E10600]/40 ring-1 ring-[#E10600]/20"
                    : "border-[#EFEAE2] hover:border-[#E10600]/40"
                    }`}
                >
                  <div>
                    {/* Image Preview Container */}
                    <Link
                      href={`/product/${product.slug}`}
                      className="block relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-[#FAF8F5] mb-2 sm:mb-3"
                    >
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500 ease-out"
                      />

                      {/* Badge matching screenshot (Bestseller / Popular) */}
                      <span
                        className="absolute top-2 left-2 text-[9px] sm:text-[10px] font-semibold text-white px-2 sm:px-2.5 py-0.5 rounded-full shadow-2xs bg-[#E10600]"
                      >
                        {product.id.includes("red-rose") || product.id === "red-rose-bouquet"
                          ? "Bestseller"
                          : product.id.includes("hamper") || product.id.includes("glitter")
                            ? "Popular"
                            : isCustomOrder
                              ? "Custom Order"
                              : product.category}
                      </span>

                      {/* Wishlist Heart Button */}
                      <button
                        onClick={(e) => toggleWishlist(product.id, e)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-xs text-[#888] hover:text-[#E10600] transition-colors shadow-2xs cursor-pointer"
                        aria-label="Save to wishlist"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 transition-colors ${isWishlisted ? "fill-[#E10600] text-[#E10600]" : ""
                            }`}
                        />
                      </button>
                    </Link>

                    {/* Content Section */}
                    <div className="px-0.5 sm:px-1 space-y-1">
                      {/* Product Title */}
                      <Link
                        href={`/product/${product.slug}`}
                        className="block font-serif text-xs sm:text-base font-semibold text-[#1E1E1E] group-hover:text-[#E10600] transition-colors line-clamp-1"
                      >
                        {product.name}
                      </Link>

                      {/* Rating: ★ 4.8 (124) */}
                      <div className="flex items-center gap-1 text-[#E10600] text-xs">
                        <Star className="w-3.5 h-3.5 fill-[#E5A83B] text-[#E5A83B]" />
                        <span className="font-semibold text-[#1E1E1E]">4.8</span>
                        <span className="text-[#888] font-sans text-xs">
                          ({product.id.length * 7 + 42})
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Price & Small Sleek Charcoal Add Button */}
                  <div className="pt-2.5 sm:pt-3 mt-2 border-t border-[#EFEAE2] flex items-center justify-between px-0.5 sm:px-1">
                    <div className="flex items-baseline gap-1 sm:gap-1.5">
                      <span className="text-xs sm:text-base font-bold text-[#1E1E1E]">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-[10px] sm:text-xs text-[#999] line-through font-sans">
                        {formatPrice(product.price + 300)}
                      </span>
                    </div>

                    <button
                      onClick={(e) =>
                        isCustomOrder
                          ? setSelectedCategory("Personalized Gifts")
                          : handleQuickAdd(product, e)
                      }
                      className={`inline-flex items-center gap-1 px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-serif uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer shadow-2xs shrink-0 ${
                        isAdded
                          ? "bg-[#059669] text-white"
                          : "bg-[#1E1E1E] hover:bg-[#E10600] text-white"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Added</span>
                        </>
                      ) : isCustomOrder ? (
                        <>
                          <RibbonEmblem className="w-3 h-3" />
                          <span>Customize</span>
                        </>
                      ) : (
                        <span>+ Add</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>

          {/* =========================================================================
              BESPOKE FLORAL CONCIERGE BANNER
              Midway prompt to connect on WhatsApp for custom bouquets
              ========================================================================= */}
          <div className="mt-14 sm:mt-20 bg-[#FAF8F5] rounded-3xl p-6 sm:p-10 border border-[#EFEAE2] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left max-w-xl">
              <span className="text-[10px] sm:text-[11px] font-serif font-semibold tracking-[0.25em] text-[#E10600] uppercase block">
                BESPOKE FLORAL COMMISSIONS
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1E1E1E] font-normal">
                Need a Custom Stem Count or Surprise Styling?
              </h2>
              <p className="text-xs sm:text-sm text-[#666] leading-relaxed">
                Looking for 50, 100, or 200 roses, customized ribbon foil lettering, or tailored hotel room styling? Our head florist is available directly on WhatsApp.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <a
                href={customWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full text-xs font-serif uppercase tracking-wider font-semibold transition-colors shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>

              <button
                onClick={() => setSelectedCategory("Custom Order")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#1E1E1E] border border-[#EFEAE2] hover:bg-[#F2ECE4] rounded-full text-xs font-serif uppercase tracking-wider font-semibold transition-colors cursor-pointer"
              >
                <RibbonEmblem className="w-3.5 h-3.5 text-[#E10600]" />
                <span>Open Custom Studio</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-xs font-serif text-[#888] uppercase tracking-widest">
          Loading Botanical Archive...
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
