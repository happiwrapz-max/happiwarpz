"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBagStore } from "@/lib/store/useBagStore";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { formatPrice } from "@/lib/utils";
import { ShieldCheck, Calendar, Clock, MapPin, User, CheckCircle2 } from "lucide-react";

export default function OrderRequestForm() {
  const router = useRouter();
  const { items, totalPrice, clearBag, closeDrawer } = useBagStore();
  const createOrder = useOrderStore((s) => s.createOrder);
  const { user } = useAuthStore();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("+91 ");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Coimbatore");
  const [pincode, setPincode] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [deliverySlot, setDeliverySlot] = useState("Morning (9:00 AM - 12:00 PM)");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Your bag is empty. Please add gifts before submitting.");
      return;
    }
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      setError("Please fill in all recipient contact and delivery fields.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const customerData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
    };

    try {
      // 1. Submit to Backend API
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customer: customerData,
          deliveryDate,
          deliverySlot,
          notes: notes.trim() ? notes.trim() : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.order) {
        // Also keep client state in sync
        createOrder(
          items,
          customerData,
          deliveryDate,
          deliverySlot,
          notes.trim() ? notes.trim() : undefined
        );

        clearBag();
        closeDrawer();
        router.push(`/order/confirmation?ref=${data.order.reference}`);
        return;
      }

      // Fallback if backend returned an error message
      throw new Error(data.error || "Failed to process order");
    } catch {
      // Offline fallback: create locally in client store
      try {
        const localOrder = createOrder(
          items,
          customerData,
          deliveryDate,
          deliverySlot,
          notes.trim() ? notes.trim() : undefined
        );
        clearBag();
        closeDrawer();
        router.push(`/order/confirmation?ref=${localOrder.reference}`);
      } catch {
        setError("Failed to create order request. Please try again.");
        setSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Zero Payment Policy Notice */}
      <div className="p-4 bg-[#FAF8F5] border border-[#EFEAE2] rounded-2xl text-xs text-[#1E1E1E] leading-relaxed shadow-2xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#E10600] shrink-0 mt-0.5" />
          <div>
            <strong className="font-serif font-semibold text-[#E10600] block text-sm mb-0.5">
              Zero Online Payment Guarantee
            </strong>
            No payment is charged on this website. When you submit this request,
            the Happiwrapz store owner personally verifies morning bloom availability,
            confirms your slot, and coordinates directly with you via WhatsApp.
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl">
          {error}
        </div>
      )}

      {/* Recipient Contact Details */}
      <div className="space-y-4">
        <h3 className="text-xs font-serif font-semibold text-[#E10600] uppercase tracking-[0.2em] flex items-center gap-2">
          <User className="w-4 h-4 text-[#E10600]" />
          Recipient & Sender Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] font-medium text-[#666] mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full text-xs p-3 bg-white border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600] transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#666] mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. priya@example.com"
              className="w-full text-xs p-3 bg-white border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600] transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[#666] mb-1">
            WhatsApp Phone Number * (for owner confirmation)
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full text-xs p-3 bg-white border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600] transition-all"
          />
        </div>
      </div>

      {/* Delivery Destination */}
      <div className="space-y-4 pt-4 border-t border-[#EFEAE2]">
        <h3 className="text-xs font-serif font-semibold text-[#E10600] uppercase tracking-[0.2em] flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#E10600]" />
          Delivery Address
        </h3>

        <div>
          <label className="block text-[11px] font-medium text-[#666] mb-1">
            Street Address / Apartment / Landmark *
          </label>
          <textarea
            required
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Flat 402, Rosewood Heights, 12th Main, Koramangala 4th Block"
            className="w-full text-xs p-3 bg-white border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600] transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] font-medium text-[#666] mb-1">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full text-xs p-3 bg-white border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#666] mb-1">
              Pincode
            </label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="560034"
              className="w-full text-xs p-3 bg-white border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Scheduling & Slot */}
      <div className="space-y-4 pt-4 border-t border-[#EFEAE2]">
        <h3 className="text-xs font-serif font-semibold text-[#E10600] uppercase tracking-[0.2em] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#E10600]" />
          Preferred Delivery Timing
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] font-medium text-[#666] mb-1">
              Preferred Date *
            </label>
            <input
              type="date"
              required
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full text-xs p-3 bg-white border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#666] mb-1">
              Delivery Slot *
            </label>
            <select
              value={deliverySlot}
              onChange={(e) => setDeliverySlot(e.target.value)}
              className="w-full text-xs p-3 bg-white border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] transition-all cursor-pointer font-serif"
            >
              <option value="Morning (9:00 AM - 12:00 PM)">
                Morning (9:00 AM - 12:00 PM)
              </option>
              <option value="Afternoon (1:00 PM - 5:00 PM)">
                Afternoon (1:00 PM - 5:00 PM)
              </option>
              <option value="Evening (6:00 PM - 9:00 PM)">
                Evening (6:00 PM - 9:00 PM)
              </option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[#666] mb-1">
            Special Instructions / Gate Code / Surprise Instructions
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Ring bell softly, surprise delivery"
            className="w-full text-xs p-3 bg-white border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] transition-all"
          />
        </div>
      </div>

      {/* Summary and Submit CTA */}
      <div className="pt-4 border-t border-[#EFEAE2] space-y-4">
        <div className="flex justify-between items-center text-sm font-serif font-medium text-[#1E1E1E]">
          <span>Estimated Request Value:</span>
          <span className="text-xl font-bold text-[#E10600]">{formatPrice(totalPrice())}</span>
        </div>
        <p className="text-[11px] text-[#888]">
          * Amount is for quote reference only. No payment gateway will be triggered online.
        </p>

        <button
          type="submit"
          disabled={submitting || items.length === 0}
          className="w-full rounded-full bg-[#E10600] hover:bg-[#C20500] text-white py-4 text-xs font-serif font-semibold uppercase tracking-widest transition-all duration-300 shadow-[0_4px_16px_rgba(225,6,0,0.3)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <span>Generating Order Request...</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Order Request for Confirmation</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
