"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { formatPrice, formatDate } from "@/lib/utils";
import { CheckCircle2, Phone, MapPin, Calendar, ArrowRight, ShieldCheck, Clock, MessageSquare } from "lucide-react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const getOrderByReference = useOrderStore((s) => s.getOrderByReference);
  const order = ref ? getOrderByReference(ref) : undefined;

  const displayRef = order?.reference || ref || "HW-A3K7P9";
  const customerName = order?.customer.name || "Valued Customer";
  const deliveryDate = order?.deliveryDate ? formatDate(order.deliveryDate) : "Tomorrow";
  const deliverySlot = order?.deliverySlot || "Morning (9:00 AM - 11:00 AM)";

  const whatsappMessage = encodeURIComponent(
    `Hello Happiwrapz! I just submitted order request ${displayRef} for ${customerName}. Could you please confirm bloom availability for ${deliveryDate} (${deliverySlot})?`
  );

  return (
    <div className="container-main max-w-3xl pt-28 pb-16 sm:pt-32 sm:pb-20">
      <div className="bg-white rounded-3xl border border-[#EFEAE2] p-8 sm:p-14 shadow-lg text-center">
        {/* Animated Checkmark in Signal Red & Crisp White */}
        <div className="w-20 h-20 rounded-full bg-[#FAF8F5] text-[#E10600] border-2 border-[#E10600]/20 flex items-center justify-center mx-auto mb-6 shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-serif font-semibold tracking-[0.25em] text-[#E10600] uppercase">
          Order Request Dispatched
        </span>

        <h1 className="font-serif text-3xl sm:text-5xl text-[#1E1E1E] mt-2 mb-3 font-normal">
          Thank you, {customerName}!
        </h1>

        <p className="text-xs sm:text-sm font-sans text-[#555] max-w-md mx-auto leading-relaxed mb-8">
          Your bespoke bouquet request has been dispatched directly to the Happiwrapz team. We are reviewing artisan crafting schedule and will connect via WhatsApp.
        </p>

        {/* Highlighted Order Reference Card (Image 1 & 4 inspired) */}
        <div className="p-6 bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2] max-w-md mx-auto mb-10 text-left space-y-3.5 shadow-2xs">
          <div className="flex justify-between items-center pb-3 border-b border-[#EFEAE2]">
            <span className="text-xs font-serif uppercase tracking-wider text-[#777]">
              Reference Code
            </span>
            <span className="font-mono text-xl font-bold text-[#E10600] tracking-wider">
              {displayRef}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs font-serif">
            <span className="text-[#666]">Current Status:</span>
            <span className="px-3 py-1 rounded-full bg-[#E10600] text-white text-[10px] uppercase font-semibold">
              Pending Confirmation
            </span>
          </div>

          <div className="flex justify-between items-center text-xs font-serif">
            <span className="text-[#666]">Scheduled Date:</span>
            <span className="font-medium text-[#1E1E1E]">{deliveryDate}</span>
          </div>

          <div className="flex justify-between items-center text-xs font-serif">
            <span className="text-[#666]">Delivery Window:</span>
            <span className="font-medium text-[#1E1E1E]">{deliverySlot}</span>
          </div>

          <div className="flex justify-between items-center text-xs pt-3 border-t border-[#EFEAE2] font-serif">
            <span className="text-[#666]">Payment Method:</span>
            <span className="font-semibold text-[#059669]">
              Zero Online Charge (Confirmed on WhatsApp)
            </span>
          </div>
        </div>

        {/* 4-Step Lifecycle Stepper */}
        <div className="max-w-xl mx-auto mb-10 text-left font-serif">
          <h2 className="text-xs font-semibold text-[#E10600] uppercase tracking-[0.2em] mb-6 text-center">
            How Happiwrapz Fulfills Your Request
          </h2>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EFEAE2]">
            <div className="relative flex items-start gap-4">
              <span className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-[#E10600] text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              <div>
                <h3 className="text-xs font-bold text-[#1E1E1E]">
                  1. Order Request Received
                </h3>
                <p className="text-[11px] font-sans text-[#666]">
                  Details recorded with reference {displayRef}.
                </p>
              </div>
            </div>

            <div className="relative flex items-start gap-4">
              <span className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-white border border-[#E10600] text-[#E10600] flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <div>
                <h3 className="text-xs font-bold text-[#1E1E1E]">
                  2. Ribbon Bloom Verification & WhatsApp Connect
                </h3>
                <p className="text-[11px] font-sans text-[#666]">
                  The store owner verifies ribbon flower colors and confirms handcrafted details with you.
                </p>
              </div>
            </div>

            <div className="relative flex items-start gap-4">
              <span className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-white border border-[#CCC] text-[#888] flex items-center justify-center text-[10px] font-bold">
                3
              </span>
              <div>
                <h3 className="text-xs font-bold text-[#666]">
                  3. Handcrafted Preparation
                </h3>
                <p className="text-[11px] font-sans text-[#888]">
                  European waterproof wrap and ribbon tying at our studio in Coimbatore, Tamil Nadu, India.
                </p>
              </div>
            </div>

            <div className="relative flex items-start gap-4">
              <span className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-white border border-[#CCC] text-[#888] flex items-center justify-center text-[10px] font-bold">
                4
              </span>
              <div>
                <h3 className="text-xs font-bold text-[#666]">
                  4. Climate-Protected Delivery
                </h3>
                <p className="text-[11px] font-sans text-[#888]">
                  Hand-delivered to your door in Bangalore on {deliveryDate}.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={`https://wa.me/919876543210?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white px-8 py-3.5 rounded-full text-xs font-serif uppercase tracking-wider font-semibold shadow-[0_4px_16px_rgba(37,211,102,0.3)] transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Connect on WhatsApp Now</span>
          </a>

          <Link
            href={`/order/lookup?ref=${displayRef}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FAF8F5] hover:bg-[#F0ECE4] text-[#1E1E1E] border border-[#EFEAE2] px-7 py-3.5 rounded-full text-xs font-serif uppercase tracking-wider font-medium transition-colors"
          >
            <span>Live Order Tracker</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#E10600]" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1E1E1E] selection:bg-[#E10600]/15 selection:text-[#E10600]">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="container-main py-32 text-center font-serif">Loading request status...</div>}>
          <ConfirmationContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
