"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  Search,
  Filter,
  Phone,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  FileText,
  User,
} from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";
import { CustomOrderRequest } from "@/lib/store/types";

export default function AdminCustomOrdersPage() {
  const [customOrders, setCustomOrders] = useState<CustomOrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchCustomOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/custom-orders?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.customOrders)) {
        setCustomOrders(data.customOrders);
      }
    } catch (err) {
      console.error("Custom orders fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomOrders();
  };

  const statusTabs = [
    { label: "All Commissions", value: "all" },
    { label: "New Requests", value: "new" },
    { label: "Under Review", value: "reviewing" },
    { label: "Quote Sent", value: "quote_sent" },
    { label: "In Production", value: "in_production" },
    { label: "Ready / Delivered", value: "delivered" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE2]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-serif uppercase tracking-[0.2em] text-[#E10600] font-semibold mb-1">
            <RibbonEmblem className="w-3.5 h-3.5" />
            <span>Bespoke Custom Commissions</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal">
            Custom Orders & Quotations
          </h1>
          <p className="text-xs text-[#666] mt-0.5">
            Manage personalized ribbon flower arrangements, custom stem counts, luxury keepsake trunks, and quotation workflows.
          </p>
        </div>

        <Link
          href="/catalog?category=Custom+Order"
          target="_blank"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E10600] hover:bg-[#C20500] text-white text-xs font-serif font-semibold uppercase tracking-wider transition-colors shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Studio Request</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white p-4 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.value
                  ? "bg-[#E10600] text-white font-semibold shadow-xs"
                  : "bg-[#FAF8F5] text-[#666] hover:bg-[#F2ECE4] hover:text-[#1E1E1E]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-md pt-2 border-t border-[#EFEAE2]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search custom ref (CUST-...), client, occasion, stems..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-full text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white transition-colors"
          />
        </form>
      </div>

      {/* Custom Orders List Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#888]">Loading custom commissions...</div>
        ) : customOrders.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-[#EFEAE2] text-[#888] space-y-2">
            <RibbonEmblem className="w-8 h-8 mx-auto text-[#CCC]" />
            <p className="font-serif text-sm font-semibold text-[#1E1E1E]">No custom requests found</p>
            <p className="text-xs text-[#888]">Try adjusting your search criteria or status filter.</p>
          </div>
        ) : (
          customOrders.map((custom) => {
            const hasQuote = !!custom.quotation;
            const isConverted = !!custom.convertedOrderId;

            return (
              <div
                key={custom.id}
                className="p-5 sm:p-6 bg-white rounded-3xl border border-[#EFEAE2] shadow-xs hover:border-[#E10600]/40 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EFEAE2]">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="font-mono font-bold text-sm text-[#1E1E1E]">
                      {custom.reference}
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#FAF8F5] border border-[#EFEAE2] text-[#E10600]">
                      {custom.occasion}
                    </span>
                    <span
                      className={`text-[9.5px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        custom.status === "in_production"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : custom.status === "quote_sent"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : custom.status === "delivered"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {custom.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <span className="text-xs text-[#888]">
                    Submitted {formatDate(custom.createdAt)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Client Info */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#888] font-serif tracking-wider">
                      Client Contact
                    </span>
                    <p className="font-bold text-sm text-[#1E1E1E]">{custom.customer?.name}</p>
                    <a
                      href={`https://wa.me/${custom.customer?.phone?.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#25D366] font-medium inline-flex items-center gap-1 hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{custom.customer?.phone}</span>
                    </a>
                    <p className="text-[#666]">{custom.customer?.city}</p>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#888] font-serif tracking-wider">
                      Artisan Specifications
                    </span>
                    <p className="font-semibold text-[#1E1E1E]">
                      {custom.stemCount} Blooms • {custom.productType}
                    </p>
                    <p className="text-[#666] line-clamp-1">{custom.flowerPreferences}</p>
                    {custom.personalizationText && (
                      <p className="text-[#E10600] italic text-[11px] truncate">
                        Ribbon Calligraphy: "{custom.personalizationText}"
                      </p>
                    )}
                  </div>

                  {/* Financial & Delivery */}
                  <div className="space-y-1 md:text-right">
                    <span className="text-[10px] uppercase font-bold text-[#888] font-serif tracking-wider block">
                      Target Budget & Quotation
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-xs text-[#666]">
                        Target Budget: <strong className="text-[#1E1E1E]">{formatPrice(custom.budget)}</strong>
                      </p>
                      {custom.quotation && (
                        <p className="text-sm font-serif font-bold text-[#E10600]">
                          Quoted: {formatPrice(custom.quotation.total)}
                        </p>
                      )}
                      <p className="text-[11px] text-[#888]">
                        Needed: {custom.desiredDeliveryDate}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EFEAE2]">
                  <div className="flex items-center gap-2 text-xs">
                    {isConverted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Converted to Confirmed Order ({custom.convertedOrderId})</span>
                      </span>
                    ) : hasQuote ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Quotation Ready (₹{custom.quotation?.total})</span>
                      </span>
                    ) : (
                      <span className="text-xs text-[#888] italic">
                        Quotation pending assembly
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/admin/custom-orders/${custom.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1E1E1E] hover:bg-[#E10600] text-white text-xs font-serif font-semibold uppercase tracking-wider transition-colors shadow-2xs"
                  >
                    <span>{hasQuote ? "Review Quotation" : "Build Quotation"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
