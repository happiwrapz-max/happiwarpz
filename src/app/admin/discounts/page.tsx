"use client";

import { useState, useEffect } from "react";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  Tag,
  Plus,
  Percent,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  Trash2,
  Power,
  Copy,
  Check,
} from "lucide-react";
import { Coupon } from "@/lib/store/types";

export default function AdminDiscountsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Coupon Form State
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("10");
  const [minOrder, setMinOrder] = useState("1499");
  const [maxDiscount, setMaxDiscount] = useState("300");
  const [usageLimit, setUsageLimit] = useState("200");
  const [validUntil, setValidUntil] = useState("2026-12-31");
  const [category, setCategory] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/discounts");
      const data = await res.json();
      if (data.success && Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
      }
    } catch (err) {
      console.error("Coupons fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !value) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          type,
          value: Number(value),
          minOrderAmount: Number(minOrder),
          maxDiscountAmount: type === "percentage" && maxDiscount ? Number(maxDiscount) : undefined,
          usageLimit: Number(usageLimit) || 100,
          validFrom: new Date().toISOString(),
          validUntil: new Date(`${validUntil}T23:59:59.000Z`).toISOString(),
          active: true,
          applicableCategory: category,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setCode("");
        fetchCoupons();
      } else {
        alert(data.error || "Failed to create coupon");
      }
    } catch (err) {
      console.error("Create coupon error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/admin/discounts/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !coupon.active }),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, active: !c.active } : c))
        );
      }
    } catch (err) {
      console.warn("Toggle active error:", err);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/discounts/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.warn("Delete coupon error:", err);
    }
  };

  const handleCopyCode = (c: Coupon) => {
    navigator.clipboard.writeText(c.code);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE2]">
        <div>
          <span className="text-xs font-semibold tracking-[0.2em] text-[#888888] uppercase">
            Promotional Engine
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal mt-0.5">
            Discounts & Coupons
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Manage promotional coupon codes, percentage rules, minimum purchase amounts, and usage caps.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E10600] hover:bg-[#C20500] text-white text-xs font-serif font-semibold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-xs text-[#888]">Loading promotions...</div>
        ) : coupons.length === 0 ? (
          <div className="col-span-3 p-16 text-center bg-white rounded-3xl border border-[#EFEAE2] text-[#888]">
            <Tag className="w-8 h-8 mx-auto mb-2 text-[#CCC]" />
            <p className="font-serif text-sm font-semibold text-[#1E1E1E]">No promotional coupons active</p>
          </div>
        ) : (
          coupons.map((coupon) => {
            const isPercentage = coupon.type === "percentage";
            const isExpired = new Date(coupon.validUntil).getTime() < Date.now();

            return (
              <div
                key={coupon.id}
                className={`p-6 rounded-3xl border shadow-xs space-y-4 transition-all bg-white ${
                  !coupon.active || isExpired ? "opacity-60 border-[#EFEAE2]" : "border-[#EFEAE2] hover:border-[#E10600]/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleCopyCode(coupon)}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2] font-mono text-sm font-bold text-[#E10600] hover:bg-[#FFF0F0] transition-colors cursor-pointer"
                    title="Click to copy code"
                  >
                    <span>{coupon.code}</span>
                    {copiedId === coupon.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#AAA]" />
                    )}
                  </button>

                  <span
                    className={`text-[9.5px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      coupon.active && !isExpired
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {isExpired ? "Expired" : coupon.active ? "Active" : "Paused"}
                  </span>
                </div>

                <div>
                  <span className="font-serif text-2xl font-bold text-[#1E1E1E] block">
                    {isPercentage ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                  </span>
                  <p className="text-xs text-[#666] mt-0.5">
                    Min spend: <strong>{formatPrice(coupon.minOrderAmount)}</strong>
                    {coupon.maxDiscountAmount ? ` • Max cap: ${formatPrice(coupon.maxDiscountAmount)}` : ""}
                  </p>
                </div>

                <div className="space-y-1 text-[11px] text-[#777] pt-2 border-t border-[#EFEAE2]">
                  <div className="flex justify-between">
                    <span>Usage:</span>
                    <strong className="text-[#1E1E1E]">{coupon.usedCount} of {coupon.usageLimit} redeemed</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Expires:</span>
                    <span className="text-[#1E1E1E]">{formatDate(coupon.validUntil)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span className="capitalize text-[#1E1E1E]">{coupon.applicableCategory || "Storewide"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#EFEAE2]">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(coupon)}
                    className="text-xs font-semibold text-[#666] hover:text-[#1E1E1E] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Power className={`w-3.5 h-3.5 ${coupon.active ? "text-emerald-600" : "text-gray-400"}`} />
                    <span>{coupon.active ? "Deactivate" : "Activate"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCoupon(coupon.id)}
                    className="p-1 text-[#AAA] hover:text-red-600 transition-colors cursor-pointer"
                    title="Delete coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCoupon}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#EFEAE2] shadow-2xl space-y-4 text-xs animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEAE2]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1E1E1E]">Create New Coupon</h3>
                <p className="text-[11px] text-[#666]">Configure promotional campaign discount rules</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-xs text-[#888] hover:text-[#1E1E1E]"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#888] block">Coupon Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. ANNIVERSARY15 or DIWALI500"
                required
                className="w-full px-3.5 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl font-mono uppercase font-bold text-[#E10600] focus:outline-hidden focus:border-[#E10600]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#888] block">Discount Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#888] block">
                  {type === "percentage" ? "Percent Off" : "Rupees Off"}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#888] block">Min Order (₹)</label>
                <input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#888] block">Max Discount Cap (₹)</label>
                <input
                  type="number"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#888] block">Usage Limit</label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#888] block">Expiration Date</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-full bg-[#E10600] hover:bg-[#C20500] text-white font-serif font-semibold uppercase tracking-wider text-xs transition-colors shadow-xs disabled:opacity-50"
              >
                Create Coupon
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-3 rounded-full border border-[#EFEAE2] hover:bg-[#FAF8F5] text-[#666]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
