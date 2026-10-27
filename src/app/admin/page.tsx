"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  DollarSign,
  Award,
  ArrowRight,
  AlertTriangle,
  Calendar,
  Filter,
  RefreshCw,
  Package,
  Layers,
  Sparkles,
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
    bestSeller: { name: "N/A", units: 0, revenue: 0 },
  };

  const revenueOverTime = data?.revenueOverTime || [];
  const ordersByStatus = data?.ordersByStatus || [];
  const revenueByCategory = data?.revenueByCategory || [];
  const customFunnel = data?.customOrderFunnel || { totalRequests: 0, quotesSent: 0, accepted: 0, conversionRate: 0 };
  const lowStockItems = data?.lowStockItems || [];
  const recentOrders = data?.recentOrders || [];

  const maxRevenue = Math.max(...revenueOverTime.map((r: any) => r.revenue), 1000);

  return (
    <div className="space-y-8">
      {/* Page Header with Time Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE2]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-serif uppercase tracking-[0.2em] text-[#E10600] font-semibold mb-1">
            <RibbonEmblem className="w-3.5 h-3.5" />
            <span>Happiwrapz Business Intelligence</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal">
            Atelier Executive Dashboard
          </h1>
          <p className="text-xs text-[#666] mt-0.5">
            Real-time revenue metrics, order dispatch schedule, and custom commission conversions.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2">
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
            onClick={fetchDashboardData}
            title="Refresh Data"
            className="p-2.5 rounded-full bg-white border border-[#EFEAE2] text-[#666] hover:text-[#E10600] hover:border-[#E10600] transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#E10600]" : ""}`} />
          </button>
        </div>
      </div>

      {/* 8 Core KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* 1. Total Revenue */}
        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs relative overflow-hidden group hover:border-[#E10600]/40 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-[#777]">
            <span>Net Recognized Revenue</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1E1E]">
              {formatPrice(kpis.totalRevenue)}
            </span>
            <p className="text-[11px] text-[#059669] font-medium mt-1">
              Excludes cancelled orders
            </p>
          </div>
        </div>

        {/* 2. Total Orders */}
        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs relative overflow-hidden group hover:border-[#E10600]/40 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-[#777]">
            <span>Total Orders Placed</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1E1E]">
              {kpis.totalOrders}
            </span>
            <p className="text-[11px] text-[#666] font-medium mt-1">
              {kpis.completedOrders} delivered
            </p>
          </div>
        </div>

        {/* 3. Pending Confirmation */}
        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs relative overflow-hidden group hover:border-[#E10600]/40 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-[#777]">
            <span>Pending Review</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#D97706]">
              {kpis.pendingOrders}
            </span>
            <Link
              href="/admin/orders?status=pending"
              className="text-[11px] text-[#D97706] hover:underline font-semibold mt-1 inline-flex items-center gap-1"
            >
              <span>Review pending</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 4. Average Order Value (AOV) */}
        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs relative overflow-hidden group hover:border-[#E10600]/40 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-[#777]">
            <span>Average Order Value</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1E1E]">
              {formatPrice(kpis.averageOrderValue)}
            </span>
            <p className="text-[11px] text-[#666] font-medium mt-1">
              Per confirmed basket
            </p>
          </div>
        </div>

        {/* 5. Custom Order Conversion */}
        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs relative overflow-hidden group hover:border-[#E10600]/40 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-[#777]">
            <span>Custom Conversion</span>
            <span className="p-2 rounded-xl bg-red-50 text-[#E10600]">
              <RibbonEmblem className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#E10600]">
              {customFunnel.conversionRate}%
            </span>
            <p className="text-[11px] text-[#666] font-medium mt-1">
              {customFunnel.accepted} of {customFunnel.totalRequests} commissions
            </p>
          </div>
        </div>

        {/* 6. Total Customers */}
        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs relative overflow-hidden group hover:border-[#E10600]/40 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-[#777]">
            <span>Active Clientele</span>
            <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1E1E]">
              {kpis.totalCustomers}
            </span>
            <p className="text-[11px] text-[#666] font-medium mt-1">
              Registered & guest clients
            </p>
          </div>
        </div>

        {/* 7. Low Stock Alerts */}
        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs relative overflow-hidden group hover:border-[#E10600]/40 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-[#777]">
            <span>Low Stock Items</span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-rose-600">
              {lowStockItems.length}
            </span>
            <Link
              href="/admin/inventory"
              className="text-[11px] text-rose-600 hover:underline font-semibold mt-1 inline-flex items-center gap-1"
            >
              <span>Restock inventory</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 8. Best-Selling Creation */}
        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs relative overflow-hidden group hover:border-[#E10600]/40 transition-all">
          <div className="flex items-center justify-between text-xs font-medium text-[#777]">
            <span>Top Atelier Creation</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-serif text-sm sm:text-base font-bold text-[#1E1E1E] line-clamp-1">
              {kpis.bestSeller.name}
            </span>
            <p className="text-[11px] text-[#666] font-medium mt-1">
              {kpis.bestSeller.units} units ({formatPrice(kpis.bestSeller.revenue)})
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Section: Revenue Over Time Chart & Orders Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1E1E1E]">
                Revenue Trend Over Time
              </h2>
              <p className="text-xs text-[#777]">
                Daily recognized sales across all fulfilled and confirmed orders
              </p>
            </div>
            <span className="text-xs font-bold text-[#E10600] font-serif">
              {formatPrice(kpis.totalRevenue)}
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-4 h-56 flex items-end gap-2 border-b border-[#EFEAE2] pb-2">
            {revenueOverTime.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-[#999]">
                No order activity recorded in this period.
              </div>
            ) : (
              revenueOverTime.map((pt: any) => {
                const heightPercent = Math.max(
                  6,
                  Math.round((pt.revenue / maxRevenue) * 100)
                );
                return (
                  <div
                    key={pt.date}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-10 bg-[#1E1E1E] text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-md">
                      {formatPrice(pt.revenue)} ({pt.orders} orders)
                    </div>
                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                        pt.revenue > 0
                          ? "bg-[#E10600] group-hover:bg-[#C20500]"
                          : "bg-[#EFEAE2]"
                      }`}
                    />
                    {/* Date label */}
                    <span className="text-[9px] text-[#888] mt-1.5 truncate max-w-full">
                      {pt.date.split("-").slice(1).join("/")}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Orders by Status Breakdown */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#1E1E1E]">
              Order Status Distribution
            </h2>
            <p className="text-xs text-[#777]">
              Current status of orders in the selected period
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {ordersByStatus.length === 0 ? (
              <p className="text-xs text-[#999] py-8 text-center">No orders to display.</p>
            ) : (
              ordersByStatus.map((st: any) => (
                <div key={st.status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
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
                      className={`h-full rounded-full ${
                        st.status === "delivered"
                          ? "bg-emerald-500"
                          : st.status === "confirmed"
                          ? "bg-blue-500"
                          : st.status === "pending"
                          ? "bg-amber-500"
                          : st.status === "cancelled"
                          ? "bg-red-500"
                          : "bg-[#E10600]"
                      }`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick link */}
          <div className="pt-2 border-t border-[#EFEAE2]">
            <Link
              href="/admin/orders"
              className="text-xs text-[#E10600] font-semibold inline-flex items-center gap-1.5 hover:underline"
            >
              <span>Manage all orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Two-Column Lower Grid: Recent Orders Feed & Custom Order Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Feed */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1E1E1E]">
                Recent Orders Feed
              </h2>
              <p className="text-xs text-[#777]">
                Latest customer bouquet and gift hamper orders
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-[#E10600] font-semibold hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-[#F2ECE4]">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-[#999] py-8 text-center">No recent orders.</p>
            ) : (
              recentOrders.map((o: any) => (
                <div key={o.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#1E1E1E]">
                        {o.reference}
                      </span>
                      <span
                        className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          o.status === "delivered"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : o.status === "pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#666] mt-0.5">
                      {o.customer?.name} • {o.items?.length} items
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-sm text-[#1E1E1E] block">
                      {formatPrice(o.totalAmount || 0)}
                    </span>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="text-[11px] text-[#E10600] hover:underline font-semibold"
                    >
                      Inspect →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Custom Order Pipeline Preview */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1E1E1E]">
                Custom Commissions Pipeline
              </h2>
              <p className="text-xs text-[#777]">
                Personalized ribbon flower arrangements requiring quotation
              </p>
            </div>
            <Link
              href="/admin/custom-orders"
              className="text-xs text-[#E10600] font-semibold hover:underline"
            >
              Open Studio
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2] text-center">
            <div>
              <span className="text-[10px] uppercase font-serif font-bold text-[#777] block">
                Total Requests
              </span>
              <span className="text-xl font-serif font-bold text-[#1E1E1E] mt-0.5 block">
                {customFunnel.totalRequests}
              </span>
            </div>
            <div className="border-x border-[#EFEAE2]">
              <span className="text-[10px] uppercase font-serif font-bold text-[#777] block">
                Quotes Sent
              </span>
              <span className="text-xl font-serif font-bold text-[#E10600] mt-0.5 block">
                {customFunnel.quotesSent}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-serif font-bold text-[#777] block">
                Conversion
              </span>
              <span className="text-xl font-serif font-bold text-emerald-600 mt-0.5 block">
                {customFunnel.conversionRate}%
              </span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-2">
            <Link
              href="/admin/custom-orders"
              className="w-full inline-flex items-center justify-center gap-2 p-3 bg-[#E10600] hover:bg-[#C20500] text-white rounded-2xl text-xs font-serif font-semibold uppercase tracking-wider transition-colors shadow-xs"
            >
              <RibbonEmblem className="w-3.5 h-3.5" />
              <span>Review Custom Requests & Build Quotations</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
