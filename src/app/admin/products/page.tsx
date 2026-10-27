"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Plus, Edit2, Check, X, Search, Trash2, Power, Download } from "lucide-react";
import { Product } from "@/lib/store/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
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

  const toggleStock = async (p: Product) => {
    try {
      const res = await fetch(`/api/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: !p.inStock }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, inStock: !item.inStock } : item))
        );
      }
    } catch (err) {
      console.warn("Toggle stock error:", err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to archive "${name}"? Historical orders will be preserved.`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.warn("Delete product error:", err);
    }
  };

  const filtered = products.filter((p) => {
    const matchesCat = categoryFilter === "all" || p.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE2]">
        <div>
          <span className="text-xs font-semibold tracking-[0.2em] text-[#888888] uppercase">
            Artisan Catalog Management
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal mt-0.5">
            Products & Atelier Creations
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Manage handcrafted satin ribbon roses, golden sunflowers, velvet keepsake boxes, and luxury gift hampers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#E10600] hover:bg-[#C20500] text-white px-5 py-2.5 text-xs font-serif font-semibold uppercase tracking-wider transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Creation</span>
          </Link>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="p-4 bg-white rounded-3xl border border-[#EFEAE2] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
          <input
            type="text"
            placeholder="Search products, descriptions, or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-full text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {["all", "Flower Bouquet", "Gift Box", "Gift Hamper", "Gift Wrap"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-serif transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? "bg-[#1E1E1E] text-white font-semibold"
                  : "bg-[#FAF8F5] text-[#666] hover:bg-[#F2ECE4]"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Products Cards (Screens < md) */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-[#EFEAE2] text-xs text-[#888]">
            Loading catalog...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-[#EFEAE2] text-xs text-[#888]">
            No creations found.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#EFEAE2] p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden relative bg-[#FAF8F5] border border-[#EFEAE2] shrink-0">
                  <Image
                    src={item.images?.[0] || "/images/products/rose-bouquet-1.jpg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.slug}`}
                    target="_blank"
                    className="font-serif font-bold text-sm text-[#1E1E1E] hover:text-[#E10600] truncate block"
                  >
                    {item.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-serif font-bold text-sm text-[#E10600]">
                      {formatPrice(item.price)}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] text-[#666]">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#EFEAE2] text-xs">
                <span className="font-mono text-[11px] text-[#777]">
                  Stock: <strong className="text-[#1E1E1E]">{item.stockQuantity ?? 25}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleStock(item)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                      item.inStock
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {item.inStock ? "In Stock" : "Sold Out"}
                  </button>

                  <Link
                    href={`/admin/products/${item.id}`}
                    className="p-1.5 rounded-lg border border-[#EFEAE2] text-[#666] hover:text-[#1E1E1E]"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-1.5 rounded-lg border border-[#EFEAE2] text-[#888] hover:text-[#E10600]"
                    title="Archive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Product Table (Screens >= md) */}
      <div className="hidden md:block bg-white rounded-3xl border border-[#EFEAE2] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#EFEAE2] bg-[#FAF8F5] text-[#777] font-serif uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE4]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#888]">
                    Loading catalog products...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#888]">
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-[#FAF8F5] border border-[#EFEAE2] shrink-0">
                        <Image
                          src={item.images?.[0] || "/images/products/rose-bouquet-1.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/product/${item.slug}`}
                          target="_blank"
                          className="font-serif font-bold text-sm text-[#1E1E1E] hover:text-[#E10600] transition-colors truncate block"
                        >
                          {item.name}
                        </Link>
                        <span className="text-[10px] text-[#888] font-mono">{item.slug}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] text-[#666] text-[11px] font-medium">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-serif font-bold text-sm text-[#1E1E1E]">
                      {formatPrice(item.price)}
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-xs text-[#1E1E1E]">
                      {item.stockQuantity ?? 25} blooms
                    </td>

                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => toggleStock(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          item.inStock
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {item.inStock ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3 text-red-600" />
                            <span>Sold Out</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        href={`/product/${item.slug}`}
                        target="_blank"
                        className="inline-flex items-center p-1.5 text-[#888] hover:text-[#E10600] border border-[#EFEAE2] rounded-lg transition-colors"
                        title="View Live PDP"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.name)}
                        className="inline-flex items-center p-1.5 text-[#AAA] hover:text-red-600 border border-[#EFEAE2] rounded-lg transition-colors cursor-pointer"
                        title="Archive product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
