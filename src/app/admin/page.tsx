"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Users,
  DollarSign,
  Award,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Package,
  Layers,
  Sparkles,
  Plus,
  ExternalLink,
  ChevronRight,
  Boxes,
} from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/dashboard?period=${period}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const kpis = data?.kpis || {
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    bestSeller: { name: "Handcrafted Ribbon Rose Bouquet", units: 18, revenue: 26982 },
  };

  const revenueOverTime = data?.revenueOverTime || [];
  const ordersByStatus = data?.ordersByStatus || [];
  const customFunnel = data?.customOrderFunnel || { totalRequests: 0, quotesSent: 0, accepted: 0, conversionRate: 0 };
  const lowStockItems = data?.lowStockItems || [];
  const recentOrders = data?.recentOrders || [];

  const maxRevenue = Math.max(...revenueOverTime.map((r: any) => r.revenue), 1000);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* ── 1. Top Executive Header & Filter Controls ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#EFEAE2]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#E10600] mb-1">
            <RibbonEmblem className="w-3.5 h-3.5" />
            <span>Coimbatore Artisan Studio</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1E1E1E] font-bold tracking-tight">
            Executive Atelier Dashboard
          </h1>
          <p className="text-xs text-[#666] mt-0.5">
            Monitor real-time sales, live bouquet dispatches, and bespoke commissions in Coimbatore.
          </p>
        </div>

        {/* Quick Period Tabs + Refresh Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="inline-flex items-center bg-white border border-[#EFEAE2] rounded-full p-1 shadow-2xs">
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "this_year", label: "This Year" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-serif font-semibold transition-all cursor-pointer ${
                  period === p.id
                    ? "bg-[#E10600] text-white shadow-xs"
                    : "text-[#666] hover:text-[#1E1E1E] hover:bg-[#FAF8F5]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchDashboardData}
            title="Refresh Dashboard"
            className="p-2.5 rounded-full bg-white border border-[#EFEAE2] text-[#666] hover:text-[#E10600] hover:border-[#E10600] transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#E10600]" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── 2. Studio Quick Actions Bar ── */}
      <div className="p-4 bg-white rounded-3xl border border-[#EFEAE2] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#1E1E1E]">
          <Sparkles className="w-4 h-4 text-[#E10600]" />
          <span>Quick Atelier Shortcuts:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E10600] text-white hover:bg-[#C20500] text-xs font-serif font-semibold transition-all shadow-xs hover:scale-102"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Product</span>
          </Link>

          <Link
            href="/admin/orders?status=pending"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] hover:border-[#E10600] text-xs font-serif font-semibold text-[#1E1E1E] transition-colors shadow-2xs"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Process Pending ({kpis.pendingOrders})</span>
          </Link>

          <Link
            href="/admin/custom-orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] hover:border-[#E10600] text-xs font-serif font-semibold text-[#1E1E1E] transition-colors shadow-2xs"
          >
            <RibbonEmblem className="w-3.5 h-3.5 text-[#E10600]" />
            <span>Custom Commissions ({customFunnel.totalRequests})</span>
          </Link>

          <Link
            href="/admin/inventory"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] hover:border-[#E10600] text-xs font-serif font-semibold text-[#1E1E1E] transition-colors shadow-2xs"
          >
            <Boxes className="w-3.5 h-3.5 text-blue-600" />
            <span>Stock & Materials</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] hover:border-[#E10600] text-xs font-serif font-semibold text-[#1E1E1E] transition-colors shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
            <span>View Live Store</span>
          </Link>
        </div>
      </div>

      {/* ── 3. High-Impact 4 KPI Cards (Clean, Bold, Intuitive) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Revenue */}
        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs relative overflow-hidden group hover:border-[#E10600]/40 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-[#777]">
            <span>Total Revenue</span>
            <span className="p-2 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1E1E]">
              {formatPrice(kpis.totalRevenue)}
            </span>
            <p className="text-[11px] text-[#059669] font-medium mt-1 flex items-center gap-1">
              <span>Avg Basket: {formatPrice(kpis.averageOrderValue)}</span>
            </p>
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs relative overflow-hidden group hover:border-[#E10600]/40 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-[#777]">
            <span>Orders Placed</span>
            <span className="p-2 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1E1E]">
              {kpis.totalOrders}
            </span>
            <p className="text-[11px] text-[#666] font-medium mt-1">
              {kpis.completedOrders} successfully delivered
            </p>
          </div>
        </div>

        {/* Card 3: Pending Orders */}
        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs relative overflow-hidden group hover:border-[#E10600]/40 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-[#777]">
            <span>Awaiting Fulfillment</span>
            <span className="p-2 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-600">
              {kpis.pendingOrders}
            </span>
            <Link
              href="/admin/orders?status=pending"
              className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold mt-1 inline-flex items-center gap-1 hover:underline"
            >
              <span>Review pending orders</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 4: Custom Commissions */}
        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs relative overflow-hidden group hover:border-[#E10600]/40 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-[#777]">
            <span>Custom Commissions</span>
            <span className="p-2 rounded-2xl bg-red-50 text-[#E10600] border border-red-100">
              <RibbonEmblem className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#E10600]">
              {customFunnel.totalRequests}
            </span>
            <p className="text-[11px] text-[#666] font-medium mt-1">
              {customFunnel.accepted} approved • {customFunnel.conversionRate}% conv
            </p>
          </div>
        </div>
      </div>

      {/* ── 4. Main Two-Column Working Space ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column (8 cols): Recent Orders Feed & Sales Velocity Chart */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          {/* Recent Orders Live Table */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEAE2]">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#1E1E1E]">
                  Recent Orders Feed
                </h2>
                <p className="text-xs text-[#777]">
                  Real-time customer orders with immediate status inspection
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1 text-xs text-[#E10600] font-semibold hover:underline"
              >
                <span>View Full Queue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-[#888]">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-[#DDD]" />
                <p className="text-xs font-medium">No customer orders recorded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F2ECE4]">
                {recentOrders.slice(0, 6).map((order: any) => (
                  <div
                    key={order.id || order.reference}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5]/60 -mx-3 px-3 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] flex items-center justify-center font-serif text-xs font-bold text-[#E10600] shrink-0">
                        {order.customer?.name?.[0]?.toUpperCase() || "C"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-[#1E1E1E]">
                            {order.reference}
                          </span>
                          <span
                            className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              order.status === "delivered"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : order.status === "pending"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : order.status === "cancelled"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#666] truncate mt-0.5">
                          {order.customer?.name} • {order.items?.length || 1} bouquet
                          {order.selectedFlowerCount ? ` (${order.selectedFlowerCount} stems)` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="font-serif font-bold text-sm text-[#1E1E1E] block">
                          {formatPrice(order.totalAmount || 0)}
                        </span>
                        <span className="text-[10px] text-[#888] block">
                          {order.deliveryDetails?.date ? formatDate(order.deliveryDetails.date) : "Standard"}
                        </span>
                      </div>
                      <Link
                        href={`/admin/orders/${order.id || order.reference}`}
                        className="px-3 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-[#E10600] hover:text-white text-[#1E1E1E] border border-[#EFEAE2] text-xs font-serif font-semibold transition-colors"
                      >
                        Inspect
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Revenue Over Time Chart Card */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEAE2]">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#1E1E1E]">
                  Revenue Velocity
                </h2>
                <p className="text-xs text-[#777]">
                  Daily recognized order transactions ({period.toUpperCase()})
                </p>
              </div>
              <span className="text-sm font-bold text-[#E10600] font-serif">
                {formatPrice(kpis.totalRevenue)}
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="pt-3 h-52 flex items-end gap-2 border-b border-[#EFEAE2] pb-2">
              {revenueOverTime.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-[#999]">
                  No order activity recorded in this period.
                </div>
              ) : (
                revenueOverTime.map((pt: any) => {
                  const heightPercent = Math.max(8, Math.round((pt.revenue / maxRevenue) * 100));
                  return (
                    <div
                      key={pt.date}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative"
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-9 bg-[#1E1E1E] text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                        {formatPrice(pt.revenue)} ({pt.orders} orders)
                      </div>
                      {/* Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[32px] rounded-t-md transition-all duration-300 ${
                          pt.revenue > 0 ? "bg-[#E10600] group-hover:bg-[#C20500]" : "bg-[#EFEAE2]"
                        }`}
                      />
                      <span className="text-[9px] text-[#888] mt-1.5 truncate max-w-full font-mono">
                        {pt.date.split("-").slice(1).join("/")}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Status Distribution, Top Creation, Low Stock Alert */}
        <div className="lg:col-span-4 space-y-6">
          {/* Order Status Distribution */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
            <h2 className="font-serif text-base font-bold text-[#1E1E1E]">
              Order Distribution
            </h2>
            <div className="space-y-3">
              {ordersByStatus.length === 0 ? (
                <p className="text-xs text-[#999] py-4 text-center">No orders in this period.</p>
              ) : (
                ordersByStatus.map((st: any) => (
                  <div key={st.status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize text-[#444] font-serif font-semibold">
                        {st.status}
                      </span>
                      <span className="text-[#1E1E1E] font-bold">
                        {st.count} ({st.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#FAF8F5] overflow-hidden border border-[#EFEAE2]">
                      <div
                        style={{ width: `${st.percentage}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          st.status === "delivered"
                            ? "bg-emerald-500"
                            : st.status === "confirmed"
                            ? "bg-blue-500"
                            : st.status === "pending"
                            ? "bg-amber-500"
                            : st.status === "cancelled"
                            ? "bg-red-400"
                            : "bg-[#E10600]"
                        }`}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Selling Bouquet Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-serif font-bold text-[#1E1E1E] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Bestselling Creation</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Popular
              </span>
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-[#1E1E1E] line-clamp-1">
                {kpis.bestSeller.name}
              </h3>
              <p className="text-xs text-[#666] mt-0.5">
                {kpis.bestSeller.units} bouquets crafted • {formatPrice(kpis.bestSeller.revenue)} generated
              </p>
            </div>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-xs text-[#E10600] font-semibold hover:underline pt-1"
            >
              <span>Manage catalog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Low Stock Watchlist */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-serif font-bold text-[#1E1E1E] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Inventory Watchlist</span>
              </span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                {lowStockItems.length} alerts
              </span>
            </div>
            <p className="text-xs text-[#666]">
              {lowStockItems.length > 0
                ? "Some ribbon colors or keepsake packaging require replenishment."
                : "All ribbon spools and rigid keepsake boxes are sufficiently stocked."}
            </p>
            <Link
              href="/admin/inventory"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-[#FAF8F5] hover:bg-[#EFEAE2] text-xs font-serif font-semibold text-[#1E1E1E] transition-colors border border-[#EFEAE2]"
            >
              <Boxes className="w-3.5 h-3.5 text-rose-600" />
              <span>Review Inventory Levels</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
