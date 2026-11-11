"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useBagStore } from "@/lib/store/useBagStore";
import { formatPrice, formatDate, formatDateTime, ORDER_STATUSES } from "@/lib/utils";
import {
  Package,
  Clock,
  ArrowRight,
  ShieldCheck,
  Phone,
  MessageSquare,
  Printer,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Gift,
} from "lucide-react";
import { OrderRequest } from "@/lib/store/types";
import CourierTrackerCard from "@/components/order/CourierTrackerCard";

export default function DashboardOrdersPage() {
  const { user } = useAuthStore();
  const addItem = useBagStore((s) => s.addItem);
  const openDrawer = useBagStore((s) => s.openDrawer);

  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reorderSuccess, setReorderSuccess] = useState<string | null>(null);

  // Fetch orders from live API on mount
  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Dashboard orders fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const userEmail = user?.email || "";
  const userName = user?.name || "";

  // Filter orders for the logged-in customer, or show recent orders
  const displayOrders =
    user?.role === "customer" && userEmail
      ? orders.filter(
          (o) =>
            o.customer?.email?.toLowerCase() === userEmail.toLowerCase() ||
            (userName && o.customer?.name?.toLowerCase().includes(userName.toLowerCase()))
        )
      : orders.slice(0, 5);

  const handleReorder = (order: OrderRequest) => {
    for (const item of order.items) {
      addItem(item.product, item.quantity, item.giftMessage, {
        selectedFlowerCount: item.selectedFlowerCount,
        selectedColor: item.selectedColor,
        customColorNote: item.customColorNote,
        tierPrice: item.product.price,
      });
    }
    setReorderSuccess(order.reference);
    setTimeout(() => {
      setReorderSuccess(null);
      openDrawer();
    }, 900);
  };

  const handlePrintReceipt = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[11px] font-serif font-semibold tracking-[0.25em] text-[#E10600] uppercase block mb-1">
          CONCIERGE CLIENT PORTAL
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal">
          My Gift Orders & Deliveries
        </h1>
        <p className="text-xs sm:text-sm font-sans text-[#666] mt-1 max-w-xl">
          View your order history, third-party courier tracking links, and live consignment IDs with 1-click clipboard auto-copy.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#888]">Loading orders...</div>
      ) : displayOrders.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#EFEAE2] rounded-3xl bg-[#FAF8F5]">
          <Package className="w-10 h-10 text-[#888] mx-auto mb-3" />
          <h3 className="font-serif text-lg text-[#1E1E1E] font-semibold">
            No Order Requests Yet
          </h3>
          <p className="text-xs text-[#666] mt-1 mb-6">
            Explore our handcrafted red rose bouquets and submit your first request with zero upfront payment.
          </p>
          <Link
            href="/catalog"
            className="inline-flex rounded-full bg-[#E10600] hover:bg-[#C20500] text-white px-8 py-3 text-xs font-serif font-semibold uppercase tracking-wider shadow-xs transition-all"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {displayOrders.map((order) => {
            const statusConfig = ORDER_STATUSES[order.status] || {
              label: order.status,
              color: "text-amber-800 bg-amber-50 border-amber-200",
            };

            const whatsappMessage = encodeURIComponent(
              `Hello Happiwrapz! Checking status of my order ${order.reference} for ${order.customer?.name || "Customer"}.`
            );

            return (
              <div
                key={order.id || order.reference}
                className="bg-white rounded-3xl border border-[#EFEAE2] p-6 sm:p-7 shadow-xs hover:border-[#D1C7BD] transition-all space-y-6"
              >
                {/* Header Row: Reference, Date, Status */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#EFEAE2]">
                  <div>
                    <span className="text-[10px] font-serif uppercase tracking-wider text-[#888]">
                      Order Reference
                    </span>
                    <h2 className="font-mono text-xl sm:text-2xl font-bold text-[#E10600]">
                      {order.reference}
                    </h2>
                    <p className="text-[11px] text-[#777] mt-0.5">
                      Submitted on {formatDateTime(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-serif font-semibold uppercase tracking-wider border ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* ── Third-Party Courier Tracking Module ── */}
                <CourierTrackerCard order={order} />

                {/* Delivery Schedule & Recipient Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-1 bg-[#FAF8F5] p-4 rounded-2xl border border-[#EFEAE2]">
                    <span className="font-serif uppercase text-[10px] text-[#888] tracking-wider block">
                      Delivery Window
                    </span>
                    <p className="font-medium text-[#1E1E1E]">
                      {order.deliveryDate ? formatDate(order.deliveryDate) : formatDate(order.createdAt)}
                    </p>
                    <p className="text-[#666]">{order.deliverySlot || "Standard Express"}</p>
                  </div>

                  <div className="space-y-1 bg-[#FAF8F5] p-4 rounded-2xl border border-[#EFEAE2]">
                    <span className="font-serif uppercase text-[10px] text-[#888] tracking-wider block">
                      Delivery Destination
                    </span>
                    <p className="font-medium text-[#1E1E1E] truncate">
                      {order.customer?.address || "Coimbatore Destination"}
                    </p>
                    <p className="text-[#666]">
                      {order.customer?.city || "Coimbatore"} {order.customer?.pincode ? `• ${order.customer.pincode}` : ""}
                    </p>
                  </div>
                </div>

                {/* Itemized Bouquet Arrangements */}
                <div className="pt-1">
                  <h3 className="font-serif text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-2.5">
                    Order Creations ({order.items?.length || 0}):
                  </h3>
                  <div className="space-y-2 text-xs divide-y divide-[#F2ECE4]">
                    {order.items?.map((it, idx) => (
                      <div key={idx} className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="font-serif font-semibold text-[#1E1E1E] text-sm">
                            {it.product?.name}
                          </span>
                          <span className="text-[#888] ml-2 font-mono">
                            × {it.quantity}
                          </span>

                          {/* Flower Count & Color Tags */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {it.selectedFlowerCount && (
                              <span className="inline-block px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#EFEAE2] text-[10px] text-[#1E1E1E] font-medium">
                                💐 {it.selectedFlowerCount} Flowers
                              </span>
                            )}
                            {it.selectedColor && (
                              <span className="inline-block px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#EFEAE2] text-[10px] text-[#555]">
                                Color: {it.selectedColor}
                              </span>
                            )}
                          </div>

                          {it.customColorNote && (
                            <p className="text-[11px] text-[#555] bg-[#FAF8F5] p-2 rounded-xl mt-1 border border-[#EFEAE2]">
                              <strong className="text-[#1E1E1E]">Custom Note:</strong> {it.customColorNote}
                            </p>
                          )}

                          {it.giftMessage && (
                            <p className="text-[11px] text-[#E10600] italic mt-1">
                              Calligraphy Card: &ldquo;{it.giftMessage}&rdquo;
                            </p>
                          )}
                        </div>

                        <span className="font-serif font-bold text-sm text-[#1E1E1E] shrink-0 self-end sm:self-auto">
                          {formatPrice((it.tierPrice || it.product?.price || 0) * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total & Multi-Feature Actions Footer */}
                <div className="pt-4 border-t border-[#EFEAE2] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs uppercase font-serif text-[#888]">
                      Total:
                    </span>
                    <span className="font-serif text-2xl font-bold text-[#E10600]">
                      {formatPrice(
                        order.totalAmount ||
                          order.items?.reduce(
                            (s, it) => s + (it.tierPrice || it.product?.price || 0) * it.quantity,
                            0
                          ) ||
                          0
                      )}
                    </span>
                    <span className="text-[11px] text-[#059669] font-sans">
                      (Zero upfront charge • Cash/UPI on Delivery)
                    </span>
                  </div>

                  {/* Customer Order Features: Reorder, Print, WhatsApp */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={() => handleReorder(order)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FAF8F5] hover:bg-[#EFEAE2] border border-[#EFEAE2] rounded-full text-xs font-serif font-medium text-[#1E1E1E] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#E10600]" />
                      <span>{reorderSuccess === order.reference ? "Added to Cart!" : "Reorder"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintReceipt}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FAF8F5] hover:bg-[#EFEAE2] border border-[#EFEAE2] rounded-full text-xs font-serif font-medium text-[#1E1E1E] transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#555]" />
                      <span>Print Receipt</span>
                    </button>

                    <a
                      href={`https://wa.me/917708354636?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full text-xs font-serif uppercase tracking-wider font-semibold transition-colors shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Concierge</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
