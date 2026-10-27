"use client";

import { useState, useEffect } from "react";
import { Check, Settings, Power, Clock, MapPin, Loader2, Sparkles } from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [storeOpen, setStoreOpen] = useState(true);
  const [leadTimeHours, setLeadTimeHours] = useState("4");
  const [morningSlot, setMorningSlot] = useState(true);
  const [afternoonSlot, setAfternoonSlot] = useState(true);
  const [eveningSlot, setEveningSlot] = useState(true);
  const [deliveryRadius, setDeliveryRadius] = useState("25");
  const [ownerWhatsApp, setOwnerWhatsApp] = useState("+91 98765 43210");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/content");
        const data = await res.json();
        if (res.ok && data.success && data.settings) {
          setStoreOpen(data.settings.storeOpen ?? true);
          setLeadTimeHours(String(data.settings.minLeadTimeHours ?? 4));
          setDeliveryRadius(String(data.settings.deliveryRadiusKm ?? 25));
          setOwnerWhatsApp(data.settings.contactPhone ?? "+91 98765 43210");
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            storeOpen,
            minLeadTimeHours: Number(leadTimeHours) || 4,
            deliveryRadiusKm: Number(deliveryRadius) || 25,
            contactPhone: ownerWhatsApp,
          },
          actorName: "Happiwrapz Owner",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(data.error || "Failed to update settings");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while saving settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <span className="text-xs font-semibold tracking-[0.2em] text-[#888888] uppercase">
          Studio Operations
        </span>
        <h1 className="font-serif text-3xl text-[#2A2A2A] mt-1">
          Delivery & Store Controls
        </h1>
        <p className="text-xs text-[#666666] mt-1">
          Configure Bangalore delivery slots, fulfillment lead times, emergency pause mode, and concierge contact numbers.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#888888] flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[var(--signal-red)]" />
          Loading studio configuration...
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] shadow-xs space-y-6"
        >
          {/* Store Pause / Open Switch */}
          <div
            className={`p-5 rounded-2xl border flex items-center justify-between transition-colors ${
              storeOpen
                ? "bg-emerald-50/60 border-emerald-200"
                : "bg-red-50/60 border-red-200"
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <Power
                  className={`w-4 h-4 ${
                    storeOpen ? "text-emerald-600" : "text-red-600"
                  }`}
                />
                <strong className="text-sm font-semibold text-[#2A2A2A]">
                  {storeOpen
                    ? "Studio is Open for Order Requests"
                    : "Studio Order Requests are Currently Paused"}
                </strong>
              </div>
              <p className="text-xs text-[#666666] mt-0.5">
                {storeOpen
                  ? "Clients can place requests for Bangalore handcrafted ribbon flower delivery."
                  : "A prominent notice informs visitors that the atelier is preparing upcoming holiday batches."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStoreOpen(!storeOpen)}
              className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                storeOpen
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {storeOpen ? "Pause Orders" : "Resume Orders"}
            </button>
          </div>

          {/* Lead Times & WhatsApp */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2A2A2A]">
              Fulfillment Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                  Minimum Handcrafting Lead Time (Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={leadTimeHours}
                  onChange={(e) => setLeadTimeHours(e.target.value)}
                  className="w-full text-xs p-3 bg-white border border-[#C0C0C0] rounded-xl text-[#2A2A2A] focus:outline-none focus:border-[#2A2A2A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                  Delivery Coverage Radius (km from Koramangala Studio)
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={deliveryRadius}
                  onChange={(e) => setDeliveryRadius(e.target.value)}
                  className="w-full text-xs p-3 bg-white border border-[#C0C0C0] rounded-xl text-[#2A2A2A] focus:outline-none focus:border-[#2A2A2A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                Store Owner WhatsApp Concierge Number (for customer inquiry routing)
              </label>
              <input
                type="tel"
                value={ownerWhatsApp}
                onChange={(e) => setOwnerWhatsApp(e.target.value)}
                className="w-full text-xs p-3 bg-white border border-[#C0C0C0] rounded-xl text-[#2A2A2A] focus:outline-none focus:border-[#2A2A2A]"
              />
            </div>
          </div>

          {/* Active Delivery Slots */}
          <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2A2A2A]">
              Active Bangalore Hand-Delivery Slots
            </h3>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--canvas-warm)] border border-[var(--border-subtle)] cursor-pointer">
                <span>Morning Delivery Window (9:00 AM - 12:00 PM)</span>
                <input
                  type="checkbox"
                  checked={morningSlot}
                  onChange={(e) => setMorningSlot(e.target.checked)}
                  className="w-4 h-4 text-[var(--signal-red)] accent-[var(--signal-red)]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--canvas-warm)] border border-[var(--border-subtle)] cursor-pointer">
                <span>Afternoon Delivery Window (1:00 PM - 5:00 PM)</span>
                <input
                  type="checkbox"
                  checked={afternoonSlot}
                  onChange={(e) => setAfternoonSlot(e.target.checked)}
                  className="w-4 h-4 text-[var(--signal-red)] accent-[var(--signal-red)]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--canvas-warm)] border border-[var(--border-subtle)] cursor-pointer">
                <span>Evening Hand-Delivery Window (6:00 PM - 9:00 PM)</span>
                <input
                  type="checkbox"
                  checked={eveningSlot}
                  onChange={(e) => setEveningSlot(e.target.checked)}
                  className="w-4 h-4 text-[var(--signal-red)] accent-[var(--signal-red)]"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <span className="text-[11px] text-[#888888]">
              Modifications are persisted to database and recorded in the audit trail.
            </span>

            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[var(--charcoal)] hover:bg-[var(--signal-red)] text-white px-8 py-3 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Saved to Database</span>
                </>
              ) : (
                <span>Save Studio Settings</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
