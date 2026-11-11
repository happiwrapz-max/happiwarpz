"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Home,
  MessageCircle,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

export default function ErrorBoundaryPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [incidentId, setIncidentId] = useState<string>("");
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const generatedId = `err-${Date.now().toString(36)}`;
    setIncidentId(generatedId);

    // Asynchronously report runtime error to centralized monitoring
    fetch("/api/monitoring/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message || "Unhandled client rendering error",
        stack: error.stack,
        route: typeof window !== "undefined" ? window.location.pathname : undefined,
        severity: "HIGH",
        viewportWidth: typeof window !== "undefined" ? window.innerWidth : 0,
        viewportHeight: typeof window !== "undefined" ? window.innerHeight : 0,
      }),
    }).catch(() => {
      // Never crash if reporting network fails
    });
  }, [error]);

  const handleSmartReset = () => {
    setIsRetrying(true);
    // Clear any potentially corrupted transient session markers
    try {
      sessionStorage.removeItem("hw_transient_retry");
    } catch {}
    setTimeout(() => {
      reset();
      setIsRetrying(false);
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-16 text-center text-[#1E1E1E]">
      <div className="max-w-lg w-full mx-auto space-y-6 animate-in fade-in duration-300">
        
        {/* Creative Untangled Ribbon / Alert Artwork */}
        <div className="w-20 h-20 rounded-full bg-[#E10600]/10 border border-[#E10600]/20 flex items-center justify-center mx-auto text-[#E10600]">
          <AlertTriangle className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] text-[10px] font-serif font-semibold text-[#E10600] uppercase tracking-[0.2em]">
            <Sparkles className="w-3 h-3 text-[#FFE082]" />
            <span>Atelier Auto-Recovery System</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal tracking-tight">
            A Little Knot in the <span className="italic text-[#E10600] font-light">Ribbon.</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#666] leading-relaxed max-w-md mx-auto font-sans">
            Our atelier encountered an unexpected thread while preparing this display. The incident has been recorded and our team has been dispatched.
          </p>
        </div>

        {/* Incident Reference Pill */}
        {incidentId && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] text-xs font-mono text-[#777]">
            <span>Incident Ref:</span>
            <strong className="text-[#1E1E1E]">{incidentId}</strong>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={handleSmartReset}
            disabled={isRetrying}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#E10600] hover:bg-[#c00500] text-white text-xs font-serif font-semibold uppercase tracking-wider transition-all shadow-md shadow-[#E10600]/25 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
            <span>{isRetrying ? "Untangling..." : "Untangle & Reconnect"}</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#EFEAE2] text-[#1E1E1E] text-xs font-serif font-semibold uppercase tracking-wider transition-all shadow-2xs"
          >
            <Home className="w-3.5 h-3.5 text-[#E10600]" />
            <span>Return Home</span>
          </Link>

          <a
            href={`https://wa.me/917708354636?text=Hi%20Happiwrapz,%20I%20encountered%20incident%20${incidentId}%20and%20need%20assistance.`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-white hover:bg-[#FAF8F5] border border-[#EFEAE2] text-[#1E1E1E] text-xs font-serif font-medium transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Concierge Direct</span>
          </a>
        </div>

        <div className="pt-4 border-t border-[#EFEAE2] text-[11px] text-[#888] flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Zero upfront payment & order selections remain preserved safely.</span>
        </div>

      </div>
    </div>
  );
}

