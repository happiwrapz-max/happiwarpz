"use client";

import { useState } from "react";
import { Plus, Trash2, Heart } from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";

interface Occasion {
  id: string;
  name: string;
  headline: string;
  recommendedSlug: string;
}

const INITIAL_OCCASIONS: Occasion[] = [
  {
    id: "anniversary",
    name: "Anniversary & Romance",
    headline: "Express timeless devotion with classic red blooms",
    recommendedSlug: "red-rose-bouquet",
  },
  {
    id: "birthday",
    name: "Luxury Birthdays",
    headline: "Make celebrations unforgettable with glitter luxury roses",
    recommendedSlug: "glitter-rose-luxury",
  },
  {
    id: "congratulations",
    name: "Congratulations & Milestones",
    headline: "Artisanal crimson hampers with keepsake candle and chocolates",
    recommendedSlug: "eternal-crimson-hamper",
  },
  {
    id: "just-because",
    name: "Just For You ♡",
    headline: "Surprise moments with same-day Bangalore hand delivery",
    recommendedSlug: "midnight-rose-box",
  },
];

export default function AdminOccasionsPage() {
  const [occasions, setOccasions] = useState<Occasion[]>(INITIAL_OCCASIONS);
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setOccasions([
      ...occasions,
      {
        id: `occ-${Date.now()}`,
        name: name.trim(),
        headline: headline.trim() || "Curated luxury floral arrangement",
        recommendedSlug: "red-rose-bouquet",
      },
    ]);
    setName("");
    setHeadline("");
  };

  const handleDelete = (id: string) => {
    setOccasions(occasions.filter((o) => o.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="text-xs font-semibold tracking-[0.2em] text-[#888888] uppercase">
          Curated Discovery
        </span>
        <h1 className="font-serif text-3xl text-[#2A2A2A] mt-1">
          Occasions & Themes
        </h1>
        <p className="text-xs text-[#666666] mt-1">
          Define celebration groupings to help customers find appropriate gifts for anniversaries, birthdays, and milestones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Create Form */}
        <div className="bg-white p-6 rounded-3xl border border-[var(--border-subtle)] shadow-xs space-y-4">
          <h2 className="font-serif text-base text-[#2A2A2A]">
            Add Celebration Occasion
          </h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                Occasion Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Valentine & Love"
                className="w-full text-xs p-2.5 bg-white border border-[#C0C0C0] rounded-xl text-[#2A2A2A] focus:outline-none focus:border-[#2A2A2A]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                Subtitle / Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Morning handpicked blooms"
                className="w-full text-xs p-2.5 bg-white border border-[#C0C0C0] rounded-xl text-[#2A2A2A] focus:outline-none focus:border-[#2A2A2A]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-[var(--charcoal)] hover:bg-[var(--signal-red)] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Save Occasion
            </button>
          </form>
        </div>

        {/* Existing Occasions List */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-[var(--border-subtle)] shadow-xs divide-y divide-[var(--border-subtle)]">
          {occasions.map((o) => (
            <div
              key={o.id}
              className="p-5 flex items-center justify-between hover:bg-zinc-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--canvas-warm)] flex items-center justify-center text-[var(--signal-red)]">
                  <RibbonEmblem className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-sm text-[#2A2A2A] block">{o.name}</strong>
                  <p className="text-xs text-[#666666] mt-0.5">{o.headline}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(o.id)}
                className="text-[#888888] hover:text-red-600 p-2 transition-colors cursor-pointer"
                aria-label="Delete occasion"
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
