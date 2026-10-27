"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Sparkles, Upload } from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";

export default function AdminNewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Flower Bouquet");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("1499");
  const [stockQuantity, setStockQuantity] = useState("25");
  const [preparationHours, setPreparationHours] = useState("3");
  const [imageUrl, setImageUrl] = useState("/images/products/rose-bouquet-1.jpg");
  const [inStock, setInStock] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          description: description.trim(),
          price: Number(price),
          images: [imageUrl.trim()],
          inStock,
          stockQuantity: Number(stockQuantity) || 25,
          lowStockThreshold: 8,
          preparationHours: Number(preparationHours) || 3,
          featured: false,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => {
          router.push("/admin/products");
        }, 600);
      } else {
        alert(data.error || "Failed to create product");
      }
    } catch (err) {
      console.error("Create product error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="p-2 rounded-full bg-white border border-[#EFEAE2] hover:border-[#1E1E1E] text-[#1E1E1E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">
            Catalog Creator
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#1E1E1E]">
            Add New Atelier Creation
          </h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-6"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Crimson Glitter Ribbon Rose Bouquet"
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
                <option value="Flower Bouquet">Flower Bouquet</option>
                <option value="Gift Box">Gift Box</option>
                <option value="Gift Hamper">Gift Hamper</option>
                <option value="Gift Wrap">Gift Wrap</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5">
                Display Price (INR) *
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1499"
                className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5">
                Initial Stock Quantity
              </label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5">
                Artisan Prep Time (Hours)
              </label>
              <input
                type="number"
                value={preparationHours}
                onChange={(e) => setPreparationHours(e.target.value)}
                className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5">
              Editorial Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Handcrafted satin ribbon roses folded meticulously by hand. Never wilts or fades..."
              className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5">
              Primary Image Asset *
            </label>
            <select
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
            >
              <option value="/images/products/rose-bouquet-1.jpg">Rose Bouquet — Crimson Classic</option>
              <option value="/images/products/rose-bouquet-2.jpg">Rose Bouquet — Sunflower Sunset</option>
              <option value="/images/products/rose-bouquet-3.jpg">Rose Bouquet — Golden Duet</option>
              <option value="/images/products/glitter-rose-1.jpg">Glitter Luxury Rose — Diamond Edition</option>
              <option value="/images/products/midnight-box-1.jpg">Midnight Velvet Keepsake Box</option>
              <option value="/images/products/hamper-1.jpg">Eternal Ribbon Flower Luxury Hamper</option>
              <option value="/images/products/gift-wrap-1.jpg">Artisanal European Gift Wrap</option>
            </select>
          </div>

          <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EFEAE2] flex items-center justify-between">
            <div>
              <strong className="text-xs text-[#1E1E1E] block">Availability Status</strong>
              <span className="text-[11px] text-[#666666]">
                Make immediately available on customer storefront?
              </span>
            </div>
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="w-5 h-5 rounded text-[#E10600] accent-[#E10600] cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[#EFEAE2] flex justify-end gap-3">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 rounded-full border border-[#EFEAE2] text-xs font-semibold text-[#666] hover:text-[#1E1E1E]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-7 py-2.5 rounded-full bg-[#E10600] hover:bg-[#C20500] text-white text-xs font-serif font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </>
            ) : submitting ? (
              <span>Saving...</span>
            ) : (
              <span>Create Product</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
