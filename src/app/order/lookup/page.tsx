"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { OrderRequest } from "@/lib/store/types";
import { formatPrice, formatDate, formatDateTime, ORDER_STATUSES } from "@/lib/utils";
import { Search, PackageCheck, Clock, MapPin, Phone, AlertCircle, ArrowRight, MessageSquare, CheckCircle2 } from "lucide-react";
import CourierTrackerCard from "@/components/order/CourierTrackerCard";

function LookupContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";
  const getOrderByReference = useOrderStore((s) => s.getOrderByReference);

  const [refInput, setRefInput] = useState(initialRef);
  const [searchedOrder, setSearchedOrder] = useState<OrderRequest | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const fetchOrder = async (ref: string) => {
    const cleanRef = ref.trim().toUpperCase();
    if (!cleanRef) return;
    setSearching(true);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(cleanRef)}`);
      const data = await res.json();
      if (res.ok && data.success && data.order) {
        setSearchedOrder(data.order);
        setHasSearched(true);
        setSearching(false);
        return;
      }
    } catch (err) {
      console.warn("Backend lookup fetch failed, checking local store", err);
    }

    // Fallback to client state store
    const localMatch = getOrderByReference(cleanRef);
    setSearchedOrder(localMatch || null);
    setHasSearched(true);
    setSearching(false);
  };

  useEffect(() => {
    if (initialRef) {
      fetchOrder(initialRef);
    }
  }, [initialRef]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refInput.trim()) return;
    fetchOrder(refInput);
  };

  return (
    <div className="container-main max-w-3xl pt-28 pb-16 sm:pt-32 sm:pb-20">
      <div className="text-center mb-10">
        <span className="text-[11px] font-serif font-semibold tracking-[0.25em] text-[#E10600] uppercase block mb-1">
          CONCIERGE TRACKING
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl text-[#1E1E1E] font-normal">
          Track Your Order Request
        </h1>
        <p className="text-xs sm:text-sm font-sans text-[#666] mt-2">
          Enter your reference code (e.g.,{" "}
          <strong className="text-[#E10600] font-mono">HW-A3K7P9</strong>) to view real-time order progress.
        </p>
      </div>

      {/* Reference Input Form */}
      <form onSubmit={handleSearch} className="max-w-md mx-auto mb-12">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
            <input
              type="text"
              required
              value={refInput}
              onChange={(e) => setRefInput(e.target.value.toUpperCase())}
              placeholder="HW-XXXXXX"
              className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm bg-[#FAF8F5] border border-[#EFEAE2] rounded-full text-[#1E1E1E] font-mono font-bold tracking-wider focus:outline-hidden focus:border-[#E10600] focus:bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="rounded-full bg-[#E10600] hover:bg-[#C20500] disabled:opacity-60 text-white px-7 py-3 text-xs uppercase tracking-wider font-serif font-semibold transition-all duration-300 shadow-xs cursor-pointer shrink-0"
          >
            {searching ? "Searching..." : "Track"}
          </button>
        </div>
      </form>

      {/* Results Box */}
      {hasSearched && (
        <>
          {searchedOrder ? (
            <div className="bg-white rounded-3xl border border-[#EFEAE2] p-6 sm:p-10 shadow-lg space-y-8 animate-fade-in">
              {/* Header Badge */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#EFEAE2]">
                <div>
                  <span className="text-[10px] font-serif uppercase tracking-wider text-[#888] block">
                    Order Reference
                  </span>
                  <span className="font-mono text-2xl font-bold text-[#E10600]">
                    {searchedOrder.reference}
                  </span>
                  <p className="text-xs text-[#777] mt-0.5">
                    Submitted on {formatDateTime(searchedOrder.createdAt)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="px-3.5 py-1.5 rounded-full bg-[#E10600]/10 text-[#E10600] text-xs font-serif uppercase tracking-wider font-semibold border border-[#E10600]/20">
                    {ORDER_STATUSES[searchedOrder.status]?.label || searchedOrder.status}
                  </span>
                </div>
              </div>

              {/* Recipient & Schedule Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] space-y-1.5">
                  <span className="font-serif uppercase text-[10px] text-[#888] tracking-wider block">
                    Recipient Details
                  </span>
                  <p className="font-serif font-semibold text-sm text-[#1E1E1E]">
                    {searchedOrder.customer.name}
                  </p>
                  <p className="text-[#666] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#E10600]" />
                    <span>{searchedOrder.customer.phone}</span>
                  </p>
                  <p className="text-[#666] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#E10600]" />
                    <span>{searchedOrder.customer.address}, {searchedOrder.customer.city}</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] space-y-1.5">
                  <span className="font-serif uppercase text-[10px] text-[#888] tracking-wider block">
                    Scheduled Delivery
                  </span>
                  <p className="font-serif font-semibold text-sm text-[#1E1E1E]">
                    {searchedOrder.deliveryDate ? formatDate(searchedOrder.deliveryDate) : formatDate(searchedOrder.createdAt)}
                  </p>
                  <p className="text-[#666] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#E10600]" />
                    <span>{searchedOrder.deliverySlot}</span>
                  </p>
                  <p className="text-[#059669] text-[11px] font-medium">
                    Zero payment charged online (WhatsApp verified)
                  </p>
                </div>
              </div>

              {/* Third-Party Courier Tracking Module */}
              <CourierTrackerCard order={searchedOrder} />

              {/* Items List */}
              <div>
                <h3 className="font-serif text-sm font-semibold text-[#1E1E1E] uppercase tracking-wider mb-3">
                  Selected Items
                </h3>
                <div className="divide-y divide-[#EFEAE2] border border-[#EFEAE2] rounded-2xl p-4 bg-[#FAF8F5]">
                  {searchedOrder.items.map((item) => (
                    <div key={item.product.id} className="py-2.5 first:pt-0 last:pb-0 flex justify-between text-xs">
                      <div>
                        <span className="font-serif font-semibold text-[#1E1E1E]">{item.product.name}</span>
                        <span className="text-[#888] ml-2">× {item.quantity}</span>
                      </div>
                      <span className="font-serif font-bold text-[#E10600]">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-3 mt-2 border-t border-[#EFEAE2] flex justify-between font-serif font-bold text-sm text-[#1E1E1E]">
                    <span>Total Amount</span>
                    <span className="text-[#E10600]">
                      {formatPrice(searchedOrder.items.reduce((s, it) => s + it.product.price * it.quantity, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Support Action */}
              <div className="text-center pt-2">
                <a
                  href={`https://wa.me/917708354636?text=Hello%20Happiwrapz!%20Checking%20status%20for%20order%20${searchedOrder.reference}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-7 py-3 rounded-full text-xs font-serif uppercase tracking-wider font-semibold transition-all shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message Owner on WhatsApp</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-[#FAF8F5] rounded-3xl p-10 text-center border border-[#EFEAE2] max-w-md mx-auto">
              <AlertCircle className="w-10 h-10 text-[#E10600] mx-auto mb-3" />
              <h2 className="font-serif text-lg text-[#1E1E1E] mb-1 font-semibold">
                No matching order request found
              </h2>
              <p className="text-xs text-[#666] leading-relaxed mb-4">
                Please verify your reference code (e.g. HW-A3K7P9) or connect directly with our concierge.
              </p>
              <Link
                href="/catalog"
                className="text-xs font-serif uppercase tracking-wider text-[#E10600] font-semibold underline underline-offset-4"
              >
                Browse Catalog
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function OrderLookupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1E1E1E] selection:bg-[#E10600]/15 selection:text-[#E10600]">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="container-main py-32 text-center font-serif">Loading concierge tracker...</div>}>
          <LookupContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
