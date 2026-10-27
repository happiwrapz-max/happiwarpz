"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/data/catalog";
import { Plus, Edit2, Trash2, Layers } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(CATEGORIES);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const slug = newCategoryName.toLowerCase().replace(/\s+/g, "-");
    setCategories([...categories, { name: newCategoryName.trim(), slug }]);
    setNewCategoryName("");
  };

  const handleDelete = (slug: string) => {
    setCategories(categories.filter((c) => c.slug !== slug));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="text-xs font-semibold tracking-[0.2em] text-[#888888] uppercase">
          Catalog Architecture
        </span>
        <h1 className="font-serif text-3xl text-[#2A2A2A] mt-1">
          Gift Categories
        </h1>
        <p className="text-xs text-[#666666] mt-1">
          Organize storefront navigation and filters across bouquets, luxury boxes, and hampers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Create Category Form */}
        <div className="bg-white p-6 rounded-3xl border border-[var(--border-subtle)] shadow-xs space-y-4">
          <h2 className="font-serif text-base text-[#2A2A2A]">
            Add New Category
          </h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                Category Name
              </label>
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Preserved Forever Roses"
                className="w-full text-xs p-2.5 bg-white border border-[#C0C0C0] rounded-xl text-[#2A2A2A] focus:outline-none focus:border-[#2A2A2A]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-[var(--charcoal)] hover:bg-[var(--signal-red)] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Add Category
            </button>
          </form>
        </div>

        {/* Existing Categories List */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-[var(--border-subtle)] shadow-xs divide-y divide-[var(--border-subtle)]">
          {categories.map((c) => (
            <div
              key={c.slug}
              className="p-5 flex items-center justify-between hover:bg-zinc-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--canvas-warm)] flex items-center justify-center text-[var(--signal-red)]">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-sm text-[#2A2A2A] block">{c.name}</strong>
                  <span className="text-[10px] text-[#888888] font-mono">
                    /catalog?category={c.slug}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(c.slug)}
                className="text-[#888888] hover:text-red-600 p-2 transition-colors cursor-pointer"
                aria-label="Delete category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
