"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, FileText, Globe, Eye, Upload, Sparkles, SlidersHorizontal, Save, Send, AlertCircle } from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";
import { WebsiteSettings } from "@/lib/store/types";
import CloudinarySingleImageUploader from "@/components/admin/CloudinarySingleImageUploader";

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [cloudinaryUsage, setCloudinaryUsage] = useState<any>(null);

  // Settings State
  const [settings, setSettings] = useState<WebsiteSettings>({
    announcement: "🎀 Handcrafted with love — Order requests open for Coimbatore & pan-India delivery",
    announcementActive: true,
    announcementLink: "/catalog",
    heroHeading: "The Moments Deserve Flowers.",
    heroSubheading: "Handcrafted satin ribbon roses, eternal sunflowers that never wilt, and signature European hand-tied wraps in Coimbatore with zero upfront payment.",
    heroButtonText: "Explore Collection",
    heroButtonLink: "/catalog",
    heroDesktopImage: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793977633/happiwrapz/products/yajzmq3oy9mbcvb8muqj.jpg",
    heroMobileImage: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793882678/happiwrapz/assets/hero-mobile-luxury.jpg",
    aboutImage: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg",
    promoBannerActive: true,
    promoBannerText: "✨ Handcrafted in Coimbatore, Tamil Nadu • Complimentary Handwritten Wax-Sealed Note Included",
    contactPhone: "+91 7708354636",
    contactEmail: "contact@happiwrapz.com",
    contactLocation: "Coimbatore, Tamil Nadu, India",
    instagramUrl: "https://www.instagram.com/happiwrapz/",
    deliveryRadiusKm: 25,
    minLeadTimeHours: 4,
    storeOpen: true,
    publishedAt: "2026-10-27T00:00:00.000Z",
    updatedBy: "Happiwrapz Owner",
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/content?t=" + Date.now(), { cache: "no-store" });
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
    fetch("/api/upload/cloudinary")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.metrics) {
          setCloudinaryUsage(data);
        }
      })
      .catch((err) => console.error("Cloudinary usage fetch error:", err));
  }, []);

  const handlePublish = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    setPublishing(true);
    setPublishError(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, actorName: "Happiwrapz Owner" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPublishedSuccess(true);
        if (data.settings) {
          setSettings(data.settings);
        }
        setTimeout(() => setPublishedSuccess(false), 3500);
      } else {
        setPublishError(data.error || "Failed to publish live changes. Please try again.");
      }
    } catch (err: any) {
      console.error("Publish error:", err);
      setPublishError(err.message || "Failed to reach server.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-6xl">
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

      {publishError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{publishError}</span>
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

        {/* Section 2.5: Storefront Imagery & Banners (Cloudinary Cloud Storage) */}
        <div className="space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFEAE2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1E1E1E]">
                Storefront Hero & Atelier Imagery
              </h2>
              <p className="text-xs text-[#666] mt-0.5">
                Manage high-res desktop banners, mobile hero photography, and atelier story imagery.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#722F37] bg-[#FAF8F5] border border-[#EFEAE2] px-3 py-1.5 rounded-full flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Cloudinary Cloud Storage Only
            </span>
          </div>

          {/* Live Cloudinary Free Plan Quota & Performance Strip */}
          {cloudinaryUsage && cloudinaryUsage.metrics && (
            <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-[#EFEAE2] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-serif text-[#888] tracking-wider block">Cloud Workspace</span>
                <span className="font-mono font-bold text-[#1E1E1E]">{cloudinaryUsage.cloudName}</span>
                <span className="text-[10px] text-emerald-600 block">● {cloudinaryUsage.plan} Plan Connected</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-serif text-[#888] tracking-wider block">Storage Used</span>
                <span className="font-mono font-bold text-[#1E1E1E]">{cloudinaryUsage.metrics.storage?.readable || "0 MB"}</span>
                <span className="text-[10px] text-[#777] block">{cloudinaryUsage.metrics.objects?.usage || 0} Assets Uploaded</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-serif text-[#888] tracking-wider block">Bandwidth Delivery</span>
                <span className="font-mono font-bold text-[#1E1E1E]">{cloudinaryUsage.metrics.bandwidth?.readable || "0 MB"}</span>
                <span className="text-[10px] text-[#777] block">CDN Edge Cached</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-serif text-[#888] tracking-wider block">Auto Transformations</span>
                <span className="font-mono font-bold text-[#1E1E1E]">{cloudinaryUsage.metrics.transformations?.usage || 0}</span>
                <span className="text-[10px] text-emerald-600 block">f_auto, q_auto Active</span>
              </div>
            </div>
          )}

          <CloudinarySingleImageUploader
            value={settings.heroDesktopImage || "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793977633/happiwrapz/products/yajzmq3oy9mbcvb8muqj.jpg"}
            onChange={(url) => setSettings({ ...settings, heroDesktopImage: url })}
            label="Desktop Hero Showcase Banner"
            description="Wide high-res editorial banner displayed across desktop viewports."
            aspectRatio="banner"
          />

          <CloudinarySingleImageUploader
            value={settings.heroMobileImage || "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793882678/happiwrapz/assets/hero-mobile-luxury.jpg"}
            onChange={(url) => setSettings({ ...settings, heroMobileImage: url })}
            label="Mobile Hero Showcase Banner"
            description="Portrait/square editorial banner optimized for smartphones and touch displays."
            aspectRatio="video"
          />

          <CloudinarySingleImageUploader
            value={settings.aboutImage || "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg"}
            onChange={(url) => setSettings({ ...settings, aboutImage: url })}
            label="Atelier Craft & Story Image"
            description="Featured photo displayed in the About / Craftsmanship studio section."
            aspectRatio="square"
          />
        </div>

        {/* Section 3: Concierge Coordinates & Delivery SLA */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
          <h2 className="font-serif text-base font-bold text-[#1E1E1E] pb-2 border-b border-[#EFEAE2]">
            Official Business Details & Delivery SLA
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#888] block">Phone / WhatsApp</label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#888] block">Store Email</label>
              <input
                type="text"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#888] block">Instagram Profile URL</label>
              <input
                type="text"
                value={settings.instagramUrl || "https://www.instagram.com/happiwrapz/"}
                onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
              />
            </div>
            <div className="space-y-1 sm:col-span-3">
              <label className="text-[10px] uppercase font-bold text-[#888] block">Business Location</label>
              <input
                type="text"
                value={settings.contactLocation || "Coimbatore, Tamil Nadu, India"}
                onChange={(e) => setSettings({ ...settings, contactLocation: e.target.value })}
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
