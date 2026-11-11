"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  formatPrice,
  formatDate,
  formatDateTime,
  ORDER_STATUSES,
  OrderStatus,
  STATUS_TRANSITIONS,
} from "@/lib/utils";
import {
  ArrowLeft,
  Phone,
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  MessageSquare,
  Send,
  Plus,
  Tag,
  Truck,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { OrderRequest } from "@/lib/store/types";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();

  const [order, setOrder] = useState<OrderRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [selectedNextStatus, setSelectedNextStatus] = useState<OrderStatus | "">("");
  const [statusNote, setStatusNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Third-Party Tracking State
  const [courierName, setCourierName] = useState("Delhivery");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("https://www.delhivery.com/track/package/");
  const [savingTracking, setSavingTracking] = useState(false);
  const [trackingSavedNotice, setTrackingSavedNotice] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        if (data.order.courierName) setCourierName(data.order.courierName);
        if (data.order.trackingNumber) setTrackingNumber(data.order.trackingNumber);
        if (data.order.trackingUrl) setTrackingUrl(data.order.trackingUrl);
      }
    } catch (err) {
      console.error("Order fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setSavingTracking(true);
    try {
      const res = await fetch(`/api/orders/${order.reference}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courierName: courierName.trim(),
          trackingNumber: trackingNumber.trim(),
          trackingUrl: trackingUrl.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setTrackingSavedNotice(true);
        setTimeout(() => setTrackingSavedNotice(false), 3000);
      }
    } catch (err) {
      console.error("Save tracking error:", err);
    } finally {
      setSavingTracking(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdateStatus = async (statusToSet: OrderStatus) => {
    if (!order) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/orders/${order.reference}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusToSet,
          actorName: user?.name || "Store Owner",
          actorRole: user?.role || "owner",
          note: statusNote || `Status updated to ${statusToSet}`,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setStatusNote("");
        setSelectedNextStatus("");
      }
    } catch (err) {
      console.warn("Status update error:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !newNote.trim()) return;
    try {
      const res = await fetch(`/api/orders/${order.reference}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internalNote: newNote.trim(),
          actorName: user?.name || "Store Owner",
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
        setNewNote("");
      }
    } catch (err) {
      console.warn("Internal note error:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-[#888]">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-[#EFEAE2] space-y-4">
        <h2 className="font-serif text-2xl text-[#1E1E1E]">Order Not Found</h2>
        <p className="text-xs text-[#666]">Order reference or ID {id} does not exist in the database.</p>
        <Link
          href="/admin/orders"
          className="inline-flex rounded-full bg-[#1E1E1E] text-white px-6 py-2.5 text-xs font-serif font-semibold"
        >
          ← Return to Orders Queue
        </Link>
      </div>
    );
  }

  const nextStatuses = STATUS_TRANSITIONS[order.status] || [];
  const statusConfig = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;

  const whatsappUrl = `https://wa.me/${order.customer?.phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hello ${order.customer?.name}! This is Happiwrapz confirming your floral order ${order.reference}.`
  )}`;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE2]">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-serif font-semibold text-[#888] hover:text-[#E10600] mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl sm:text-3xl font-bold text-[#1E1E1E]">
              {order.reference}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                order.status === "delivered"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : order.status === "confirmed"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : order.status === "pending"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-[#E10600]/10 text-[#E10600] border border-[#E10600]/30"
              }`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-xs text-[#777] mt-1">
            Submitted on {formatDateTime(order.createdAt)}
          </p>
        </div>

        {/* Action Buttons: WhatsApp & Print */}
        <div className="flex items-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-serif font-semibold transition-colors shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Client</span>
          </a>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#EFEAE2] hover:border-[#CCC] text-xs font-serif font-semibold text-[#1E1E1E] transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Slip</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Items, Delivery, Status Progression, Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Progression Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
            <h2 className="font-serif text-base font-bold text-[#1E1E1E]">
              Advance Order Lifecycle
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              {nextStatuses.map((next) => (
                <button
                  key={next}
                  type="button"
                  onClick={() => handleUpdateStatus(next)}
                  disabled={updatingStatus}
                  className="px-4 py-2 rounded-full bg-[#E10600] hover:bg-[#C20500] text-white text-xs font-serif font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Mark as {next}
                </button>
              ))}

              {order.status !== "cancelled" && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("cancelled")}
                  disabled={updatingStatus}
                  className="px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-serif font-medium transition-colors cursor-pointer"
                >
                  Cancel Order
                </button>
              )}
            </div>

            {/* Status History Timeline */}
            <div className="pt-4 border-t border-[#EFEAE2] space-y-3">
              <span className="text-[11px] uppercase font-bold text-[#888] font-serif tracking-wider block">
                Lifecycle Audit Trail
              </span>
              <div className="space-y-3 pl-2 border-l-2 border-[#EFEAE2]">
                {order.statusHistory?.map((entry, idx) => (
                  <div key={idx} className="relative pl-4 text-xs">
                    <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#E10600]" />
                    <p className="font-semibold text-[#1E1E1E]">
                      Advanced to <strong className="capitalize text-[#E10600]">{entry.to}</strong> by {entry.by}
                    </p>
                    {entry.note && <p className="text-[#666] text-[11px] mt-0.5">{entry.note}</p>}
                    <span className="text-[10px] text-[#999] block mt-0.5">
                      {formatDateTime(entry.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Third-Party Courier Tracking Management Card */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EFEAE2]">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-serif uppercase tracking-wider font-semibold text-[#E10600]">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Shipment & Dispatch</span>
                </div>
                <h2 className="font-serif text-lg font-bold text-[#1E1E1E] mt-0.5">
                  Third-Party Courier Tracking
                </h2>
                <p className="text-xs text-[#666] font-sans">
                  Paste the courier portal website link and consignment/tracking ID. When the customer clicks "Track", it redirects to the courier site and auto-copies the tracking ID to their clipboard.
                </p>
              </div>

              {order.trackingNumber ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 self-start sm:self-auto">
                  <Check className="w-3.5 h-3.5" />
                  <span>Active Tracking</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200 self-start sm:self-auto">
                  Awaiting Dispatch
                </span>
              )}
            </div>

            {/* Quick Courier Presets */}
            <div>
              <span className="text-[11px] font-semibold text-[#555] uppercase tracking-wider block mb-2">
                1-Click Courier Presets:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { name: "Delhivery", url: "https://www.delhivery.com/track/package/" },
                  { name: "Blue Dart", url: "https://track.bluedart.com/" },
                  { name: "DTDC", url: "https://www.dtdc.in/" },
                  { name: "India Post", url: "https://www.indiapost.gov.in/" },
                  { name: "Porter", url: "https://porter.in/" },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setCourierName(preset.name);
                      setTrackingUrl(preset.url);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                      courierName === preset.name
                        ? "bg-[#E10600] text-white border-[#E10600]"
                        : "bg-[#FAF8F5] border-[#EFEAE2] text-[#555] hover:border-[#CCC]"
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveTracking} className="space-y-3.5 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                    Courier Partner *
                  </label>
                  <input
                    type="text"
                    required
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="e.g. Delhivery / Blue Dart"
                    className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                    Tracking ID / AWB Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. 1421293847291 or DEL9921820"
                    className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                  Third-Party Tracking Website Link *
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="e.g. https://www.delhivery.com/track/package/ (or direct parcel URL)"
                    className="w-full text-xs p-3 pr-24 bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] outline-none"
                  />
                  {trackingNumber && (
                    <button
                      type="button"
                      onClick={() => {
                        let target = trackingUrl.trim();
                        if (target.endsWith("/")) target = `${target}${trackingNumber.trim()}`;
                        navigator.clipboard?.writeText(trackingNumber.trim());
                        window.open(target, "_blank");
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] text-[#E10600] hover:bg-[#FEE2E2]/60 rounded-lg flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Test Link</span>
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-[#888] font-sans mt-1">
                  Tip: When the client clicks "Track Order", this link opens and the tracking ID is automatically copied to their clipboard for instant 1-click pasting.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingTracking}
                  className="px-6 py-2.5 bg-[#E10600] hover:bg-[#C20500] disabled:bg-[#CCC] text-white rounded-xl text-xs font-serif font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                >
                  {savingTracking ? "Saving Tracking..." : "Save Tracking to Order"}
                </button>

                {trackingSavedNotice && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Tracking details updated for client!</span>
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Itemized Basket */}
          <div className="bg-white p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
            <h2 className="font-serif text-base font-bold text-[#1E1E1E]">
              Order Creations ({order.items?.length || 0})
            </h2>

            <div className="divide-y divide-[#F2ECE4]">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-4 flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden relative bg-[#FAF8F5] border border-[#EFEAE2] shrink-0">
                    <Image
                      src={item.product?.images?.[0] || "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg"}
                      alt={item.product?.name || "Product"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-sm font-bold text-[#1E1E1E]">
                      {item.product?.name}
                    </h3>
                    <p className="text-xs text-[#666] mt-0.5">
                      Category: {item.product?.category || "Bouquet"}
                    </p>
                    {item.giftMessage && (
                      <div className="mt-2 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2] text-[11px] text-[#E10600] italic">
                        Calligraphy Card: "{item.giftMessage}"
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-sm text-[#1E1E1E] block">
                      {formatPrice((item.product?.price || 0) * item.quantity)}
                    </span>
                    <span className="text-[11px] text-[#888]">
                      {item.quantity} × {formatPrice(item.product?.price || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-[#EFEAE2] space-y-2 text-xs">
              <div className="flex justify-between text-[#666]">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal || order.totalAmount || 0)}</span>
              </div>
              {order.discountAmount ? (
                <div className="flex justify-between text-[#059669]">
                  <span>Discount ({order.couponCode || "Coupon"})</span>
                  <span>- {formatPrice(order.discountAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-[#666]">
                <span>Bangalore Courier Delivery</span>
                <span className="text-[#059669] font-medium">Free Signature Dispatch</span>
              </div>
              <div className="flex justify-between text-base font-serif font-bold text-[#1E1E1E] pt-2 border-t border-[#EFEAE2]">
                <span>Final Order Total</span>
                <span className="text-[#E10600]">{formatPrice(order.totalAmount || order.subtotal || 0)}</span>
              </div>
            </div>
          </div>

          {/* Internal Notes Module */}
          <div className="bg-white p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
            <h2 className="font-serif text-base font-bold text-[#1E1E1E]">
              Internal Notes
            </h2>
            <p className="text-xs text-[#777]">
              Confidential notes visible only to Happiwrapz staff and fulfillment florists.
            </p>

            {order.internalNotes && (
              <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2] text-xs font-mono whitespace-pre-wrap text-[#333]">
                {order.internalNotes}
              </div>
            )}

            <form onSubmit={handleAddInternalNote} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add internal note (e.g. ribbon color verified, delivery verified)..."
                className="flex-1 px-4 py-2 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-full text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white transition-colors"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#1E1E1E] text-white text-xs font-serif font-semibold hover:bg-[#E10600] transition-colors cursor-pointer"
              >
                Post Note
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Customer Info & Delivery Details */}
        <div className="space-y-6">
          {/* Customer Details Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
            <h2 className="font-serif text-base font-bold text-[#1E1E1E] flex items-center gap-2">
              <User className="w-4 h-4 text-[#E10600]" />
              <span>Client Profile</span>
            </h2>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#888] block">Name</span>
                <p className="font-bold text-sm text-[#1E1E1E]">{order.customer?.name}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#888] block">Phone (WhatsApp)</span>
                <a
                  href={`tel:${order.customer?.phone}`}
                  className="text-xs font-semibold text-[#E10600] hover:underline"
                >
                  {order.customer?.phone}
                </a>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#888] block">Email</span>
                <p className="text-xs text-[#555]">{order.customer?.email}</p>
              </div>
            </div>
          </div>

          {/* Delivery Coordinates Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
            <h2 className="font-serif text-base font-bold text-[#1E1E1E] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#E10600]" />
              <span>Bangalore Delivery</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2]">
                <span className="text-[10px] uppercase font-bold text-[#888] block">Destination Address</span>
                <p className="font-medium text-[#1E1E1E] mt-0.5 leading-relaxed">
                  {order.customer?.address}
                </p>
                <p className="text-[#666] font-semibold mt-0.5">
                  {order.customer?.city} {order.customer?.pincode ? `• ${order.customer.pincode}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <Calendar className="w-4 h-4 text-[#E10600]" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#888] block">Scheduled Date</span>
                  <span className="font-bold text-[#1E1E1E]">{order.deliveryDate || "Today"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs">
                <Clock className="w-4 h-4 text-[#E10600]" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#888] block">Delivery Window</span>
                  <span className="font-bold text-[#1E1E1E]">{order.deliverySlot}</span>
                </div>
              </div>

              {order.notes && (
                <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-amber-900 text-xs">
                  <span className="text-[10px] uppercase font-bold block mb-0.5">Client Instructions:</span>
                  <p>{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment & Verification */}
          <div className="bg-white p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-3 text-xs">
            <h2 className="font-serif text-base font-bold text-[#1E1E1E] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Payment Protocol</span>
            </h2>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <span className="font-bold block">{order.paymentMethod || "Zero Online Payment"}</span>
              <p className="text-[11px] mt-0.5 text-emerald-800">
                Status: <strong className="uppercase">{order.paymentStatus || "Confirmed on WhatsApp"}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
