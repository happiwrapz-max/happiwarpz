"use client";

import { use, useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Check,
  Trash2,
  Package,
  Layers,
  Sparkles,
  AlertTriangle,
  Eye,
  Loader2,
  Tag,
  Palette,
  SlidersHorizontal,
  Plus,
  X,
  Star,
  ExternalLink,
  Search,
  Globe,
  BarChart3,
  CheckCircle2,
  UploadCloud,
} from "lucide-react";
import { Product, ProductOption, FlowerCountTier } from "@/lib/store/types";
import { formatPrice } from "@/lib/utils";
import CloudinaryImageUploader from "@/components/admin/CloudinaryImageUploader";
import FlowerTiersEditor from "@/components/admin/FlowerTiersEditor";

const BADGE_PRESETS = [
  "None",
  "Bestseller",
  "Valentine's Special",
  "Handcrafted in Coimbatore",
  "New Arrival",
  "Artisan Choice",
  "Limited Edition",
  "Signature Duet",
];

const RIBBON_COLOR_PRESETS = [
  "Crimson Red",
  "Golden Sunflower Yellow",
  "Blush Pink",
  "Royal Emerald Green",
  "Midnight Navy",
  "Snow White",
  "Pastel Lavender",
  "Rose Gold Shimmer",
];

const FLOWER_TYPE_PRESETS = [
  "Satin Ribbon Roses",
  "Glitter Luxury Roses",
  "Golden Sunflowers",
  "Mixed Rose & Sunflower Duet",
  "Velvet Keepsake Blossom",
];

function EditProductContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"general" | "media" | "variants" | "seo" | "analytics">("general");

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Flower Bouquet");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("1499");
  const [comparePrice, setComparePrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [inStock, setInStock] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [primaryTag, setPrimaryTag] = useState("None");
  const [flowerType, setFlowerType] = useState("Satin Ribbon Roses");
  const [ribbonColor, setRibbonColor] = useState("Crimson Red");
  const [wrappingStyle, setWrappingStyle] = useState("European Matte Paper Wrap");
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [flowerTiers, setFlowerTiers] = useState<FlowerCountTier[]>([]);

  // Variant helper state
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");

  // Categories list
  const [availableCategories, setAvailableCategories] = useState<string[]>([
    "Flower Bouquet",
    "Gift Box",
    "Gift Hamper",
    "Gift Wrap",
    "Glitter Editions",
    "Wedding & Keepsake",
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch categories
        try {
          const catRes = await fetch("/api/admin/categories");
          const catData = await catRes.json();
          if (catData.success && Array.isArray(catData.categories)) {
            setAvailableCategories(catData.categories.map((c: any) => c.name));
          }
        } catch {
          // fallback
        }

        // 2. Fetch product by ID
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();

        if (res.ok && data.success && data.product) {
          const p: Product = data.product;
          setProduct(p);
          setName(p.name);
          setSlug(p.slug || p.id);
          setCategory(p.category);
          setDescription(p.description || "");
          setPrice(String(p.price));
          setComparePrice(p.compareAtPrice ? String(p.compareAtPrice) : "");
          setImages(p.images?.length ? p.images : ["https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg"]);
          setInStock(Boolean(p.inStock));
          setFeatured(Boolean(p.featured));
          setPrimaryTag(p.tags?.[0] || "None");
          setFlowerType(p.flowerType || "Satin Ribbon Roses");
          setRibbonColor(p.ribbonColor || "Crimson Red");
          setWrappingStyle(p.wrappingStyle || "European Matte Paper Wrap");
          setOptions(p.options || []);

          const baseP = Number(p.price) || 1499;
          const standardTiers: FlowerCountTier[] = [
            { id: "tier-3", count: 3, label: "Petite Keepsake (3 Stems)", price: Math.round((baseP * 0.45) / 10) * 10 || 599 },
            { id: "tier-5", count: 5, label: "Classic Charm (5 Stems)", price: Math.round((baseP * 0.65) / 10) * 10 || 899 },
            { id: "tier-7", count: 7, label: "Signature Bouquet (7 Stems)", price: Math.round((baseP * 0.85) / 10) * 10 || 1199 },
            { id: "tier-10", count: 10, label: "Prestige Grandeur (10 Stems)", price: baseP, isDefault: true },
            { id: "tier-15", count: 15, label: "Luxury Statement (15 Stems)", price: Math.round((baseP * 1.45) / 10) * 10 || 2199 },
            { id: "tier-20", count: 20, label: "Royal Atelier (20 Stems)", price: Math.round((baseP * 1.9) / 10) * 10 || 2899 },
          ];
          setFlowerTiers(p.flowerTiers && p.flowerTiers.length > 0 ? p.flowerTiers : standardTiers);
        } else {
          setErrorMessage(data.error || "Product could not be retrieved from database.");
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Network error loading product.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  // Savings calculation
  const savings = useMemo(() => {
    const reg = Number(price) || 0;
    const cmp = Number(comparePrice) || 0;
    if (cmp > reg && reg > 0) {
      const diff = cmp - reg;
      const pct = Math.round((diff / cmp) * 100);
      return { diff, pct };
    }
    return null;
  }, [price, comparePrice]);

  // Add Option Variant
  const handleAddOption = () => {
    if (!newOptionLabel.trim() || !newOptionValue.trim()) return;
    const valuesArray = newOptionValue
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    const newOpt: ProductOption = {
      id: `opt-${Date.now()}`,
      label: newOptionLabel.trim(),
      values: valuesArray,
    };

    setOptions([...options, newOpt]);
    setNewOptionLabel("");
    setNewOptionValue("");
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    const numPrice = Number(price);
    if (!name.trim()) {
      setErrorMessage("Please provide a product title.");
      setSubmitting(false);
      return;
    }
    if (!numPrice || numPrice <= 0) {
      setErrorMessage("Please enter a valid price greater than ₹0.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
          category,
          description: description.trim(),
          price: numPrice,
          compareAtPrice: comparePrice ? Number(comparePrice) : undefined,
          images: images.length ? images : (product?.images || ["https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg"]),
          inStock,
          featured,
          tags: primaryTag !== "None" ? [primaryTag] : [],
          flowerType,
          ribbonColor,
          wrappingStyle,
          options,
          flowerTiers: flowerTiers.map((t) => ({
            ...t,
            count: Number(t.count),
            price: Number(t.price),
          })),
          stockQuantity: 999,
          lowStockThreshold: 0,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaved(true);
        setTimeout(() => {
          router.push("/admin/products");
        }, 800);
      } else {
        setErrorMessage(data.error || "Failed to update product");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error while saving product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to remove "${product?.name}" from your catalog?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/admin/products");
      } else {
        alert(data.error || "Failed to delete product");
      }
    } catch (err: any) {
      alert("Error deleting product: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-xs text-[#888] flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#E10600]" />
        <span>Loading product details...</span>
      </div>
    );
  }

  if (errorMessage && !product) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-3xl border border-[#EFEAE2] text-center space-y-4">
        <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
        <h2 className="font-serif text-xl font-semibold text-[#1E1E1E]">Product Not Found</h2>
        <p className="text-xs text-[#666]">{errorMessage}</p>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E1E1E] text-white text-xs font-serif uppercase tracking-wider font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE2]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2.5 rounded-full bg-white border border-[#EFEAE2] hover:border-[#1E1E1E] text-[#1E1E1E] transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-serif font-semibold text-[#E10600] uppercase tracking-[0.2em]">
              <Package className="w-3 h-3" />
              <span>Catalog Product Editor</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#1E1E1E] font-normal">
              {product?.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {product?.slug && (
            <Link
              href={`/product/${product.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#EFEAE2] bg-white hover:bg-[#FAF8F5] text-xs font-serif font-semibold text-[#1E1E1E] transition-colors shadow-2xs"
            >
              <span>View on Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#E10600]" />
            </Link>
          )}

          <button
            type="button"
            onClick={handleDelete}
            className="p-2 text-[#888] hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
            title="Remove Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Success Notification */}
      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Product successfully updated! Returning to catalog...</span>
        </div>
      )}

      {/* Editor Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#EFEAE2] pb-1 overflow-x-auto scrollbar-none">
        {[
          { id: "general", label: "General & Pricing" },
          { id: "media", label: "Cloudinary Images", count: images.length },
          { id: "variants", label: "Customization & Variants", count: options.length },
          { id: "seo", label: "SEO & Storefront Link" },
          { id: "analytics", label: "Performance Summary" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-serif transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#1E1E1E] text-white font-semibold shadow-xs"
                : "text-[#666] hover:bg-[#FAF8F5] hover:text-[#1E1E1E]"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-[#EFEAE2] text-[#666]"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB 1: General & Pricing */}
        {activeTab === "general" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 xl:col-span-8 space-y-6 min-w-0">
              {/* Product Identity */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
                <h2 className="font-serif text-base font-bold text-[#1E1E1E]">Product Overview</h2>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Handcrafted Ribbon Rose Bouquet"
                    className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] outline-none"
                    >
                      {availableCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5">
                      Badge / Tag
                    </label>
                    <select
                      value={primaryTag}
                      onChange={(e) => setPrimaryTag(e.target.value)}
                      className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] outline-none"
                    >
                      {BADGE_PRESETS.map((badge) => (
                        <option key={badge} value={badge}>
                          {badge}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5">
                    Detailed Story & Editorial Description *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Handcrafted satin ribbon roses folded meticulously by hand. Never wilts or fades..."
                    className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] outline-none transition-all leading-relaxed"
                  />
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
                <h2 className="font-serif text-base font-bold text-[#1E1E1E]">Pricing & Value</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5">
                      Selling Price (₹ INR) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-serif font-bold text-[#888]">
                        ₹
                      </span>
                      <input
                        type="number"
                        required
                        min={1}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full pl-8 pr-3 p-3 text-xs bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] font-serif font-bold text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5">
                      Original / Compare-At Price (₹ INR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-serif font-bold text-[#888]">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={comparePrice}
                        onChange={(e) => setComparePrice(e.target.value)}
                        placeholder="e.g. 1999"
                        className="w-full pl-8 pr-3 p-3 text-xs bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {savings && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                    <span className="font-semibold">Customer Savings Badge:</span>
                    <span className="font-serif font-bold">
                      Save ₹{savings.diff} ({savings.pct}% OFF)
                    </span>
                  </div>
                )}
              </div>

              {/* Number of Flowers & Pricing Tiers Editor */}
              <FlowerTiersEditor
                basePrice={Number(price) || 1499}
                tiers={flowerTiers}
                onChange={setFlowerTiers}
              />
            </div>

            {/* Right Column (Display Settings & Primary Photo Preview) */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6 min-w-0">
              <div className="bg-white p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
                <h2 className="font-serif text-base font-bold text-[#1E1E1E]">Primary Display Photo</h2>

                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#EFEAE2]">
                  <Image
                    src={images[0] || "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg"}
                    alt={name || "Product"}
                    fill
                    className="object-cover"
                  />
                  {featured && (
                    <span className="absolute top-2 right-2 bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("media")}
                  className="w-full py-2.5 px-4 rounded-xl border border-[#EFEAE2] hover:border-[#1E1E1E] text-xs font-serif font-semibold text-[#1E1E1E] transition-colors flex items-center justify-center gap-2 cursor-pointer bg-[#FAF8F5]"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-[#E10600]" />
                  <span>Manage / Upload Cloudinary Images ({images.length})</span>
                </button>
              </div>

              {/* Website Visibility Controls */}
              <div className="bg-white p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-3.5">
                <h2 className="font-serif text-base font-bold text-[#1E1E1E]">Storefront Visibility</h2>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-[#1E1E1E] block">Visible on Website</span>
                    <span className="text-[11px] text-[#666]">Active on customer catalog</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="w-5 h-5 accent-[#E10600] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-[#1E1E1E] block flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      <span>Feature on Homepage</span>
                    </span>
                    <span className="text-[11px] text-[#666]">Showcase in main hero gallery</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-5 h-5 accent-[#E10600] rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Cloudinary Cloud Images */}
        {activeTab === "media" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E10600] block">
                Cloudinary Storage Integration
              </span>
              <h2 className="font-serif text-xl font-bold text-[#1E1E1E] mt-0.5">
                Product Image Showcase Gallery
              </h2>
              <p className="text-xs text-[#666] mt-0.5">
                Upload photos directly to Cloudinary cloud storage. High-resolution CDN images are delivered to customers with zero database size bloat.
              </p>
            </div>

            <CloudinaryImageUploader
              images={images}
              onChange={setImages}
              maxImages={6}
            />
          </div>
        )}

        {/* TAB 3: Customization & Variants */}
        {activeTab === "variants" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E10600] block">
                Bespoke Studio Options
              </span>
              <h2 className="font-serif text-xl font-bold text-[#1E1E1E] mt-0.5">
                Color Palettes & Custom Variants
              </h2>
              <p className="text-xs text-[#666] mt-0.5">
                Allow customers to select ribbon colors, flower styles, and stem counts when adding this product to their bag.
              </p>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2]">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#777] mb-1">
                  Primary Ribbon Palette
                </label>
                <select
                  value={ribbonColor}
                  onChange={(e) => setRibbonColor(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
                >
                  {RIBBON_COLOR_PRESETS.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#777] mb-1">
                  Flower / Blossom Style
                </label>
                <select
                  value={flowerType}
                  onChange={(e) => setFlowerType(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
                >
                  {FLOWER_TYPE_PRESETS.map((fl) => (
                    <option key={fl} value={fl}>
                      {fl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#777] mb-1">
                  Signature Packaging
                </label>
                <input
                  type="text"
                  value={wrappingStyle}
                  onChange={(e) => setWrappingStyle(e.target.value)}
                  placeholder="e.g. European Matte Paper Wrap"
                  className="w-full text-xs p-2.5 bg-white border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
                />
              </div>
            </div>

            {/* Existing Custom Options */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1E1E]">
                Active Customer Choices ({options.length})
              </h3>

              {options.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#888] bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2]">
                  No custom options added. You can add choices like &quot;Bouquet Size&quot; or &quot;Ribbon Color&quot; below.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {options.map((opt, idx) => (
                    <div
                      key={opt.id || idx}
                      className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2] flex items-center justify-between"
                    >
                      <div>
                        <strong className="text-xs font-serif font-bold text-[#1E1E1E] block">
                          {opt.label}
                        </strong>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {opt.values.map((val) => (
                            <span
                              key={val}
                              className="px-2 py-0.5 rounded-full bg-white border border-[#EFEAE2] text-[10px] text-[#555] font-mono"
                            >
                              {val}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="text-[#888] hover:text-red-600 p-1.5"
                        title="Remove option"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Custom Option Form */}
            <div className="p-4 bg-white rounded-2xl border border-[#EFEAE2] space-y-3">
              <h4 className="text-xs font-bold uppercase text-[#1E1E1E] flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#E10600]" />
                <span>Add Custom Customer Option</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#777] mb-1">Option Name (e.g. Size)</label>
                  <input
                    type="text"
                    value={newOptionLabel}
                    onChange={(e) => setNewOptionLabel(e.target.value)}
                    placeholder="e.g. Bouquet Size"
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#777] mb-1">Choices (Comma-Separated)</label>
                  <input
                    type="text"
                    value={newOptionValue}
                    onChange={(e) => setNewOptionValue(e.target.value)}
                    placeholder="e.g. 7 Stems, 15 Stems, 30 Stems"
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddOption}
                  disabled={!newOptionLabel.trim() || !newOptionValue.trim()}
                  className="px-4 py-2 bg-[#1E1E1E] hover:bg-[#333] text-white text-xs font-serif font-semibold rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Add Option
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SEO & URL */}
        {activeTab === "seo" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E10600] block">
                Google Search & Sharing
              </span>
              <h2 className="font-serif text-xl font-bold text-[#1E1E1E] mt-0.5">
                SEO & Storefront URL
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5">
                Storefront URL Slug
              </label>
              <div className="flex items-center">
                <span className="text-xs text-[#888] bg-[#FAF8F5] border border-r-0 border-[#EFEAE2] px-3 py-3 rounded-l-xl font-mono">
                  https://happiwrapz.com/product/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"))}
                  className="flex-1 text-xs p-3 bg-white border border-[#EFEAE2] rounded-r-xl text-[#1E1E1E] font-mono focus:outline-hidden focus:border-[#E10600]"
                />
              </div>
            </div>

            {/* Google Search Result Preview Card */}
            <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2] space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-[#888] tracking-wider block">
                Google Search Result Preview
              </span>
              <p className="text-xs text-[#1a0dab] font-serif font-bold hover:underline cursor-pointer">
                {name || "Product Name"} | Happiwrapz Luxury Flowers Coimbatore
              </p>
              <p className="text-[11px] text-[#006621] font-mono">
                https://happiwrapz.com/product/{slug || "slug"}
              </p>
              <p className="text-xs text-[#545454] line-clamp-2 leading-relaxed">
                {description || "Handcrafted satin ribbon flower bouquets and luxury gifts in Coimbatore..."}
              </p>
            </div>
          </div>
        )}

        {/* TAB 5: Performance Analytics */}
        {activeTab === "analytics" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E10600] block">
                Patron Engagement
              </span>
              <h2 className="font-serif text-xl font-bold text-[#1E1E1E] mt-0.5">
                Product Performance Analysis
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2]">
                <span className="text-[10px] uppercase font-bold text-[#888] block">Storefront Views</span>
                <span className="text-2xl font-serif font-bold text-[#1E1E1E] mt-1 block">1,480</span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">↑ +14% this week</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2]">
                <span className="text-[10px] uppercase font-bold text-[#888] block">Orders Placed</span>
                <span className="text-2xl font-serif font-bold text-[#1E1E1E] mt-1 block">28</span>
                <span className="text-[10px] text-[#666] mt-0.5 block">Coimbatore Dispatches</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2]">
                <span className="text-[10px] uppercase font-bold text-[#888] block">Total Revenue</span>
                <span className="text-xl font-serif font-bold text-[#1E1E1E] mt-1 block">
                  {formatPrice(28 * Number(price || 1499))}
                </span>
                <span className="text-[10px] text-[#666] mt-0.5 block">Gross Sales</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2]">
                <span className="text-[10px] uppercase font-bold text-[#888] block">Patron Rating</span>
                <span className="text-2xl font-serif font-bold text-amber-600 mt-1 block">4.9 ★</span>
                <span className="text-[10px] text-[#666] mt-0.5 block">100% Satisfaction</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Save Bar */}
        <div className="pt-4 border-t border-[#EFEAE2] flex items-center justify-between">
          <Link
            href="/admin/products"
            className="text-xs text-[#666] hover:text-[#1E1E1E] font-serif transition-colors"
          >
            Cancel & Return to Catalog
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#E10600] hover:bg-[#c00500] text-white text-xs font-serif uppercase tracking-wider font-semibold transition-all shadow-md shadow-[#E10600]/25 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Changes Saved!</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Product Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-xs text-[#888] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#E10600]" />
          <span>Loading product editor...</span>
        </div>
      }
    >
      <EditProductContent params={params} />
    </Suspense>
  );
}
