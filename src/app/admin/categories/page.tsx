"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Package,
  Eye,
  Loader2,
  AlertCircle,
  Tag,
  ArrowRight,
} from "lucide-react";
import { CategoryRecord } from "@/lib/server/db";
import CloudinarySingleImageUploader from "@/components/admin/CloudinarySingleImageUploader";
import Image from "next/image";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Array<CategoryRecord & { productCount?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Add Category State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [icon, setIcon] = useState("🌹");
  const [featured, setFeatured] = useState(true);

  // Edit Category Modal State
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: "Failed to load categories: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description: description.trim(),
          image: image.trim() || undefined,
          icon,
          featured,
          active: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setName("");
        setSlug("");
        setDescription("");
        setImage("");
        showToast(`Category "${data.category.name}" added to catalog architecture.`);
        fetchCategories();
      } else {
        showToast(data.error || "Failed to create category", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCategory),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Category "${editingCategory.name}" updated successfully.`);
        setEditingCategory(null);
        fetchCategories();
      } else {
        showToast(data.error || "Failed to update category", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to remove "${catName}"? Existing products will remain preserved.`)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Category "${catName}" deleted.`);
        fetchCategories();
      } else {
        showToast(data.error || "Failed to delete category", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Network error", "error");
    }
  };

  const toggleActiveStatus = async (cat: CategoryRecord) => {
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id, active: !cat.active }),
      });
      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, active: !c.active } : c))
        );
      }
    } catch (err) {
      console.warn("Toggle category active error:", err);
    }
  };

  const icons = ["🌹", "🎁", "🧺", "✨", "💍", "🌸", "🎀", "🌻", "💐", "🍫"];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE2]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-serif font-semibold text-[#E10600] uppercase tracking-[0.2em] mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Merchandising Architecture</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal">
            Gift & Bouquet Categories
          </h1>
          <p className="text-xs text-[#666] mt-0.5">
            Organize catalog filters, navigation taxonomy, and homepage collection showcases.
          </p>
        </div>

        <Link
          href="/catalog"
          target="_blank"
          className="inline-flex items-center gap-1 text-xs font-serif font-semibold text-[#E10600] hover:underline"
        >
          <span>View Live Catalog Navigation</span>
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
        {/* Left: Add Category Form */}
        <div className="bg-white p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E10600]" />
            <h2 className="font-serif text-lg font-bold text-[#1E1E1E]">Add New Category</h2>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, "-")) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                  }
                }}
                placeholder="e.g. Preserved Forever Roses"
                className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. preserved-forever-roses"
                className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] outline-none transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                Category Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {icons.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`w-9 h-9 rounded-xl text-sm flex items-center justify-center transition-all cursor-pointer ${
                      icon === emoji
                        ? "bg-[#E10600]/15 border-2 border-[#E10600] scale-105"
                        : "bg-[#FAF8F5] border border-[#EFEAE2] hover:bg-[#F2ECE4]"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#EFEAE2]">
              <CloudinarySingleImageUploader
                value={image}
                onChange={setImage}
                label="Category Featured Photo"
                description="Hero banner photo for this category collection. Stored in Cloudinary."
                aspectRatio="square"
              />
            </div>

            <div>
              <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                Brief Editorial Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Everlasting French ribbon creations crafted for keepsake gifting..."
                className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] outline-none transition-all"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#E10600] rounded cursor-pointer"
              />
              <span className="text-xs font-serif font-medium text-[#1E1E1E]">
                Feature in Homepage Categories Grid
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-full bg-[#E10600] hover:bg-[#c00500] text-white text-xs font-serif uppercase tracking-wider font-semibold transition-all shadow-md shadow-[#E10600]/25 cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Saving Category..." : "Create Category"}
            </button>
          </form>
        </div>

        {/* Right: Existing Categories List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-[#EFEAE2] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-serif font-semibold text-[#1E1E1E]">
              <Package className="w-4 h-4 text-[#E10600]" />
              <span>{categories.length} Catalog Categories</span>
            </div>
            <span className="text-[11px] text-[#888] font-serif">
              Real-time synchronization with catalog filter
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-[#EFEAE2] shadow-xs divide-y divide-[#F2ECE4] overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs text-[#888] flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#E10600]" />
                <span>Loading categories...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#888]">No categories found.</div>
            ) : (
              categories.map((c) => (
                <div
                  key={c.id || c.slug}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF8F5]/60 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    {c.image ? (
                      <div className="w-12 h-12 rounded-2xl overflow-hidden relative border border-[#EFEAE2] shrink-0 bg-[#FAF8F5] shadow-xs">
                        <Image src={c.image} alt={c.name} fill className="object-cover" />
                        <span className="absolute bottom-0.5 right-0.5 text-xs bg-white/90 rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                          {c.icon || "🌹"}
                        </span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] flex items-center justify-center text-lg shrink-0">
                        {c.icon || "🌹"}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-serif font-bold text-[#1E1E1E]">
                          {c.name}
                        </strong>
                        {c.featured && (
                          <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-serif font-semibold">
                            ★ Featured
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleActiveStatus(c)}
                          className={`text-[9.5px] px-2 py-0.5 rounded-full font-serif font-semibold transition-colors cursor-pointer ${
                            c.active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                          }`}
                        >
                          {c.active ? "Active" : "Hidden"}
                        </button>
                      </div>

                      <p className="text-xs text-[#666] mt-0.5 leading-relaxed">
                        {c.description || "Artisanal gift category"}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-[#888] font-mono">
                        <span className="text-[#E10600] font-serif font-bold">
                          {c.productCount ?? 0} Creations
                        </span>
                        <span>•</span>
                        <span>/catalog?category={c.slug}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Link
                      href={`/catalog?category=${encodeURIComponent(c.name)}`}
                      target="_blank"
                      className="p-2 text-[#888] hover:text-[#1E1E1E] hover:bg-[#FAF8F5] rounded-xl transition-colors"
                      title="View category on storefront"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setEditingCategory(c)}
                      className="p-2 text-[#888] hover:text-[#E10600] hover:bg-[#FAF8F5] rounded-xl transition-colors cursor-pointer"
                      title="Edit category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(c.id, c.name)}
                      className="p-2 text-[#888] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete category"
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

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#EFEAE2] space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEAE2]">
              <div className="flex items-center gap-2">
                <span className="text-xl">{editingCategory.icon || "🌹"}</span>
                <h3 className="font-serif text-lg font-bold text-[#1E1E1E]">
                  Edit: {editingCategory.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="p-1 rounded-full text-[#888] hover:text-[#1E1E1E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                  className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                  Icon Emoji
                </label>
                <div className="flex flex-wrap gap-2">
                  {icons.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setEditingCategory({ ...editingCategory, icon: emoji })}
                      className={`w-8 h-8 rounded-xl text-sm flex items-center justify-center transition-all cursor-pointer ${
                        editingCategory.icon === emoji
                          ? "bg-[#E10600]/15 border-2 border-[#E10600]"
                          : "bg-[#FAF8F5] border border-[#EFEAE2]"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ""}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, description: e.target.value })
                  }
                  className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] focus:border-[#E10600] focus:bg-white rounded-xl text-[#1E1E1E] outline-none"
                />
              </div>

              <div className="pt-2 border-t border-[#EFEAE2]">
                <CloudinarySingleImageUploader
                  value={editingCategory.image || ""}
                  onChange={(url) => setEditingCategory({ ...editingCategory, image: url })}
                  label="Category Featured Photo"
                  description="Hero banner photo for this category. Stored in Cloudinary."
                  aspectRatio="square"
                />
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCategory.active}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, active: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#E10600] rounded"
                  />
                  <span className="text-xs font-serif font-medium text-[#1E1E1E]">Active in Navigation</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCategory.featured || false}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, featured: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#E10600] rounded"
                  />
                  <span className="text-xs font-serif font-medium text-[#1E1E1E]">Featured Category Card</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#EFEAE2] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
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
