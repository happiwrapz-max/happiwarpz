"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { formatPrice, formatDate, formatDateTime, ORDER_STATUSES, OrderStatus, STATUS_TRANSITIONS } from "@/lib/utils";
import {
  Search,
  Filter,
  Phone,
  CheckCircle2,
  ArrowRight,
  XCircle,
  Download,
  Printer,
  Calendar,
  Clock,
  MapPin,
  Check,
  ChevronDown,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { OrderRequest } from "@/lib/store/types";

export default function AdminOrdersQueuePage() {
  const { user } = useAuthStore();

  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [printingOrder, setPrintingOrder] = useState<OrderRequest | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleAdvanceStatus = async (orderRef: string, nextStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderRef}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          actorName: user?.name || "Store Owner",
          actorRole: user?.role || "owner",
          note: `Advanced to ${nextStatus}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.reference === orderRef || o.id === orderRef ? data.order : o))
        );
      }
    } catch (err) {
      console.warn("API PATCH order status error:", err);
    }
  };

  // Bulk status update
  const handleBulkAdvance = async (nextStatus: OrderStatus) => {
    for (const ref of selectedOrders) {
      await handleAdvanceStatus(ref, nextStatus);
    }
    setSelectedOrders([]);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o.reference));
    }
  };

  const toggleSelectOrder = (ref: string) => {
    setSelectedOrders((prev) =>
      prev.includes(ref) ? prev.filter((r) => r !== ref) : [...prev, ref]
    );
  };

  const statusOptions = [
    { label: "All Orders", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Preparing", value: "preparing" },
    { label: "Ready", value: "ready" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE2]">
        <div>
          <span className="text-xs font-semibold tracking-[0.2em] text-[#888888] uppercase">
            Order Lifecycle & Dispatch
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal mt-0.5">
            Customer Orders Management
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Review incoming requests, manage WhatsApp confirmations, and schedule Bangalore delivery runs.
          </p>
        </div>

        {/* Action Buttons: Export CSV & Print */}
        <div className="flex items-center gap-2.5">
          <a
            href="/api/admin/analytics?export=orders"
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#EFEAE2] text-xs font-serif font-semibold text-[#1E1E1E] hover:border-[#E10600] hover:text-[#E10600] transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#E10600]" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white p-4 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === opt.value
                  ? "bg-[#E10600] text-white font-semibold shadow-xs"
                  : "bg-[#FAF8F5] text-[#666] hover:bg-[#F2ECE4] hover:text-[#1E1E1E]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search Bar & Bulk Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#EFEAE2]">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference (HW-...), customer name, phone, email..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-full text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white transition-colors"
            />
          </form>

          {/* Bulk Selection Actions */}
          {selectedOrders.length > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E10600]/30 text-xs text-[#E10600] font-semibold">
              <span>{selectedOrders.length} selected</span>
              <span className="text-[#CCC]">|</span>
              <button
                type="button"
                onClick={() => handleBulkAdvance("confirmed")}
                className="hover:underline cursor-pointer"
              >
                Mark Confirmed
              </button>
              <span className="text-[#CCC]">•</span>
              <button
                type="button"
                onClick={() => handleBulkAdvance("delivered")}
                className="hover:underline cursor-pointer"
              >
                Mark Delivered
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Orders Card View (Screens < md) */}
      <div className="block md:hidden space-y-3.5">
        {loading ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-[#EFEAE2] text-xs text-[#888]">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-[#EFEAE2] text-xs text-[#888]">
            No orders found.
          </div>
        ) : (
          orders.map((order) => {
            const nextStatuses = STATUS_TRANSITIONS[order.status] || [];
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#EFEAE2] p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2 border-b border-[#EFEAE2] pb-2.5">
                  <div>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono font-bold text-sm text-[#1E1E1E] hover:text-[#E10600] flex items-center gap-1.5"
                    >
                      <span>{order.reference}</span>
                      <ArrowRight className="w-3 h-3 text-[#999]" />
                    </Link>
                    <span className="text-[10px] text-[#888]">{formatDate(order.createdAt)}</span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === "delivered"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : order.status === "confirmed"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : order.status === "pending"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-gray-50 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2 text-xs">
                  <div>
                    <p className="font-semibold text-[#1E1E1E]">{order.customer?.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <a
                        href={`https://wa.me/${order.customer?.phone?.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#25D366] font-medium flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={`tel:${order.customer?.phone}`}
                        className="text-[11px] text-[#555] hover:text-[#1E1E1E]"
                      >
                        Call
                      </a>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-serif font-bold text-base text-[#1E1E1E] block">
                      {formatPrice(order.totalAmount || order.subtotal || 0)}
                    </span>
                    <span className="text-[10px] text-[#888] block">
                      {order.deliverySlot || "Standard delivery"}
                    </span>
                  </div>
                </div>

                {/* Items summary */}
                <div className="text-[11px] text-[#666] bg-[#FAF8F5] p-2 rounded-xl">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="truncate">
                      {item.quantity}x {item.product?.name}
                    </div>
                  ))}
                </div>

                {/* Mobile action bar */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#EFEAE2]">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-xs font-serif font-semibold text-[#1E1E1E] hover:text-[#E10600]"
                  >
                    View Details →
                  </Link>

                  {nextStatuses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleAdvanceStatus(order.reference, nextStatuses[0])}
                      className="px-3 py-1.5 rounded-full bg-[#1E1E1E] text-white text-[10px] font-serif font-semibold uppercase tracking-wider cursor-pointer"
                    >
                      Mark {nextStatuses[0]}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Orders Table (Screens >= md) */}
      <div className="hidden md:block bg-white rounded-3xl border border-[#EFEAE2] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#EFEAE2] bg-[#FAF8F5] text-[#777] font-serif uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length > 0 && selectedOrders.length === orders.length}
                    onChange={toggleSelectAll}
                    className="rounded border-[#CCC] text-[#E10600] focus:ring-[#E10600]"
                  />
                </th>
                <th className="py-3.5 px-4">Order Ref</th>
                <th className="py-3.5 px-4">Client Details</th>
                <th className="py-3.5 px-4">Gift Items</th>
                <th className="py-3.5 px-4">Delivery Window</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE4]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#888]">
                    Loading order queue...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#888]">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-[#CCC]" />
                    <p className="font-serif text-sm font-semibold text-[#1E1E1E]">No orders found</p>
                    <p className="text-xs text-[#888] mt-1">Try clearing your search or status filter.</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusConf = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
                  const nextStatuses = STATUS_TRANSITIONS[order.status] || [];
                  const isSelected = selectedOrders.includes(order.reference);

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-[#FAF8F5]/80 transition-colors ${
                        isSelected ? "bg-[#FFF9F9]" : ""
                      }`}
                    >
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOrder(order.reference)}
                          className="rounded border-[#CCC] text-[#E10600] focus:ring-[#E10600]"
                        />
                      </td>

                      {/* Reference & Date */}
                      <td className="py-4 px-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono font-bold text-sm text-[#1E1E1E] hover:text-[#E10600] transition-colors block"
                        >
                          {order.reference}
                        </Link>
                        <span className="text-[10px] text-[#888]">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>

                      {/* Client Details */}
                      <td className="py-4 px-4">
                        <p className="font-semibold text-[#1E1E1E]">{order.customer?.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#666]">
                          <a
                            href={`https://wa.me/${order.customer?.phone?.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#25D366] hover:underline font-medium"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{order.customer?.phone}</span>
                          </a>
                        </div>
                      </td>

                      {/* Gift Items Summary */}
                      <td className="py-4 px-4 max-w-[200px]">
                        <p className="truncate text-[#1E1E1E] font-medium">
                          {order.items?.map((i) => `${i.quantity}x ${i.product.name}`).join(", ") || "No items"}
                        </p>
                        {order.items?.[0]?.giftMessage && (
                          <span className="text-[10px] text-[#E10600] italic truncate block mt-0.5">
                            "{order.items[0].giftMessage}"
                          </span>
                        )}
                      </td>

                      {/* Delivery Date & Slot */}
                      <td className="py-4 px-4">
                        <span className="font-medium text-[#1E1E1E] block">
                          {order.deliveryDate || "Today"}
                        </span>
                        <span className="text-[10px] text-[#777] block mt-0.5 truncate max-w-[130px]">
                          {order.deliverySlot}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4 font-serif font-bold text-sm text-[#1E1E1E]">
                        {formatPrice(order.totalAmount || order.subtotal || 0)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.status === "delivered"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : order.status === "confirmed"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : order.status === "pending"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : order.status === "cancelled"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-[#E10600]/10 text-[#E10600] border border-[#E10600]/25"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {/* Quick Advance Button */}
                        {nextStatuses.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(order.reference, nextStatuses[0])}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1E1E1E] text-white hover:bg-[#E10600] transition-colors text-[10px] font-serif font-semibold uppercase tracking-wider cursor-pointer"
                          >
                            <span>Mark {nextStatuses[0]}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setPrintingOrder(order)}
                          className="p-1.5 rounded-lg border border-[#EFEAE2] hover:border-[#CCC] text-[#777] hover:text-[#1E1E1E] transition-colors cursor-pointer inline-flex items-center"
                          title="Print Receipt / Packing Slip"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="p-1.5 rounded-lg border border-[#EFEAE2] hover:border-[#E10600] text-[#777] hover:text-[#E10600] transition-colors cursor-pointer inline-flex items-center"
                          title="View Details"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Packing Slip / Receipt Modal */}
      {printingOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#EFEAE2] shadow-2xl space-y-6 text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEAE2]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1E1E1E]">Happiwrapz Packing Slip</h3>
                <span className="font-mono text-xs font-bold text-[#E10600]">{printingOrder.reference}</span>
              </div>
              <button
                type="button"
                onClick={() => setPrintingOrder(null)}
                className="text-xs text-[#888] hover:text-[#1E1E1E]"
              >
                ✕ Close
              </button>
            </div>

            {/* Recipient Details */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#EFEAE2] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#888]">Delivery Coordinates</span>
              <p className="font-bold text-[#1E1E1E] text-sm">{printingOrder.customer?.name}</p>
              <p>{printingOrder.customer?.phone} • {printingOrder.customer?.email}</p>
              <p className="text-[#555]">{printingOrder.customer?.address}, {printingOrder.customer?.city}</p>
              <p className="text-[#E10600] font-medium pt-1">
                Requested Slot: {printingOrder.deliveryDate} ({printingOrder.deliverySlot})
              </p>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#888]">Items to Pack</span>
              <div className="divide-y divide-[#EFEAE2] border-y border-[#EFEAE2]">
                {printingOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#1E1E1E]">{item.quantity}x {item.product.name}</span>
                      {item.giftMessage && (
                        <p className="text-[10px] text-[#E10600] italic">Card: "{item.giftMessage}"</p>
                      )}
                    </div>
                    <span className="font-mono">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-between items-center pt-2 font-bold text-sm">
              <span>Total Amount:</span>
              <span className="font-serif text-base text-[#E10600]">
                {formatPrice(printingOrder.totalAmount || printingOrder.subtotal || 0)}
              </span>
            </div>

            {/* Print Action */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-full bg-[#E10600] hover:bg-[#C20500] text-white font-serif font-semibold uppercase tracking-wider text-xs transition-colors shadow-xs"
              >
                Print Slip
              </button>
              <button
                type="button"
                onClick={() => setPrintingOrder(null)}
                className="px-5 py-3 rounded-full border border-[#EFEAE2] hover:bg-[#FAF8F5] text-[#666] font-serif text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
