"use client";

import { use, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATALOG } from "@/lib/data/catalog";
import { ArrowLeft, Check, Trash2 } from "lucide-react";

function EditProductContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const product = CATALOG.find((p) => p.id === id) || CATALOG[0];

  const [name, setName] = useState(product?.name || "");
  const [category, setCategory] = useState(product?.category || "Flower Bouquet");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(String(product?.price || "1499"));
  const [imageUrl, setImageUrl] = useState(product?.images[0] || "");
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      router.push("/admin/products");
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-full bg-white border border-[var(--border-subtle)] hover:border-[#2A2A2A] text-[#2A2A2A] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">
              Product Editor
            </span>
            <h1 className="font-serif text-2xl font-bold text-[#2A2A2A]">
              Edit: {product.name}
            </h1>
          </div>
        </div>

        <Link
          href={`/product/${product.slug}`}
          target="_blank"
          className="text-xs font-semibold text-[var(--signal-red)] hover:underline"
        >
          View Live PDP ↗
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] shadow-xs space-y-6"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#2A2A2A] uppercase tracking-wider mb-1.5">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-3 bg-white border border-[#C0C0C0] rounded-xl text-[#2A2A2A] focus:outline-none focus:border-[#2A2A2A]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#2A2A2A] uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-3 bg-white border border-[#C0C0C0] rounded-xl text-[#2A2A2A] focus:outline-none focus:border-[#2A2A2A]"
              >
                <option value="Flower Bouquet">Flower Bouquet</option>
                <option value="Gift Box">Gift Box</option>
                <option value="Gift Hamper">Gift Hamper</option>
                <option value="Gift Wrap">Gift Wrap</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2A2A2A] uppercase tracking-wider mb-1.5">
                Display Price (INR) *
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full text-xs p-3 bg-white border border-[#C0C0C0] rounded-xl text-[#2A2A2A] focus:outline-none focus:border-[#2A2A2A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A2A2A] uppercase tracking-wider mb-1.5">
              Editorial Description *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 bg-white border border-[#C0C0C0] rounded-xl text-[#2A2A2A] focus:outline-none focus:border-[#2A2A2A] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2A2A2A] uppercase tracking-wider mb-1.5">
              Primary Image Path
            </label>
            <input
              type="text"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full text-xs p-3 bg-white border border-[#C0C0C0] rounded-xl text-[#2A2A2A] focus:outline-none focus:border-[#2A2A2A]"
            />
          </div>

          <div className="p-4 bg-[var(--canvas-warm)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <strong className="text-xs text-[#2A2A2A] block">Stock Availability</strong>
              <span className="text-[11px] text-[#666666]">
                Can customers request this item for Bangalore delivery?
              </span>
            </div>
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="w-5 h-5 rounded text-[var(--signal-red)] accent-[var(--signal-red)] cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end gap-3">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 rounded-full border border-[#C0C0C0] text-xs font-semibold text-[#666666] hover:text-[#2A2A2A]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-7 py-2.5 rounded-full bg-[var(--charcoal)] hover:bg-[var(--signal-red)] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved Changes!</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-[#888888] bg-white rounded-3xl border border-[var(--border-subtle)]">
          Loading product editor...
        </div>
      }
    >
      <EditProductContent params={params} />
    </Suspense>
  );
}
