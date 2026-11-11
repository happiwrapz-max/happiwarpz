"use client";

import { useState, useMemo } from "react";
import { formatPrice } from "@/lib/utils";
import { Product, FlowerCountTier } from "@/lib/store/types";
import { useBagStore } from "@/lib/store/useBagStore";
import {
  Star,
  ShieldCheck,
  Clock,
  Check,
  MessageSquare,
  Sparkles,
  ChevronDown,
  AlertCircle,
  Palette,
  Gift,
} from "lucide-react";

interface ProductInfoProps {
  product: Product;
}

interface ColorPreset {
  id: string;
  name: string;
  hex: string;
  border?: boolean;
  isGradient?: boolean;
}

const PRESET_FLOWER_COLORS: ColorPreset[] = [
  { id: "red", name: "Red", hex: "#B91C1C" },
  { id: "pink", name: "Pink", hex: "#F472B6" },
  { id: "white", name: "White", hex: "#FAF9F6", border: true },
  { id: "yellow", name: "Yellow", hex: "#EAB308" },
  { id: "purple", name: "Purple", hex: "#9333EA" },
  { id: "blue", name: "Blue", hex: "#2563EB" },
  { id: "orange", name: "Orange", hex: "#EA580C" },
  { id: "other", name: "Other", hex: "linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 50%, #FFE66D 100%)", isGradient: true },
];

const PRESET_RIBBON_COLORS = [
  "Gold Satin",
  "Crimson Red",
  "Champagne Ivory",
  "Emerald Green",
  "Midnight Black",
  "Rose Pink",
];

export default function ProductInfo({ product }: ProductInfoProps) {
  // Flower count & pricing tiers
  const tiers: FlowerCountTier[] = useMemo(() => {
    if (product.flowerTiers && product.flowerTiers.length > 0) {
      return product.flowerTiers;
    }
    const base = product.price || 1499;
    return [
      { id: "tier-1", count: 1, label: "Single Bloom", price: 299 },
      { id: "tier-3", count: 3, label: "Petite (3 Stems)", price: Math.round((base * 0.45) / 10) * 10 || 599 },
      { id: "tier-5", count: 5, label: "Classic (5 Stems)", price: Math.round((base * 0.65) / 10) * 10 || 899 },
      { id: "tier-7", count: 7, label: "Signature (7 Stems)", price: Math.round((base * 0.85) / 10) * 10 || 1199 },
      { id: "tier-10", count: 10, label: "Prestige (10 Stems)", price: base, isDefault: true },
      { id: "tier-12", count: 12, label: "Dozen (12 Stems)", price: Math.round((base * 1.2) / 10) * 10 || 1799 },
      { id: "tier-15", count: 15, label: "Luxury (15 Stems)", price: Math.round((base * 1.45) / 10) * 10 || 2199 },
      { id: "tier-20", count: 20, label: "Royal (20 Stems)", price: Math.round((base * 1.9) / 10) * 10 || 2899 },
    ];
  }, [product.flowerTiers, product.price]);

  // Find default tier or fallback to 10 stems
  const defaultTier = tiers.find((t) => t.isDefault) || tiers[Math.min(4, tiers.length - 1)] || tiers[0];
  const [selectedTierId, setSelectedTierId] = useState<string>(defaultTier.id);

  // Active tier & pricing
  const activeTier = tiers.find((t) => t.id === selectedTierId) || tiers[0];
  const unitPrice = activeTier.price;

  // Customization State
  const [selectedColorPreset, setSelectedColorPreset] = useState<string>("Red");
  const [customColorName, setCustomColorName] = useState<string>("");
  const [selectedRibbonColor, setSelectedRibbonColor] = useState<string>("Gold Satin");
  const [personalizationMessage, setPersonalizationMessage] = useState<string>("");
  const [specialInstructions, setSpecialInstructions] = useState<string>("");
  const [showAdvancedNotes, setShowAdvancedNotes] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Quantity & Bag
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const addItem = useBagStore((s) => s.addItem);
  const totalPrice = unitPrice * quantity;

  // Handle Add To Cart with validation
  const handleAddToBag = (e?: React.MouseEvent<HTMLButtonElement>) => {
    setValidationError(null);

    if (!selectedColorPreset) {
      setValidationError("Please select a flower colour for your bouquet.");
      return;
    }

    if (selectedColorPreset === "Other" && !customColorName.trim()) {
      setValidationError("Please enter your custom colour shade in the box below.");
      return;
    }

    const effectiveColor =
      selectedColorPreset === "Other"
        ? `Custom: ${customColorName.trim()}`
        : customColorName.trim()
        ? `${selectedColorPreset} (${customColorName.trim()})`
        : selectedColorPreset;

    const giftNotesSummary = [
      `${activeTier.count} Flowers Bouquet`,
      `Color: ${effectiveColor}`,
      `Ribbon: ${selectedRibbonColor}`,
      personalizationMessage.trim() ? `Card: "${personalizationMessage.trim()}"` : null,
      specialInstructions.trim() ? `Note: ${specialInstructions.trim()}` : null,
    ]
      .filter(Boolean)
      .join(" • ");

    addItem(
      {
        ...product,
        price: unitPrice,
      },
      quantity,
      giftNotesSummary || undefined,
      {
        selectedFlowerCount: activeTier.count,
        selectedColor: effectiveColor,
        customColorNote: customColorName.trim() || undefined,
        ribbonColor: selectedRibbonColor,
        personalizationMessage: personalizationMessage.trim() || undefined,
        specialInstructions: specialInstructions.trim() || undefined,
        tierPrice: unitPrice,
      }
    );

    // Parabolic cart animation trigger
    if (typeof window !== "undefined") {
      const rect = e?.currentTarget?.getBoundingClientRect();
      window.dispatchEvent(
        new CustomEvent("happiwrapz:product-picked", {
          detail: {
            product: { ...product, price: unitPrice },
            sourceRect: rect,
          },
        })
      );
    }

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1400);
  };

  const whatsappInquiryUrl = useMemo(() => {
    const effectiveColor =
      selectedColorPreset === "Other"
        ? `Custom: ${customColorName.trim() || "Bespoke"}`
        : customColorName.trim()
        ? `${selectedColorPreset} (${customColorName.trim()})`
        : selectedColorPreset;

    const msg = `Hello Happiwrapz! I would like to order "${product.name}":
• Bouquet Size: ${activeTier.count} Flowers (${formatPrice(totalPrice)})
• Flower Colour: ${effectiveColor}
• Ribbon: ${selectedRibbonColor}
${personalizationMessage.trim() ? `• Card Message: "${personalizationMessage.trim()}"\n` : ""}${specialInstructions.trim() ? `• Instructions: ${specialInstructions.trim()}\n` : ""}Please confirm availability & delivery in Coimbatore.`;
    return `https://wa.me/917708354636?text=${encodeURIComponent(msg)}`;
  }, [product.name, activeTier.count, totalPrice, selectedColorPreset, customColorName, selectedRibbonColor, personalizationMessage, specialInstructions]);

  return (
    <div className="flex flex-col max-w-xl w-full space-y-4">
      {/* ── Category & Live Review Jump Link ── */}
      <div className="flex items-center justify-between pb-2 border-b border-[#EFEAE2]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-serif uppercase tracking-[0.2em] text-[#E10600] font-semibold">
            {product.category || "Handcrafted Ribbon Flowers"}
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] text-emerald-700 font-medium">In Stock • Coimbatore Atelier</span>
        </div>

        <a
          href="#reviews"
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center text-[#E5A83B]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-[#E5A83B]" />
            ))}
          </div>
          <span className="text-xs font-semibold text-[#1E1E1E]">
            {product.rating ? Number(product.rating).toFixed(1) : "5.0"}
          </span>
          <span className="text-[11px] text-[#777] font-sans underline underline-offset-2">
            ({product.reviewsCount || 12} reviews)
          </span>
        </a>
      </div>

      {/* ── Product Title & Craftsmanship Note ── */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#1E1E1E] font-normal leading-tight">
          {product.name}
        </h1>
        <p className="text-xs text-[#555] leading-relaxed mt-1 font-sans line-clamp-2">
          {product.description}
        </p>
      </div>

      {/* ── Dynamic Price Display Card ── */}
      <div className="flex items-baseline justify-between p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2]">
        <div>
          <span className="text-[11px] uppercase font-serif tracking-wider text-[#777] block mb-0.5">
            Price for {activeTier.count} {activeTier.count === 1 ? "Flower" : "Flowers"}:
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-[#E10600]">
              {formatPrice(unitPrice)}
            </span>
            <span className="text-xs font-serif text-[#999] line-through">
              {formatPrice(unitPrice + Math.round(unitPrice * 0.25))}
            </span>
            <span className="px-2 py-0.2 rounded-full bg-[#E10600]/10 text-[#E10600] text-[10px] font-sans font-semibold">
              Save {formatPrice(Math.round(unitPrice * 0.25))}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] uppercase font-mono tracking-wider text-[#888] block">Payment Model</span>
          <span className="text-xs font-bold text-emerald-700">₹0 Upfront Required</span>
        </div>
      </div>

      {/* ── FLOWER COUNT SELECTOR (Clean 4-column compact pills) ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-serif uppercase tracking-wider font-semibold text-[#1E1E1E] flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#E10600]" />
            <span>Select Bouquet Size:</span>
          </label>
          <span className="text-xs text-[#E10600] font-semibold font-serif">
            {activeTier.count} Flowers • {formatPrice(activeTier.price)}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {tiers.map((tier) => {
            const isSelected = selectedTierId === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelectedTierId(tier.id)}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer relative ${
                  isSelected
                    ? "bg-[#FEE2E2] border-[#E10600] text-[#1E1E1E] ring-1 ring-[#E10600]/40 shadow-2xs"
                    : "bg-white border-[#EFEAE2] text-[#555] hover:border-[#D1C7BD] hover:bg-[#FAF8F5]"
                }`}
              >
                {tier.isDefault && (
                  <span className="absolute -top-1.5 right-1 px-1 py-0.1 rounded-full bg-[#E10600] text-white text-[8px] font-serif uppercase tracking-wider">
                    Popular
                  </span>
                )}
                <div className="font-serif font-bold text-xs text-[#1E1E1E]">
                  {tier.count} Stems
                </div>
                <div className="text-[11px] font-semibold text-[#E10600]">
                  {formatPrice(tier.price)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FLOWER COLOUR CUSTOMIZATION SWATCHES ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-serif uppercase tracking-wider font-semibold text-[#1E1E1E] flex items-center gap-1.5">
            <Palette className="w-3 h-3 text-[#E10600]" />
            <span>Flower Colour:</span>
          </label>
          <span className="text-xs text-[#E10600] font-semibold font-serif">
            {selectedColorPreset}
          </span>
        </div>

        {/* 8 Preset Swatches */}
        <div className="grid grid-cols-8 gap-1.5">
          {PRESET_FLOWER_COLORS.map((color) => {
            const isSelected = selectedColorPreset === color.name;
            return (
              <button
                key={color.id}
                type="button"
                onClick={() => {
                  setSelectedColorPreset(color.name);
                  setValidationError(null);
                }}
                className={`flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#FFF5F5] border-[#E10600] ring-1 ring-[#E10600]/40 shadow-2xs"
                    : "bg-white border-[#EFEAE2] hover:border-[#CCC]"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full mb-1 shadow-2xs ${
                    color.border ? "border border-[#DDD]" : ""
                  }`}
                  style={{
                    background: color.isGradient ? color.hex : undefined,
                    backgroundColor: !color.isGradient ? color.hex : undefined,
                  }}
                />
                <span className="text-[9px] font-sans font-medium text-[#1E1E1E] truncate max-w-full">
                  {color.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Custom colour text box */}
        <input
          type="text"
          value={customColorName}
          onChange={(e) => {
            setCustomColorName(e.target.value);
            setValidationError(null);
          }}
          placeholder={
            selectedColorPreset === "Other"
              ? "Type your required custom color or blend (e.g. 5 Red + 5 White)... *"
              : "Optional: Type custom shade or mix request (e.g. Pastel Peach)..."
          }
          className={`w-full text-xs p-2.5 bg-white border rounded-xl text-[#1E1E1E] outline-none transition-all ${
            selectedColorPreset === "Other" && !customColorName.trim()
              ? "border-[#E10600] bg-[#FFF9F9] focus:ring-1 focus:ring-[#E10600]"
              : "border-[#E5E0D8] focus:border-[#E10600]"
          }`}
        />
      </div>

      {/* ── RIBBON ACCENT & GIFT CARD CUSTOMIZATION ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Ribbon Selection */}
        <div className="space-y-1">
          <label className="text-[11px] font-serif uppercase tracking-wider font-semibold text-[#1E1E1E] flex items-center gap-1">
            <Gift className="w-3 h-3 text-[#E10600]" />
            <span>Ribbon Accent:</span>
          </label>
          <select
            value={selectedRibbonColor}
            onChange={(e) => setSelectedRibbonColor(e.target.value)}
            className="w-full text-xs p-2.5 bg-white border border-[#E5E0D8] rounded-xl text-[#1E1E1E] outline-none cursor-pointer focus:border-[#E10600]"
          >
            {PRESET_RIBBON_COLORS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Free Calligraphy Card Message */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-serif uppercase tracking-wider font-semibold text-[#1E1E1E]">
              Free Card Message:
            </label>
            <span className="text-[9px] text-[#888]">Optional</span>
          </div>
          <input
            type="text"
            value={personalizationMessage}
            onChange={(e) => setPersonalizationMessage(e.target.value)}
            placeholder="e.g. 'Happy Birthday Priya! Love, Rahul'"
            maxLength={120}
            className="w-full text-xs p-2.5 bg-white border border-[#E5E0D8] rounded-xl text-[#1E1E1E] placeholder:text-[#999] focus:outline-hidden focus:border-[#E10600]"
          />
        </div>
      </div>

      {/* Optional Atelier Instructions Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvancedNotes(!showAdvancedNotes)}
          className="text-[11px] text-[#777] hover:text-[#E10600] font-sans flex items-center gap-1 cursor-pointer"
        >
          <span>{showAdvancedNotes ? "− Hide special atelier instructions" : "+ Add special delivery or tailoring instructions"}</span>
        </button>

        {showAdvancedNotes && (
          <div className="mt-2">
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Special wrap preference, delivery time slot, or bespoke packaging requests in Coimbatore..."
              rows={2}
              maxLength={250}
              className="w-full text-xs p-2.5 bg-white border border-[#E5E0D8] rounded-xl text-[#1E1E1E] placeholder:text-[#999] focus:outline-hidden focus:border-[#E10600] resize-none"
            />
          </div>
        )}
      </div>

      {/* Validation Error Alert */}
      {validationError && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 animate-shake">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* ── QUANTITY STEPPER & PRIMARY ADD TO CART CTA ── */}
      <div className="flex items-center gap-2.5 pt-1">
        {/* Quantity Stepper */}
        <div className="inline-flex items-center border border-[#E5E0D8] rounded-full h-11 px-1.5 bg-[#FAF8F5] shadow-2xs shrink-0">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-[#1E1E1E] hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="w-7 text-center font-serif text-xs font-bold text-[#1E1E1E]">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-[#1E1E1E] hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Primary CTA Button */}
        <button
          type="button"
          onClick={handleAddToBag}
          className={`flex-1 h-11 rounded-xl text-xs font-serif uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm cursor-pointer ${
            added
              ? "bg-[#059669] text-white product-pick-pulse scale-[1.01]"
              : "bg-[#E10600] hover:bg-[#C20500] text-white hover:shadow-md active:scale-95"
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added to Bag</span>
            </>
          ) : (
            <>
              <span>Add to Cart</span>
              <span>•</span>
              <span>{formatPrice(totalPrice)}</span>
            </>
          )}
        </button>
      </div>

      {/* Trust & Dispatch Reassurance Banner */}
      <div className="p-3 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl flex items-center justify-between text-[11px] text-[#555]">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#E10600] shrink-0" />
          <span>Same-day Coimbatore express available.</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#059669] shrink-0" />
          <span className="text-[#059669] font-medium">Zero Online Upfront Pay</span>
        </div>
      </div>

      {/* WhatsApp Concierge direct link */}
      <div className="pt-0.5 text-center">
        <a
          href={whatsappInquiryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-[#25D366] hover:text-[#20bd5a] font-medium transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Need custom stems or instant delivery? Chat on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
