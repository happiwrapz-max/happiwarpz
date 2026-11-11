"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Check,
  Sparkles,
  Package,
  Layers,
  Star,
  AlertCircle,
  Eye,
  Plus,
  UploadCloud,
  Loader2,
} from "lucide-react";
import CloudinaryImageUploader from "@/components/admin/CloudinaryImageUploader";
import FlowerTiersEditor from "@/components/admin/FlowerTiersEditor";
import { ProductOption, FlowerCountTier } from "@/lib/store/types";

const BADGE_PRESETS = [
  "None",
  "Bestseller",
  "Valentine's Special",
  "Handcrafted in Coimbatore",
  "New Arrival",
  "Artisan Choice",
  "Limited Edition",
];

const RIBBON_COLOR_PRESETS = [
  "Crimson Red",
  "Golden Sunflower Yellow",
  "Blush Pink",
  "Royal Emerald Green",
  "Midnight Navy",
  "Snow White",
  "Pastel Lavender",
];

const FLOWER_TYPE_PRESETS = [
  "Satin Ribbon Roses",
  "Glitter Luxury Roses",
  "Golden Sunflowers",
  "Mixed Rose & Sunflower Duet",
  "Velvet Keepsake Blossom",
];

export default function AdminNewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Flower Bouquet");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("1499");
  const [comparePrice, setComparePrice] = useState("");
  const [images, setImages] = useState<string[]>(["https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg"]);
  const [inStock, setInStock] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [primaryTag, setPrimaryTag] = useState("None");
  const [flowerType, setFlowerType] = useState("Satin Ribbon Roses");
  const [ribbonColor, setRibbonColor] = useState("Crimson Red");
  const [flowerTiers, setFlowerTiers] = useState<FlowerCountTier[]>([
    { id: "tier-3", count: 3, label: "Petite Keepsake (3 Stems)", price: 599 },
    { id: "tier-5", count: 5, label: "Classic Charm (5 Stems)", price: 899 },
    { id: "tier-7", count: 7, label: "Signature Bouquet (7 Stems)", price: 1199 },
    { id: "tier-10", count: 10, label: "Prestige Grandeur (10 Stems)", price: 1499, isDefault: true },
    { id: "tier-15", count: 15, label: "Luxury Statement (15 Stems)", price: 2199 },
    { id: "tier-20", count: 20, label: "Royal Atelier (20 Stems)", price: 2899 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Available Categories fetched dynamically
  const [categories, setCategories] = useState<string[]>([
    "Flower Bouquet",
    "Gift Box",
    "Gift Hamper",
    "Gift Wrap",
    "Glitter Editions",
    "Wedding & Keepsake",
  ]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/categories");
        const data = await res.json();
        if (data.success && Array.isArray(data.categories)) {
          const catNames = data.categories.map((c: any) => c.name);
          setCategories(Array.from(new Set([...catNames, "Flower Bouquet", "Gift Box", "Gift Hamper"])));
        }
      } catch (err) {
        console.warn("Could not load categories:", err);
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    const numPrice = Number(price);
    if (!name.trim()) {
      setErrorMessage("Please enter a product title.");
      setSubmitting(false);
      return;
    }
    if (!numPrice || numPrice <= 0) {
      setErrorMessage("Please enter a valid price greater than ₹0.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          description: description.trim(),
          price: numPrice,
          compareAtPrice: comparePrice ? Number(comparePrice) : undefined,
          images: images.length ? images : ["https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg"],
          inStock,
          featured,
          tags: primaryTag !== "None" ? [primaryTag] : [],
          flowerType,
          ribbonColor,
          flowerTiers: flowerTiers.map((t) => ({
            ...t,
            count: Number(t.count),
            price: Number(t.price),
          })),
          stockQuantity: 999,
          lowStockThreshold: 0,
          preparationHours: 3,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaved(true);
        setTimeout(() => {
          router.push("/admin/products");
        }, 800);
      } else {
        setErrorMessage(data.error || "Failed to create product");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to reach server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-6xl">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EFEAE2]">
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
              <span>Catalog Creator</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1E1E]">
              Add New Product
            </h1>
          </div>
        </div>

        <Link
          href="/admin/products"
          className="text-xs text-[#666] hover:text-[#1E1E1E] underline underline-offset-4 hidden sm:block"
        >
          Back to Catalog
        </Link>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Product Info (Left Column: 7 of 12) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6 min-w-0">
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
              <h2 className="font-serif text-base font-bold text-[#1E1E1E]">Product Details</h2>

              <div>
                <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Crimson Ribbon Rose Bouquet"
                  className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white"
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
                    className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600]"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
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
                    className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
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
                  Description & Details *
                </label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Handcrafted satin ribbon roses folded meticulously by hand. Never wilts or fades — bringing eternal warmth, luxury, and devotion..."
                  className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white resize-none"
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
              <h2 className="font-serif text-base font-bold text-[#1E1E1E]">Pricing</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5">
                    Selling Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1499"
                    className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] font-serif font-bold text-sm focus:outline-hidden focus:border-[#E10600]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5">
                    Original Price / MRP (₹ INR) <span className="text-[#888] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(e.target.value)}
                    placeholder="e.g. 1999 (shows strikethrough)"
                    className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
                  />
                </div>
              </div>
            </div>

            {/* Stem Count & Tiered Pricing Section */}
            <FlowerTiersEditor
              basePrice={Number(price) || 1499}
              tiers={flowerTiers}
              onChange={setFlowerTiers}
            />

            {/* Ribbon Style & Flower Palette */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
              <h2 className="font-serif text-base font-bold text-[#1E1E1E]">Artisan Floral Style</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5">
                    Ribbon Color
                  </label>
                  <select
                    value={ribbonColor}
                    onChange={(e) => setRibbonColor(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
                  >
                    {RIBBON_COLOR_PRESETS.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5">
                    Flower / Petal Type
                  </label>
                  <select
                    value={flowerType}
                    onChange={(e) => setFlowerType(e.target.value)}
                    className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
                  >
                    {FLOWER_TYPE_PRESETS.map((fl) => (
                      <option key={fl} value={fl}>
                        {fl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Cloudinary Images, Visibility) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 min-w-0">
            {/* Cloudinary Cloud Storage Image Uploader */}
            <div className="bg-white p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
              <h2 className="font-serif text-base font-bold text-[#1E1E1E]">Product Photos</h2>

              <CloudinaryImageUploader
                images={images}
                onChange={setImages}
                maxImages={6}
              />
            </div>

            {/* Visibility Settings */}
            <div className="bg-white p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
              <h2 className="font-serif text-base font-bold text-[#1E1E1E]">Website Display</h2>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-[#1E1E1E] block">Visible on Website</span>
                  <span className="text-[11px] text-[#666]">Display immediately to customers</span>
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
                  <span className="text-[11px] text-[#666]">Promote on the main page</span>
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

        {/* Action Bar */}
        <div className="pt-4 border-t border-[#EFEAE2] flex items-center justify-end gap-3">
          <Link
            href="/admin/products"
            className="px-6 py-2.5 rounded-full border border-[#EFEAE2] text-xs font-serif font-semibold text-[#666] hover:text-[#1E1E1E] transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-2.5 rounded-full bg-[#E10600] hover:bg-[#C20500] text-white text-xs font-serif font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Product Added!</span>
              </>
            ) : submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Product...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Publish Product</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
