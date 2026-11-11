"use client";

import { useState } from "react";
import { Truck, ExternalLink, Copy, Check, Sparkles, MessageSquare } from "lucide-react";
import { OrderRequest } from "@/lib/store/types";

interface CourierTrackerCardProps {
  order: OrderRequest;
}

export function buildTrackingUrl(trackingUrl?: string, trackingNumber?: string): string {
  const id = trackingNumber?.trim() || "";
  const url = trackingUrl?.trim() || "https://www.delhivery.com/track/package/";

  if (id) {
    if (url.includes("{id}")) return url.replace("{id}", encodeURIComponent(id));
    if (url.includes("{trackingId}")) return url.replace("{trackingId}", encodeURIComponent(id));
    if (url.includes("{awb}")) return url.replace("{awb}", encodeURIComponent(id));
    if (url.endsWith("/")) return `${url}${encodeURIComponent(id)}`;
    if (url.includes("delhivery.com") && !url.includes(id)) {
      return `https://www.delhivery.com/track/package/${encodeURIComponent(id)}`;
    }
    if (url.includes("bluedart.com") && !url.includes(id)) {
      return `https://track.bluedart.com/?track_numbers=${encodeURIComponent(id)}`;
    }
    if (url.includes("dtdc.in") && !url.includes(id)) {
      return `https://www.dtdc.in/tracking/shipment-tracking.asp?strcnno=${encodeURIComponent(id)}`;
    }
    if (url.includes("indiapost.gov.in") && !url.includes(id)) {
      return `https://www.indiapost.gov.in/_layouts/15/dpt.ptc.track/trackvalue.aspx?id=${encodeURIComponent(id)}`;
    }
  }
  return url;
}

export default function CourierTrackerCard({ order }: CourierTrackerCardProps) {
  const [copied, setCopied] = useState(false);
  const [redirectToast, setRedirectToast] = useState(false);

  const hasTracking = Boolean(order.trackingNumber || order.trackingUrl);
  const courier = order.courierName || "Courier Delivery Partner";
  const trackingId = order.trackingNumber || "";

  const handleCopyId = () => {
    if (!trackingId) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(trackingId).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTrackRedirect = () => {
    const targetUrl = buildTrackingUrl(order.trackingUrl, order.trackingNumber);

    // 1. Auto-copy tracking ID to user's clipboard
    if (trackingId && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(trackingId).catch(() => {});
      setCopied(true);
    }

    // 2. Show instant feedback toast
    setRedirectToast(true);

    // 3. Open third-party courier tracking website in new tab
    if (typeof window !== "undefined") {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }

    setTimeout(() => {
      setRedirectToast(false);
      setCopied(false);
    }, 3500);
  };

  const whatsappInquiryUrl = `https://wa.me/917708354636?text=${encodeURIComponent(
    `Hello Happiwrapz! Checking dispatch & tracking status for my order ${order.reference}.`
  )}`;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] space-y-3 relative overflow-hidden">
      {/* Toast Notification when Redirecting */}
      {redirectToast && (
        <div className="absolute top-2 inset-x-2 sm:inset-x-auto sm:right-2 z-20 px-3.5 py-2 rounded-xl bg-[#1E1E1E] text-white text-xs font-sans shadow-lg flex items-center gap-2 animate-fade-slide-up">
          <Sparkles className="w-3.5 h-3.5 text-[#FFE082]" />
          <span>Tracking ID copied! Opening {courier} portal...</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#EFEAE2]/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E10600]/10 flex items-center justify-center text-[#E10600]">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-serif uppercase tracking-wider text-[#888] block">
              Shipment Tracking
            </span>
            <h4 className="font-serif font-bold text-sm text-[#1E1E1E]">
              {courier}
            </h4>
          </div>
        </div>

        {hasTracking ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Dispatched via {courier}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200 self-start sm:self-auto">
            <span>In Handcrafted Atelier</span>
          </span>
        )}
      </div>

      {hasTracking ? (
        <div className="space-y-3 pt-1">
          {/* Tracking ID & 1-Click Copy Box */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-xl border border-[#EFEAE2]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#888] tracking-wider block">
                Consignment / Tracking ID:
              </span>
              <span className="font-mono font-bold text-sm text-[#1E1E1E] tracking-wider">
                {trackingId || "Assigned on Dispatch"}
              </span>
            </div>

            {trackingId && (
              <button
                type="button"
                onClick={handleCopyId}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer self-start sm:self-auto ${
                  copied
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "bg-[#FAF8F5] border-[#EFEAE2] text-[#555] hover:text-[#1E1E1E] hover:border-[#CCC]"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Primary Action: Auto-Copy & Redirect Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={handleTrackRedirect}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#E10600] hover:bg-[#C20500] text-white text-xs font-serif uppercase tracking-wider font-semibold transition-all shadow-xs cursor-pointer group"
            >
              <span>Track on {courier}</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#EFEAE2] hover:border-[#25D366] text-xs font-serif font-medium text-[#1E1E1E] hover:text-[#25D366] transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
              <span>Ask Concierge</span>
            </a>
          </div>

          <p className="text-[10px] text-[#888] font-sans leading-tight">
            💡 <strong>How it works:</strong> Clicking &ldquo;Track&rdquo; automatically copies your tracking ID to your clipboard and opens the {courier} tracking page.
          </p>
        </div>
      ) : (
        <div className="p-3 bg-white rounded-xl border border-[#EFEAE2] text-xs text-[#666] space-y-2">
          <p>
            Our artisan florists are folding your satin ribbon flowers meticulously by hand in our Coimbatore atelier. Your third-party courier tracking ID and live tracking link will appear here as soon as your package is dispatched!
          </p>
          <div className="pt-1">
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#25D366] font-semibold hover:underline"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Inquire about dispatch timing on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

