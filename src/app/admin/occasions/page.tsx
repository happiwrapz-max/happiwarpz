"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Edit2,
  Heart,
  Check,
  X,
  Sparkles,
  Eye,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";
import { OccasionRecord } from "@/lib/server/db";
import CloudinarySingleImageUploader from "@/components/admin/CloudinarySingleImageUploader";

export default function AdminOccasionsPage() {
  const [occasions, setOccasions] = useState<OccasionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [recommendedSlug, setRecommendedSlug] = useState("red-rose-bouquet");
  const [bannerImage, setBannerImage] = useState("https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg");
  const [badge, setBadge] = useState("Curated Keepsake");

  // Edit Modal State
  const [editingOccasion, setEditingOccasion] = useState<OccasionRecord | null>(null);

  const fetchOccasions = async () => {
    try {
      const res = await fetch("/api/admin/occasions");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.occasions)) {
        setOccasions(data.occasions);
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: "Failed to load occasions: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccasions();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/occasions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          headline: headline.trim() || "Handcrafted satin ribbon flower arrangements",
          recommendedSlug: recommendedSlug.trim() || "red-rose-bouquet",
          bannerImage: bannerImage.trim() || "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg",
          badge: badge.trim() || "Celebration",
          active: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setName("");
        setHeadline("");
        showToast(`Occasion collection "${data.occasion.name}" published.`);
        fetchOccasions();
      } else {
        showToast(data.error || "Failed to create occasion", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOccasion) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/occasions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingOccasion),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Occasion "${editingOccasion.name}" updated successfully.`);
        setEditingOccasion(null);
        fetchOccasions();
      } else {
        showToast(data.error || "Failed to update occasion", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, occName: string) => {
    if (!confirm(`Are you sure you want to remove the occasion "${occName}"?`)) return;

    try {
      const res = await fetch(`/api/admin/occasions?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Occasion "${occName}" deleted.`);
        fetchOccasions();
      } else {
        showToast(data.error || "Failed to delete occasion", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    }
  };

  const toggleActiveStatus = async (occ: OccasionRecord) => {
    try {
      const res = await fetch("/api/admin/occasions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: occ.id, active: !occ.active }),
      });
      if (res.ok) {
        setOccasions((prev) =>
          prev.map((o) => (o.id === occ.id ? { ...o, active: !o.active } : o))
        );
      }
    } catch (err) {
      console.warn("Toggle occasion active error:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE2]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-serif font-semibold text-[#E10600] uppercase tracking-[0.2em] mb-1">
            <RibbonEmblem className="w-3.5 h-3.5" />
            <span>Storefront Merchandising</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal">
            Gifting Occasions & Milestones
          </h1>
          <p className="text-xs text-[#666] mt-0.5">
            Configure featured moments (Anniversaries, Luxury Birthdays, Weddings) showcased on the homepage.
          </p>
        </div>

        <Link
          href="/#occasions"
          target="_blank"
          className="inline-flex items-center gap-1 text-xs font-serif font-semibold text-[#E10600] hover:underline"
        >
          <span>View Live Storefront Occasions</span>
          <Eye className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {feedback.type === "success" ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Add Occasion Form */}
        <div className="bg-white p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E10600]" />
            <h2 className="font-serif text-lg font-bold text-[#1E1E1E]">Add Gifting Occasion</h2>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                Occasion Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Valentine's & Romantic Devotion"
                className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                Badge Tag
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Most Cherished, Romance, Milestones"
                className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                Headline Copy
              </label>
              <textarea
                rows={2}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Express timeless devotion with classic red satin blooms that never wilt..."
                className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                Recommended Product Slug
              </label>
              <input
                type="text"
                value={recommendedSlug}
                onChange={(e) => setRecommendedSlug(e.target.value)}
                placeholder="red-rose-bouquet"
                className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] outline-none transition-all font-mono"
              />
            </div>

            <div className="pt-2 border-t border-[#EFEAE2]">
              <CloudinarySingleImageUploader
                value={bannerImage}
                onChange={setBannerImage}
                label="Occasion Banner Artwork"
                description="High-resolution editorial banner for this occasion collection. Stored in Cloudinary."
                aspectRatio="banner"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-full bg-[#E10600] hover:bg-[#c00500] text-white text-xs font-serif uppercase tracking-wider font-semibold transition-all shadow-md shadow-[#E10600]/25 cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Publish Occasion"}
            </button>
          </form>
        </div>

        {/* Right: Existing Occasions Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-[#EFEAE2] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-serif font-semibold text-[#1E1E1E]">
              <Heart className="w-4 h-4 text-[#E10600]" />
              <span>{occasions.length} Curated Gifting Occasions</span>
            </div>
            <span className="text-[11px] text-[#888] font-serif">
              Rendered on the storefront homepage
            </span>
          </div>

          <div className="space-y-3.5">
            {loading ? (
              <div className="p-12 text-center text-xs text-[#888] flex items-center justify-center gap-2 bg-white rounded-3xl border border-[#EFEAE2]">
                <Loader2 className="w-4 h-4 animate-spin text-[#E10600]" />
                <span>Loading occasions...</span>
              </div>
            ) : occasions.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#888] bg-white rounded-3xl border border-[#EFEAE2]">
                No occasions configured.
              </div>
            ) : (
              occasions.map((occ) => (
                <div
                  key={occ.id}
                  className="p-5 bg-white rounded-3xl border border-[#EFEAE2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#E10600]/40 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {occ.bannerImage && (
                      <div className="w-16 h-16 rounded-2xl border border-[#EFEAE2] overflow-hidden relative shrink-0">
                        <Image src={occ.bannerImage} alt={occ.name} fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-serif font-bold text-[#1E1E1E]">
                          {occ.name}
                        </strong>
                        {occ.badge && (
                          <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-[#E10600] font-serif font-semibold">
                            {occ.badge}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleActiveStatus(occ)}
                          className={`text-[9.5px] px-2 py-0.5 rounded-full font-serif font-semibold transition-colors cursor-pointer ${
                            occ.active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                          }`}
                        >
                          {occ.active ? "Published" : "Draft"}
                        </button>
                      </div>

                      <p className="text-xs text-[#666] mt-1 leading-relaxed">
                        {occ.headline}
                      </p>

                      <div className="flex items-center gap-2 mt-2 text-[11px] text-[#888]">
                        <span className="font-mono">Featured: /product/{occ.recommendedSlug}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Link
                      href={`/product/${occ.recommendedSlug}`}
                      target="_blank"
                      className="p-2 text-[#888] hover:text-[#1E1E1E] hover:bg-[#FAF8F5] rounded-xl transition-colors"
                      title="View linked product"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setEditingOccasion(occ)}
                      className="p-2 text-[#888] hover:text-[#E10600] hover:bg-[#FAF8F5] rounded-xl transition-colors cursor-pointer"
                      title="Edit occasion"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(occ.id, occ.name)}
                      className="p-2 text-[#888] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete occasion"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Occasion Modal */}
      {editingOccasion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EFEAE2] space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEAE2]">
              <h3 className="font-serif text-lg font-bold text-[#1E1E1E]">
                Edit: {editingOccasion.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingOccasion(null)}
                className="p-1 rounded-full text-[#888] hover:text-[#1E1E1E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                  Occasion Name
                </label>
                <input
                  type="text"
                  required
                  value={editingOccasion.name}
                  onChange={(e) =>
                    setEditingOccasion({ ...editingOccasion, name: e.target.value })
                  }
                  className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                  Badge Tag
                </label>
                <input
                  type="text"
                  value={editingOccasion.badge || ""}
                  onChange={(e) =>
                    setEditingOccasion({ ...editingOccasion, badge: e.target.value })
                  }
                  className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                  Headline Text
                </label>
                <textarea
                  rows={2}
                  value={editingOccasion.headline}
                  onChange={(e) =>
                    setEditingOccasion({ ...editingOccasion, headline: e.target.value })
                  }
                  className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                  Linked Product Slug
                </label>
                <input
                  type="text"
                  value={editingOccasion.recommendedSlug}
                  onChange={(e) =>
                    setEditingOccasion({ ...editingOccasion, recommendedSlug: e.target.value })
                  }
                  className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] outline-none font-mono"
                />
              </div>

              <div className="pt-2 border-t border-[#EFEAE2]">
                <CloudinarySingleImageUploader
                  value={editingOccasion.bannerImage || ""}
                  onChange={(url) =>
                    setEditingOccasion({ ...editingOccasion, bannerImage: url })
                  }
                  label="Occasion Banner Artwork"
                  description="High-resolution editorial banner for this occasion collection. Stored in Cloudinary."
                  aspectRatio="banner"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingOccasion.active}
                    onChange={(e) =>
                      setEditingOccasion({ ...editingOccasion, active: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#E10600] rounded"
                  />
                  <span className="text-xs font-serif font-medium text-[#1E1E1E]">Active / Visible on Storefront</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#EFEAE2] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOccasion(null)}
                  className="px-4 py-2 text-xs font-serif text-[#666] hover:text-[#1E1E1E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-full bg-[#E10600] hover:bg-[#c00500] text-white text-xs font-serif font-semibold uppercase tracking-wider shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
