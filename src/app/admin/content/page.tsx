"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, FileText, Globe, Eye, Upload, Sparkles, SlidersHorizontal, Save, Send } from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";
import { WebsiteSettings } from "@/lib/store/types";

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<WebsiteSettings>({
    announcement: "🎀 Handcrafted with love — Order requests open for Bangalore delivery",
    announcementActive: true,
    announcementLink: "/catalog",
    heroHeading: "The Moments Deserve Flowers.",
    heroSubheading: "Handcrafted satin ribbon roses, eternal sunflowers that never wilt, and signature European hand-tied wraps in Bangalore with zero upfront payment.",
    heroButtonText: "Explore Collection",
    heroButtonLink: "/catalog",
    promoBannerActive: true,
    promoBannerText: "✨ Handcrafted in Bangalore • Complimentary Handwritten Wax-Sealed Note Included",
    contactPhone: "+91 98765 43210",
    contactEmail: "concierge@happiwrapz.in",
    deliveryRadiusKm: 25,
    minLeadTimeHours: 4,
    storeOpen: true,
    publishedAt: "2026-10-27T00:00:00.000Z",
    updatedBy: "Happiwrapz Owner",
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/content");
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Content fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, actorName: "Happiwrapz Owner" }),
      });
      const data = await res.json();
      if (data.success) {
        setPublishedSuccess(true);
        setTimeout(() => setPublishedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Publish error:", err);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE2]">
        <div>
          <span className="text-xs font-semibold tracking-[0.2em] text-[#888888] uppercase">
            Storefront Presentation
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal mt-0.5">
            Website Customization Studio
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Manage announcement bar, hero banners, brand copy, and promotional messaging across the live customer storefront.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-[#EFEAE2] hover:border-[#CCC] text-xs font-serif font-semibold text-[#1E1E1E] transition-colors shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </Link>

          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#E10600] hover:bg-[#C20500] text-white text-xs font-serif font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{publishing ? "Publishing..." : "Publish Live Changes"}</span>
          </button>
        </div>
      </div>

      {publishedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Storefront published successfully! All customer-facing pages are now synchronized.</span>
        </div>
      )}

      <form onSubmit={handlePublish} className="space-y-6">
        {/* Section 1: Top Announcement Bar */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#EFEAE2]">
            <h2 className="font-serif text-base font-bold text-[#1E1E1E]">
              Top Announcement Bar
            </h2>
            <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={settings.announcementActive}
                onChange={(e) =>
                  setSettings({ ...settings, announcementActive: e.target.checked })
                }
                className="rounded border-[#CCC] text-[#E10600] focus:ring-[#E10600]"
              />
              <span>Active on Storefront</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#555] block">
              Announcement Message
            </label>
            <input
              type="text"
              value={settings.announcement}
              onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
              className="w-full px-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-2xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#555] block">
              Click Destination Link
            </label>
            <input
              type="text"
              value={settings.announcementLink || "/catalog"}
              onChange={(e) => setSettings({ ...settings, announcementLink: e.target.value })}
              className="w-full px-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-2xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white"
            />
          </div>
        </div>

        {/* Section 2: Homepage Hero Narrative */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
          <h2 className="font-serif text-base font-bold text-[#1E1E1E] pb-2 border-b border-[#EFEAE2]">
            Homepage Hero Narrative
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#555] block">
              Main Headline
            </label>
            <input
              type="text"
              value={settings.heroHeading}
              onChange={(e) => setSettings({ ...settings, heroHeading: e.target.value })}
              className="w-full px-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-2xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#555] block">
              Supporting Narrative Paragraph
            </label>
            <textarea
              rows={3}
              value={settings.heroSubheading}
              onChange={(e) => setSettings({ ...settings, heroSubheading: e.target.value })}
              className="w-full px-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-2xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#555] block">Primary Button Text</label>
              <input
                type="text"
                value={settings.heroButtonText}
                onChange={(e) => setSettings({ ...settings, heroButtonText: e.target.value })}
                className="w-full px-4 py-2 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#555] block">Button Destination</label>
              <input
                type="text"
                value={settings.heroButtonLink}
                onChange={(e) => setSettings({ ...settings, heroButtonLink: e.target.value })}
                className="w-full px-4 py-2 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Concierge Coordinates & Delivery SLA */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
          <h2 className="font-serif text-base font-bold text-[#1E1E1E] pb-2 border-b border-[#EFEAE2]">
            Concierge Coordinates & Bangalore SLA
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#888] block">WhatsApp Contact</label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#888] block">Atelier Email</label>
              <input
                type="text"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#888] block">Delivery Radius (km)</label>
              <input
                type="number"
                value={settings.deliveryRadiusKm}
                onChange={(e) => setSettings({ ...settings, deliveryRadiusKm: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#888] block">Lead Time (Hours)</label>
              <input
                type="number"
                value={settings.minLeadTimeHours}
                onChange={(e) => setSettings({ ...settings, minLeadTimeHours: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
              />
            </div>
          </div>
        </div>

        {/* Publish Action Button */}
        <div className="pt-2 text-right">
          <button
            type="submit"
            disabled={publishing}
            className="px-8 py-3 rounded-full bg-[#E10600] hover:bg-[#C20500] text-white text-xs font-serif font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {publishing ? "Publishing Updates..." : "Save & Publish to Storefront"}
          </button>
        </div>
      </form>
    </div>
  );
}
