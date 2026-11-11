"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import {
  Edit2,
  Search,
  Trash2,
  ExternalLink,
  Copy,
  Star,
  ArrowUpDown,
  RefreshCw,
  Filter,
  CheckCircle2,
  Package,
  X,
} from "lucide-react";
import { Product } from "@/lib/store/types";

const STUDIO_CATEGORIES = [
  "Flower Bouquet",
  "Gift Box",
  "Gift Hamper",
  "Glitter Editions",
  "Wedding & Keepsake",
  "Gift Wrap",
  "Flower Boxes",
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "name_asc">("default");

  // Dynamic categories
  const [categories, setCategories] = useState<string[]>(STUDIO_CATEGORIES);

  // Toast notification
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);

        // Fetch categories dynamically
        try {
          const catRes = await fetch("/api/admin/categories");
          const catData = await catRes.json();
          if (catData.success && Array.isArray(catData.categories)) {
            const catNames = catData.categories.map((c: any) => c.name);
            const combined = Array.from(
              new Set([
                ...STUDIO_CATEGORIES,
                ...catNames,
                ...data.products.map((p: Product) => p.category),
              ])
            );
            setCategories(combined);
          } else {
            const combined = Array.from(
              new Set([
                ...STUDIO_CATEGORIES,
                ...data.products.map((p: Product) => p.category),
              ])
            );
            setCategories(combined);
          }
        } catch {
          const combined = Array.from(
            new Set([
              ...STUDIO_CATEGORIES,
              ...data.products.map((p: Product) => p.category),
            ])
          );
          setCategories(combined);
        }
      }
    } catch (err) {
      console.error("Products fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Toggle Visibility on website (inStock flag)
  const toggleVisibility = async (p: Product) => {
    const newStatus = !p.inStock;
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, inStock: newStatus } : item))
        );
        showNotification(
          `"${p.name}" is now ${newStatus ? "visible on the website" : "hidden (draft)"}.`
        );
      }
    } catch (err) {
      console.warn("Toggle visibility error:", err);
    }
  };

  // Toggle Featured on Homepage
  const toggleFeatured = async (p: Product) => {
    const newFeatured = !p.featured;
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: newFeatured }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, featured: newFeatured } : item))
        );
        showNotification(
          `"${p.name}" ${newFeatured ? "featured on homepage" : "removed from featured"}.`
        );
      }
    } catch (err) {
      console.warn("Toggle featured error:", err);
    }
  };

  // Duplicate / Clone Product
  const handleDuplicate = async (p: Product) => {
    const copyName = `${p.name} (Copy)`;
    const copySlug = `${p.slug}-copy-${Date.now().toString(36).slice(-4)}`;

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: copyName,
          slug: copySlug,
          category: p.category,
          description: p.description,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          images: p.images || [],
          inStock: p.inStock,
          featured: false,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.product) {
        setProducts((prev) => [data.product, ...prev]);
        showNotification(`Created duplicate product "${copyName}".`);
      }
    } catch (err) {
      console.error("Duplicate product error:", err);
    }
  };

  // Delete / Archive Product
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from your catalog?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts((prev) => prev.filter((item) => item.id !== id));
        showNotification(`"${name}" has been removed.`);
      }
    } catch (err) {
      console.warn("Delete product error:", err);
    }
  };

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (categoryFilter !== "all") {
      result = result.filter((p) => p.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          String(p.price).includes(q)
      );
    }

    // Sorting
    if (sortBy === "price_asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name_asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, categoryFilter, search, sortBy]);

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E1E1E] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 text-xs font-serif animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Unified Catalog Card */}
      <div className="bg-white rounded-3xl border border-[#EFEAE2] shadow-xs overflow-hidden">
        
        {/* Top Controls: Search Input & Sort Selector */}
        <div className="p-4 sm:p-5 border-b border-[#F2ECE4] flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
            <input
              type="text"
              placeholder="Search product title, category, or price..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-full text-[#1E1E1E] placeholder:text-[#999] focus:outline-hidden focus:border-[#E10600] focus:bg-white transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#1E1E1E]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-[10px] text-[#888] font-serif font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-[#888]" />
              <span>SORT:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-full px-3.5 py-1.5 text-[#1E1E1E] font-medium focus:outline-hidden focus:border-[#E10600] cursor-pointer"
            >
              <option value="default">Default Catalog Order</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Chips Bar */}
        <div className="px-4 sm:px-6 py-3 border-b border-[#F2ECE4] flex items-center gap-2 overflow-x-auto scrollbar-none bg-[#FCFBF8]/60">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-[#888] tracking-wider shrink-0 mr-1">
            <Filter className="w-3 h-3 text-[#888]" />
            <span>CATEGORY:</span>
          </div>

          {/* All Categories Chip */}
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-serif transition-colors whitespace-nowrap cursor-pointer ${
              categoryFilter === "all"
                ? "bg-[#1E1E1E] text-white font-semibold shadow-xs"
                : "bg-[#FAF8F5] text-[#666] hover:bg-[#F2ECE4] border border-[#EFEAE2]"
            }`}
          >
            All Categories ({products.length})
          </button>

          {/* Category Chips */}
          {categories.map((cat) => {
            const count = products.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-serif transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-[#1E1E1E] text-white font-semibold shadow-xs"
                    : "bg-[#FAF8F5] text-[#666] hover:bg-[#F2ECE4] border border-[#EFEAE2]"
                }`}
              >
                <span>{cat}</span>
                <span className="text-[10px] opacity-70 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Product Cards (< md) */}
        <div className="block md:hidden divide-y divide-[#F2ECE4]">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#888]">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#E10600] mb-2" />
              <span>Loading creations...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#888] space-y-2">
              <Package className="w-8 h-8 text-[#CCC] mx-auto" />
              <p className="font-semibold text-[#1E1E1E]">No products match criteria</p>
              <p className="text-[11px] text-[#888]">Try adjusting search or category filter.</p>
            </div>
          ) : (
            filteredProducts.map((item) => (
              <div key={item.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden relative bg-[#FAF8F5] border border-[#EFEAE2] shrink-0">
                    <Image
                      src={item.images?.[0] || "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/admin/products/${item.id}`}
                        className="font-serif font-bold text-sm text-[#1E1E1E] hover:text-[#E10600] truncate block"
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleFeatured(item)}
                        className="p-1 rounded-md text-xs cursor-pointer text-amber-500"
                        title="Toggle Featured"
                      >
                        <Star className={`w-3.5 h-3.5 ${item.featured ? "fill-amber-400 text-amber-500" : "text-[#CCC]"}`} />
                      </button>
                    </div>

                    <p className="text-[11px] text-[#777] line-clamp-1 mt-0.5">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-serif font-bold text-sm text-[#1E1E1E]">
                        {formatPrice(item.price)}
                      </span>
                      <span className="text-[11px] text-[#888] font-serif">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE4] text-xs">
                  {/* Visibility Button */}
                  <button
                    type="button"
                    onClick={() => toggleVisibility(item)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${
                      item.inStock
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-[#F5F2EB] text-[#777] border border-[#E2DDD3]"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${item.inStock ? "bg-emerald-500" : "bg-[#999]"}`} />
                    <span>{item.inStock ? "Visible on Website" : "Hidden (Draft)"}</span>
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/products/${item.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#EFEAE2] hover:border-[#1E1E1E] rounded-full text-xs font-serif font-semibold"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(item)}
                      className="p-1.5 rounded-lg border border-[#EFEAE2] text-[#888] hover:bg-[#FAF8F5]"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <Link
                      href={`/product/${item.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg border border-[#EFEAE2] text-[#888] hover:text-[#E10600] hover:bg-[#FAF8F5]"
                      title="View Storefront"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-1.5 rounded-lg border border-[#EFEAE2] text-[#AAA] hover:text-red-600 hover:bg-[#FAF8F5]"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Product Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#F2ECE4] bg-white text-[#888] font-serif uppercase tracking-wider text-[10px]">
                <th className="py-4 px-6 font-bold">PRODUCT</th>
                <th className="py-4 px-4 font-bold">CATEGORY</th>
                <th className="py-4 px-4 font-bold">DISPLAY PRICE</th>
                <th className="py-4 px-4 font-bold">WEBSITE DISPLAY</th>
                <th className="py-4 px-4 text-center font-bold">FEATURED</th>
                <th className="py-4 px-6 text-right font-bold">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE4]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#888]">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#E10600] mb-2" />
                    <span>Loading products...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#888] space-y-2">
                    <Package className="w-8 h-8 text-[#CCC] mx-auto mb-1" />
                    <p className="font-semibold text-sm text-[#1E1E1E]">No products match current criteria</p>
                    <p className="text-xs text-[#888]">Try resetting search or category filter.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F5]/80 transition-colors group">
                    {/* Thumbnail & Product Details */}
                    <td className="py-4 px-6 flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-[#FAF8F5] border border-[#EFEAE2] shrink-0 group-hover:shadow-xs transition-shadow">
                        <Image
                          src={item.images?.[0] || "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${item.id}`}
                          className="font-serif font-bold text-sm text-[#1E1E1E] hover:text-[#E10600] transition-colors truncate block"
                          title="Click to edit product"
                        >
                          {item.name}
                        </Link>
                        <p className="text-[11px] text-[#777] line-clamp-1 max-w-sm mt-0.5 font-sans">
                          {item.description}
                        </p>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      <span className="text-xs text-[#555] font-serif whitespace-nowrap">
                        {item.category}
                      </span>
                    </td>

                    {/* Display Price */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-serif font-bold text-sm text-[#1E1E1E]">
                          {formatPrice(item.price)}
                        </span>
                        <span className="text-[10px] text-[#888] font-serif">
                          {item.compareAtPrice ? (
                            <span className="line-through text-[#AAA]">{formatPrice(item.compareAtPrice)}</span>
                          ) : (
                            "item"
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Website Display Status Toggle */}
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => toggleVisibility(item)}
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-medium cursor-pointer transition-colors ${
                          item.inStock
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-[#F5F2EB] text-[#777] border border-[#E2DDD3] hover:bg-[#EAE4D8]"
                        }`}
                        title="Click to toggle between Visible and Hidden on website"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            item.inStock ? "bg-emerald-500" : "bg-[#999]"
                          }`}
                        />
                        <div className="flex flex-col text-left leading-tight">
                          <span>Visible on</span>
                          <span className="font-semibold">{item.inStock ? "Website" : "Hidden"}</span>
                        </div>
                      </button>
                    </td>

                    {/* Featured on Homepage */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleFeatured(item)}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          item.featured
                            ? "border-amber-200 text-amber-500 hover:text-amber-600 bg-amber-50/50"
                            : "border-transparent text-[#DDD] hover:text-[#888]"
                        }`}
                        title={item.featured ? "Featured on Homepage" : "Click to feature on Homepage"}
                      >
                        <Star className={`w-4 h-4 ${item.featured ? "fill-amber-400 text-amber-500" : ""}`} />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        {/* Direct Edit Product */}
                        <Link
                          href={`/admin/products/${item.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white hover:bg-[#1E1E1E] hover:text-white text-[#1E1E1E] border border-[#EFEAE2] hover:border-[#1E1E1E] rounded-full transition-all shadow-2xs font-serif font-bold text-xs"
                          title="Edit product details"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </Link>

                        {/* Secondary Actions Row */}
                        <div className="flex items-center gap-1">
                          {/* Duplicate Product */}
                          <button
                            type="button"
                            onClick={() => handleDuplicate(item)}
                            className="p-1 rounded-lg border border-[#EFEAE2] text-[#888] hover:text-[#1E1E1E] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                            title="Duplicate Creation"
                          >
                            <Copy className="w-3 h-3" />
                          </button>

                          {/* View on Live Storefront */}
                          <Link
                            href={`/product/${item.slug}`}
                            target="_blank"
                            className="p-1 rounded-lg border border-[#EFEAE2] text-[#888] hover:text-[#E10600] hover:bg-[#FAF8F5] transition-colors"
                            title="View Live Storefront Page"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>

                          {/* Delete / Archive */}
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-1 rounded-lg border border-[#EFEAE2] text-[#AAA] hover:text-red-600 hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                            title="Remove Product"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
