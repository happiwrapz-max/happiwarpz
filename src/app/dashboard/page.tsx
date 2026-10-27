"use client";

import Link from "next/link";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { formatPrice, formatDate, formatDateTime, ORDER_STATUSES } from "@/lib/utils";
import { Package, Clock, ArrowRight, ShieldCheck, Phone, MessageSquare } from "lucide-react";

export default function DashboardOrdersPage() {
  const { user } = useAuthStore();
  const orders = useOrderStore((s) => s.orders);

  const userEmail = user?.email || "priya@example.com";
  const userOrders =
    user?.role === "customer"
      ? orders.filter(
          (o) =>
            o.customer.email.toLowerCase() === userEmail.toLowerCase() ||
            o.customer.name.toLowerCase().includes(user?.name.toLowerCase() || "")
        )
      : orders.slice(0, 3);

  const displayOrders = userOrders.length > 0 ? userOrders : orders.slice(0, 2);

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[11px] font-serif font-semibold tracking-[0.25em] text-[#E10600] uppercase block mb-1">
          ORDER CONCIERGE
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal">
          My Gift Requests
        </h1>
        <p className="text-xs sm:text-sm font-sans text-[#666] mt-1 max-w-xl">
          Track the real-time status of your requested bouquets and hampers.
          All orders are verified directly by our store owner without upfront online payment.
        </p>
      </div>

      {displayOrders.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-[#EFEAE2] rounded-3xl bg-[#FAF8F5]">
          <Package className="w-10 h-10 text-[#888] mx-auto mb-3" />
          <h3 className="font-serif text-lg text-[#1E1E1E] font-semibold">
            No Order Requests Yet
          </h3>
          <p className="text-xs text-[#666] mt-1 mb-6">
            Explore our handcrafted red rose bouquets and submit your first request.
          </p>
          <Link
            href="/catalog"
            className="inline-flex rounded-full bg-[#E10600] hover:bg-[#C20500] text-white px-8 py-3 text-xs font-serif font-semibold uppercase tracking-wider shadow-xs transition-all"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {displayOrders.map((order) => {
            const statusConfig = ORDER_STATUSES[order.status] || {
              label: order.status,
              color: "text-amber-800 bg-amber-50 border-amber-200",
            };

            const whatsappMessage = encodeURIComponent(
              `Hello Happiwrapz! Inquiring about order request ${order.reference} for ${order.customer.name}.`
            );

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-[#EFEAE2] p-6 shadow-xs hover:border-[#E10600]/40 transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-[#EFEAE2]">
                  <div>
                    <span className="text-[10px] font-serif uppercase tracking-wider text-[#888]">
                      Reference Code
                    </span>
                    <h2 className="font-mono text-xl font-bold text-[#E10600]">
                      {order.reference}
                    </h2>
                    <p className="text-[11px] text-[#777]">
                      Submitted on {formatDateTime(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-serif font-semibold uppercase tracking-wider border ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-1 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EFEAE2]">
                    <span className="font-serif uppercase text-[10px] text-[#888] tracking-wider block">
                      Delivery Window
                    </span>
                    <p className="font-medium text-[#1E1E1E]">
                      {order.deliveryDate ? formatDate(order.deliveryDate) : formatDate(order.createdAt)}
                    </p>
                    <p className="text-[#666]">{order.deliverySlot}</p>
                  </div>

                  <div className="space-y-1 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EFEAE2]">
                    <span className="font-serif uppercase text-[10px] text-[#888] tracking-wider block">
                      Destination
                    </span>
                    <p className="font-medium text-[#1E1E1E] truncate">
                      {order.customer.address}
                    </p>
                    <p className="text-[#666]">{order.customer.city} - {order.customer.pincode}</p>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="pt-2">
                  <h3 className="font-serif text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-2">
                    Arrangements:
                  </h3>
                  <div className="space-y-1.5 text-xs text-[#555]">
                    {order.items.map((it) => (
                      <div key={it.product.id} className="flex justify-between">
                        <span>
                          {it.product.name} (x{it.quantity})
                        </span>
                        <span className="font-serif font-medium text-[#1E1E1E]">
                          {formatPrice(it.product.price * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total & Action Footer */}
                <div className="pt-4 border-t border-[#EFEAE2] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs uppercase font-serif text-[#888]">
                      Total:
                    </span>
                    <span className="font-serif text-xl font-bold text-[#E10600]">
                      {formatPrice(order.items.reduce((s, it) => s + it.product.price * it.quantity, 0))}
                    </span>
                    <span className="text-[11px] text-[#059669] font-sans">
                      (Zero charge online)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a
                      href={`https://wa.me/919876543210?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-full text-xs font-serif uppercase tracking-wider font-semibold transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <Link
                      href={`/order/lookup?ref=${order.reference}`}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-[#1E1E1E] hover:bg-[#E10600] text-white rounded-full text-xs font-serif uppercase tracking-wider font-semibold transition-all shadow-2xs"
                    >
                      <span>Track</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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
