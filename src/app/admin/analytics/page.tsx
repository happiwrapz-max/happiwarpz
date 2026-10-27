"use client";

import { useState, useEffect } from "react";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  ShoppingBag,
  Users,
  Award,
  RefreshCw,
  Layers,
  ArrowRight,
  Package,
} from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/dashboard?period=${period}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const kpis = data?.kpis || {
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    bestSeller: { name: "N/A", units: 0, revenue: 0 },
  };

  const revenueOverTime = data?.revenueOverTime || [];
  const revenueByCategory = data?.revenueByCategory || [];
  const customFunnel = data?.customOrderFunnel || { totalRequests: 0, quotesSent: 0, accepted: 0, conversionRate: 0 };
  const maxRevenue = Math.max(...revenueOverTime.map((r: any) => r.revenue), 1000);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE2]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-serif uppercase tracking-[0.2em] text-[#E10600] font-semibold mb-1">
            <RibbonEmblem className="w-3.5 h-3.5" />
            <span>Store Performance Metrics</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal">
            Analytics & Financial Reports
          </h1>
          <p className="text-xs text-[#666] mt-0.5">
            Aggregated revenue, category performance, conversion funnels, and CSV reports based on real order records.
          </p>
        </div>

        {/* Date Selector & Refresh */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center bg-white border border-[#EFEAE2] rounded-full p-1 shadow-2xs">
            {[
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "this_year", label: "This Year" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-serif font-medium transition-all cursor-pointer ${
                  period === p.id
                    ? "bg-[#E10600] text-white shadow-xs font-semibold"
                    : "text-[#666] hover:text-[#1E1E1E]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchAnalytics}
            title="Refresh Analytics"
            className="p-2.5 rounded-full bg-white border border-[#EFEAE2] text-[#666] hover:text-[#E10600] transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#E10600]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Export Reports Bar */}
      <div className="p-5 bg-white rounded-3xl border border-[#EFEAE2] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-sm font-bold text-[#1E1E1E]">
            Download Official Business CSV Reports
          </h3>
          <p className="text-xs text-[#777]">
            Clean CSV spreadsheets ready for bookkeeping, accounting audits, and stock replenishment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/admin/analytics?export=orders"
            download
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] text-xs font-serif font-semibold text-[#1E1E1E] hover:border-[#E10600] hover:text-[#E10600] transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#E10600]" />
            <span>Orders CSV</span>
          </a>

          <a
            href="/api/admin/analytics?export=products"
            download
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] text-xs font-serif font-semibold text-[#1E1E1E] hover:border-[#E10600] hover:text-[#E10600] transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#E10600]" />
            <span>Inventory CSV</span>
          </a>

          <a
            href="/api/admin/analytics?export=customers"
            download
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] text-xs font-serif font-semibold text-[#1E1E1E] hover:border-[#E10600] hover:text-[#E10600] transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#E10600]" />
            <span>Customers CSV</span>
          </a>
        </div>
      </div>

      {/* Key Financial Totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs">
          <span className="text-xs text-[#777] font-medium block">Total Net Revenue</span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1E1E] mt-1 block">
            {formatPrice(kpis.totalRevenue)}
          </span>
          <p className="text-[11px] text-[#059669] mt-1 font-medium">Excludes cancellations</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs">
          <span className="text-xs text-[#777] font-medium block">Average Order Value</span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1E1E] mt-1 block">
            {formatPrice(kpis.averageOrderValue)}
          </span>
          <p className="text-[11px] text-[#666] mt-1 font-medium">Per confirmed customer</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs">
          <span className="text-xs text-[#777] font-medium block">Fulfillment Success</span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-emerald-600 mt-1 block">
            {kpis.totalOrders > 0
              ? Math.round((kpis.completedOrders / kpis.totalOrders) * 100)
              : 0}
            %
          </span>
          <p className="text-[11px] text-[#666] mt-1 font-medium">
            {kpis.completedOrders} of {kpis.totalOrders} fulfilled
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs">
          <span className="text-xs text-[#777] font-medium block">Custom Conversion</span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-[#E10600] mt-1 block">
            {customFunnel.conversionRate}%
          </span>
          <p className="text-[11px] text-[#666] mt-1 font-medium">
            {customFunnel.accepted} converted to orders
          </p>
        </div>
      </div>

      {/* Revenue Over Time Interactive Bar Chart */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#1E1E1E]">
              Sales Trajectory ({period.toUpperCase()})
            </h2>
            <p className="text-xs text-[#777]">
              Recognized revenue by calendar date
            </p>
          </div>
          <span className="font-serif font-bold text-base text-[#E10600]">
            {formatPrice(kpis.totalRevenue)}
          </span>
        </div>

        <div className="pt-4 h-64 flex items-end gap-2 border-b border-[#EFEAE2] pb-2">
          {revenueOverTime.map((pt: any) => {
            const heightPercent = Math.max(6, Math.round((pt.revenue / maxRevenue) * 100));
            return (
              <div key={pt.date} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                <div className="absolute -top-10 bg-[#1E1E1E] text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-md">
                  {formatPrice(pt.revenue)} ({pt.orders} orders)
                </div>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[32px] rounded-t-md transition-all duration-300 ${
                    pt.revenue > 0 ? "bg-[#E10600] group-hover:bg-[#C20500]" : "bg-[#EFEAE2]"
                  }`}
                />
                <span className="text-[9px] text-[#888] mt-2 truncate max-w-full">
                  {pt.date.split("-").slice(1).join("/")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: Revenue by Category & Custom Order Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#1E1E1E]">
            Revenue by Product Category
          </h2>

          <div className="space-y-3 pt-2">
            {revenueByCategory.length === 0 ? (
              <p className="text-xs text-[#888] py-8 text-center">No category data recorded.</p>
            ) : (
              revenueByCategory.map((cat: any) => {
                const pct = kpis.totalRevenue > 0 ? Math.round((cat.revenue / kpis.totalRevenue) * 100) : 0;
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[#1E1E1E]">{cat.category}</span>
                      <span className="font-mono font-bold text-[#E10600]">
                        {formatPrice(cat.revenue)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#FAF8F5] overflow-hidden border border-[#EFEAE2]">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full rounded-full bg-[#E10600]"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Custom Order Conversion Funnel */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#1E1E1E]">
            Bespoke Commission Funnel
          </h2>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] flex justify-between items-center">
              <div>
                <span className="font-bold text-[#1E1E1E] block">1. Total Inquiries & Commissions</span>
                <span className="text-[#666] text-[11px]">Submitted by website clientele</span>
              </div>
              <span className="font-serif text-lg font-bold text-[#1E1E1E]">
                {customFunnel.totalRequests}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex justify-between items-center text-amber-950">
              <div>
                <span className="font-bold block">2. Formal Quotations Sent</span>
                <span className="text-amber-800 text-[11px]">Pricing assembled and delivered via WhatsApp</span>
              </div>
              <span className="font-serif text-lg font-bold text-amber-700">
                {customFunnel.quotesSent}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex justify-between items-center text-emerald-950">
              <div>
                <span className="font-bold block">3. Converted to Confirmed Orders</span>
                <span className="text-emerald-800 text-[11px]">Accepted quotations in studio production</span>
              </div>
              <span className="font-serif text-lg font-bold text-emerald-700">
                {customFunnel.accepted}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
