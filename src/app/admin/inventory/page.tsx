"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, formatDateTime } from "@/lib/utils";
import {
  Boxes,
  AlertTriangle,
  ArrowUpDown,
  Plus,
  Minus,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  History,
  Download,
} from "lucide-react";
import { Product, InventoryMovement } from "@/lib/store/types";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "low_stock" | "out_of_stock">("all");

  // Adjustment Modal State
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<InventoryMovement["reason"]>("restock");
  const [adjustNote, setAdjustNote] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setMovements(data.movements || []);
      }
    } catch (err) {
      console.error("Inventory fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: adjustingProduct.id,
          change: adjustAmount,
          reason: adjustReason,
          actorName: "Happiwrapz Owner",
          actorRole: "owner",
          referenceId: adjustNote || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAdjustingProduct(null);
        fetchInventory();
      }
    } catch (err) {
      console.error("Adjust error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const qty = p.stockQuantity ?? 0;
    const threshold = p.lowStockThreshold ?? 8;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "low_stock" && qty > 0 && qty <= threshold) ||
      (statusFilter === "out_of_stock" && qty <= 0);

    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const lowStockCount = products.filter(
    (p) => (p.stockQuantity ?? 0) > 0 && (p.stockQuantity ?? 0) <= (p.lowStockThreshold ?? 8)
  ).length;

  const outOfStockCount = products.filter((p) => (p.stockQuantity ?? 0) <= 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE2]">
        <div>
          <span className="text-xs font-semibold tracking-[0.2em] text-[#888888] uppercase">
            Artisan Stock Management
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal mt-0.5">
            Inventory & Ribbon Supplies
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Track prepared satin bouquet stems, packaging boxes, and log all inventory adjustments with audit rationale.
          </p>
        </div>

        <a
          href="/api/admin/analytics?export=products"
          download
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#EFEAE2] text-xs font-serif font-semibold text-[#1E1E1E] hover:border-[#E10600] hover:text-[#E10600] transition-colors shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-[#E10600]" />
          <span>Export Stock Sheet</span>
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs">
          <span className="text-xs text-[#888] font-medium block">Total Active SKUs</span>
          <span className="text-2xl font-serif font-bold text-[#1E1E1E] mt-1 block">
            {products.length}
          </span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === "low_stock" ? "all" : "low_stock")}
          className={`p-5 rounded-3xl border shadow-xs transition-colors cursor-pointer ${
            statusFilter === "low_stock"
              ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-400"
              : "bg-white border-[#EFEAE2] hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-700 font-medium">Low Stock Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-serif font-bold text-amber-700 mt-1 block">
            {lowStockCount} items
          </span>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === "out_of_stock" ? "all" : "out_of_stock")}
          className={`p-5 rounded-3xl border shadow-xs transition-colors cursor-pointer ${
            statusFilter === "out_of_stock"
              ? "bg-red-50/80 border-red-300 ring-2 ring-red-400"
              : "bg-white border-[#EFEAE2] hover:border-red-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-red-700 font-medium">Out of Stock</span>
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-2xl font-serif font-bold text-red-700 mt-1 block">
            {outOfStockCount} items
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 bg-white rounded-3xl border border-[#EFEAE2] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search creations or categories..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-full text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white transition-colors"
          />
        </div>

        {statusFilter !== "all" && (
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className="text-xs text-[#E10600] hover:underline font-semibold"
          >
            Clear Filter (Viewing: {statusFilter.replace(/_/g, " ")})
          </button>
        )}
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-3xl border border-[#EFEAE2] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#EFEAE2] bg-[#FAF8F5] text-[#777] font-serif uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4 text-center">Stock Level</th>
                <th className="py-3.5 px-4 text-center">Threshold</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE4]">
              {filteredProducts.map((p) => {
                const qty = p.stockQuantity ?? 0;
                const threshold = p.lowStockThreshold ?? 8;
                const isOut = qty <= 0;
                const isLow = qty > 0 && qty <= threshold;

                return (
                  <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-[#FAF8F5] shrink-0 border border-[#EFEAE2]">
                        <Image
                          src={p.images?.[0] || "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg"}
                          alt={p.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <span className="font-serif font-bold text-sm text-[#1E1E1E] block">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-[#888] font-mono">{p.slug}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-[#666] font-medium">{p.category}</td>

                    <td className="py-4 px-4 font-serif font-bold text-[#1E1E1E]">
                      {formatPrice(p.price)}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="font-mono font-bold text-sm text-[#1E1E1E]">{qty}</span>
                    </td>

                    <td className="py-4 px-4 text-center font-mono text-[#888]">
                      {threshold}
                    </td>

                    <td className="py-4 px-4">
                      {isOut ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-700 border border-red-200">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Healthy ({qty})
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setAdjustingProduct(p);
                          setAdjustAmount(10);
                          setAdjustReason("restock");
                          setAdjustNote("");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1E1E1E] hover:bg-[#E10600] text-white text-xs font-serif font-semibold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
                      >
                        <ArrowUpDown className="w-3 h-3" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAdjustSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#EFEAE2] shadow-2xl space-y-5 text-xs animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEAE2]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1E1E1E]">Stock Adjustment</h3>
                <p className="text-[11px] text-[#666]">{adjustingProduct.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setAdjustingProduct(null)}
                className="text-xs text-[#888] hover:text-[#1E1E1E]"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2] flex justify-between items-center">
              <span>Current Stock:</span>
              <span className="font-mono text-base font-bold text-[#1E1E1E]">
                {adjustingProduct.stockQuantity ?? 0}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-[#888] block">
                Quantity Change (+ to add, - to subtract)
              </label>
              <input
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-base font-mono font-bold text-[#1E1E1E] text-center focus:outline-hidden focus:border-[#E10600]"
              />
              <p className="text-[10px] text-[#888] text-center">
                New resulting stock:{" "}
                <strong className="text-[#E10600]">
                  {Math.max(0, (adjustingProduct.stockQuantity ?? 0) + adjustAmount)}
                </strong>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-[#888] block">Audit Reason</label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600]"
              >
                <option value="restock">Fresh Handcrafted Restock</option>
                <option value="damage_write_off">Damaged / Flawed Satin Write-Off</option>
                <option value="audit_correction">Manual Physical Count Correction</option>
                <option value="order_fulfillment">Manual Order Allocation</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-[#888] block">Reference Note (Optional)</label>
              <input
                type="text"
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                placeholder="e.g. Batch #2026-OCT or Damage report"
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-full bg-[#E10600] hover:bg-[#C20500] text-white font-serif font-semibold uppercase tracking-wider transition-colors shadow-xs disabled:opacity-50"
              >
                Save Adjustment
              </button>
              <button
                type="button"
                onClick={() => setAdjustingProduct(null)}
                className="px-5 py-3 rounded-full border border-[#EFEAE2] hover:bg-[#FAF8F5] text-[#666]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stock Movement Audit Log Feed */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
        <h2 className="font-serif text-lg font-bold text-[#1E1E1E] flex items-center gap-2">
          <History className="w-4 h-4 text-[#E10600]" />
          <span>Recent Inventory Movement Log</span>
        </h2>

        <div className="divide-y divide-[#F2ECE4]">
          {movements.slice(0, 10).map((m) => (
            <div key={m.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-[#1E1E1E] block">{m.productName}</span>
                <span className="text-[10px] text-[#888]">
                  {m.reason.replace(/_/g, " ")} by {m.actorName} • {formatDateTime(m.timestamp)}
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`font-mono font-bold text-sm ${
                    m.change > 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {m.change > 0 ? `+${m.change}` : m.change}
                </span>
                <span className="text-[10px] text-[#888] block">
                  {m.previousStock} → {m.newStock}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
