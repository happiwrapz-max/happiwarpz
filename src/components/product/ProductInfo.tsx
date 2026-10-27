"use client";

import { useState, useMemo } from "react";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/lib/store/types";
import { useBagStore } from "@/lib/store/useBagStore";
import {
  Star,
  ShieldCheck,
  Clock,
  Check,
  Truck,
  MessageSquare,
  ChevronDown,
  Info,
  Gift
} from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";

interface ProductInfoProps {
  product: Product;
}

const STEM_SIZES = [
  { id: "small", label: "Small (6 Roses)", subtitle: "Charming", priceDelta: -400 },
  { id: "medium", label: "Medium (12 Roses)", subtitle: "Signature", priceDelta: 0, isDefault: true },
  { id: "large", label: "Large (24 Roses)", subtitle: "Grand", priceDelta: 1000 },
  { id: "atelier", label: "Atelier (50 Roses)", subtitle: "Ultra Luxury", priceDelta: 2600 },
];

const OCCASION_TEMPLATES = [
  { label: "Anniversary", text: "Happy Anniversary to the love of my life! Forever & always." },
  { label: "Birthday", text: "Wishing you the happiest birthday filled with joy and blooms!" },
  { label: "With Love", text: "Just a reminder of how deeply cherished and adored you are." },
  { label: "Congratulations", text: "Heartiest congratulations on your remarkable milestone!" },
];

export default function ProductInfo({ product }: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState("medium");
  const [quantity, setQuantity] = useState(1);
  const [giftMessage, setGiftMessage] = useState("");
  const [ribbonText, setRibbonText] = useState("");
  const [showRibbonInput, setShowRibbonInput] = useState(false);
  const [added, setAdded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("care");

  const addItem = useBagStore((s) => s.addItem);
  const openDrawer = useBagStore((s) => s.openDrawer);

  const activeSize = STEM_SIZES.find((s) => s.id === selectedSize) || STEM_SIZES[1];
  const unitPrice = Math.max(499, product.price + activeSize.priceDelta);
  const totalPrice = unitPrice * quantity;

  const handleAddToBag = () => {
    const fullGiftNotes = [
      `Size: ${activeSize.label}`,
      ribbonText.trim() ? `Ribbon Calligraphy: "${ribbonText.trim()}"` : null,
      giftMessage.trim() ? `Card: "${giftMessage.trim()}"` : null,
    ]
      .filter(Boolean)
      .join(" • ");

    addItem(
      {
        ...product,
        price: unitPrice,
      },
      quantity,
      fullGiftNotes || undefined
    );

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1200);
  };

  const whatsappInquiryUrl = useMemo(() => {
    const msg = `Hello Happiwrapz! I am viewing "${product.name}" (${activeSize.label}) at ₹${totalPrice}. I have a query regarding customization and same-day delivery availability.`;
    return `https://wa.me/919876543210?text=${encodeURIComponent(msg)}`;
  }, [product.name, activeSize.label, totalPrice]);

  return (
    <div className="flex flex-col justify-center max-w-xl w-full space-y-6">
      {/* Category & Verified Reviews Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#EFEAE2]">
        <span className="text-[11px] font-serif uppercase tracking-[0.2em] text-[#E10600] font-semibold">
          {product.category || "Handcrafted Ribbon Flowers"}
        </span>

        {/* 5 Star Rating matching sample */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center text-[#E5A83B]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-[#E5A83B]" />
            ))}
          </div>
          <span className="text-xs font-semibold text-[#1E1E1E]">4.9</span>
          <span className="text-xs text-[#777] font-sans">(124 reviews)</span>
        </div>
      </div>

      {/* Product Title */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal leading-tight">
          {product.name}
        </h1>
        <p className="text-xs sm:text-sm text-[#666] leading-relaxed mt-2 font-sans">
          {product.description}
        </p>
      </div>

      {/* Dynamic Price Display */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl sm:text-4xl font-serif font-bold text-[#E10600]">
          {formatPrice(unitPrice)}
        </span>
        <span className="text-base font-serif text-[#999] line-through">
          {formatPrice(unitPrice + 350)}
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-[#E10600]/10 text-[#E10600] text-xs font-sans font-medium">
          Save ₹350
        </span>
      </div>

      {/* ── SIZE / STEM COUNT SELECTOR (ELEVATED FROM SAMPLE) ── */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-serif uppercase tracking-wider font-semibold text-[#1E1E1E]">
            Size / Stem Count:
          </label>
          <span className="text-xs text-[#E10600] font-medium font-sans">
            {activeSize.label} selected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STEM_SIZES.map((size) => {
            const isSelected = selectedSize === size.id;
            return (
              <button
                key={size.id}
                type="button"
                onClick={() => setSelectedSize(size.id)}
                className={`py-2.5 px-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#FEE2E2] border-[#E10600] text-[#E10600] ring-1 ring-[#E10600]/30 font-semibold shadow-xs"
                    : "bg-white border-[#EFEAE2] text-[#555] hover:border-[#BBB] hover:bg-[#FAF8F5]"
                }`}
              >
                <div className="text-xs font-medium truncate">{size.label}</div>
                <div className="text-[10px] text-[#888] font-sans mt-0.5">
                  {size.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── COMPLIMENTARY WAX-SEALED GIFT MESSAGE (ELEVATED FROM SAMPLE) ── */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-serif uppercase tracking-wider font-semibold text-[#1E1E1E] flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-[#E10600]" />
            <span>Add Gift Message (Complimentary)</span>
          </label>
          <span className="text-[10px] text-[#059669] font-medium">
            Handwritten & Wax-Sealed
          </span>
        </div>

        {/* Quick Occasion Prompt Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {OCCASION_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.label}
              type="button"
              onClick={() => setGiftMessage(tmpl.text)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] text-[#666] hover:text-[#E10600] hover:border-[#E10600]/40 hover:bg-[#FEE2E2]/50 transition-colors shrink-0 cursor-pointer"
            >
              + {tmpl.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <textarea
            value={giftMessage}
            onChange={(e) => setGiftMessage(e.target.value)}
            placeholder="Write your heartfelt message here... (Our atelier artist will pen this in gold calligraphy)"
            maxLength={250}
            rows={3}
            className="w-full text-xs p-3.5 bg-white border border-[#E5E0D8] rounded-2xl text-[#1E1E1E] placeholder:text-[#999] focus:outline-hidden focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600] resize-none shadow-2xs"
          />
          <span className="absolute bottom-2.5 right-3 text-[10px] text-[#999] font-sans">
            {giftMessage.length}/250
          </span>
        </div>
      </div>

      {/* Satin Ribbon Custom Calligraphy Toggle */}
      <div className="pt-1">
        {!showRibbonInput ? (
          <button
            type="button"
            onClick={() => setShowRibbonInput(true)}
            className="text-xs font-serif tracking-wide text-[#E10600] hover:text-[#C20500] underline underline-offset-4 flex items-center gap-1.5 cursor-pointer"
          >
            <RibbonEmblem className="w-3.5 h-3.5 text-[#E10600]" />
            <span>+ Add personalized gold foil inscription on satin ribbon</span>
          </button>
        ) : (
          <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-semibold text-[#1E1E1E]">
                Ribbon Gold Foil Calligraphy:
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowRibbonInput(false);
                  setRibbonText("");
                }}
                className="text-[10px] text-[#E10600] hover:underline cursor-pointer"
              >
                Remove
              </button>
            </div>
            <input
              type="text"
              value={ribbonText}
              onChange={(e) => setRibbonText(e.target.value)}
              placeholder="e.g., Happy 10th Anniversary My Love"
              maxLength={60}
              className="w-full text-xs px-3 py-2 bg-white border border-[#EFEAE2] rounded-xl focus:outline-hidden focus:border-[#E10600]"
            />
          </div>
        )}
      </div>

      {/* ── QUANTITY STEPPER & ADD TO CART CTA (ELEVATED FROM SAMPLE) ── */}
      <div className="flex items-center gap-3 pt-2">
        {/* Stepper matching sample [- 1 +] */}
        <div className="inline-flex items-center border border-[#E5E0D8] rounded-full h-12 px-2 bg-[#FAF8F5] shadow-2xs">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-[#1E1E1E] hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="w-8 text-center font-serif text-sm font-bold text-[#1E1E1E]">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-[#1E1E1E] hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        {/* Primary CTA Button in True Red #E10600 */}
        <button
          type="button"
          onClick={handleAddToBag}
          className={`flex-1 h-12 rounded-xl text-xs sm:text-sm font-serif uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm cursor-pointer ${
            added
              ? "bg-[#059669] text-white"
              : "bg-[#E10600] hover:bg-[#C20500] text-white hover:shadow-md"
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
      <div className="p-3.5 bg-[#FAF8F5] border border-[#EFEAE2] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#555]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#E10600] shrink-0" />
          <span>
            <strong className="text-[#1E1E1E] font-medium">Bangalore Express:</strong> Same-day 2-hr delivery available.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0" />
          <span className="text-[#059669] font-medium">Zero Online Upfront Pay</span>
        </div>
      </div>

      {/* Collapsible Accordions for Botanical Specs & Care */}
      <div className="pt-2 border-t border-[#EFEAE2] space-y-2">
        {/* Accordion 1: Ribbon Flower Care & Keepsake */}
        <div className="border border-[#EFEAE2] rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenAccordion(openAccordion === "care" ? null : "care")}
            className="w-full px-4 py-3 bg-[#FAF8F5] flex items-center justify-between text-xs font-serif font-semibold text-[#1E1E1E] cursor-pointer"
          >
            <span>Handcrafted Ribbon Flower & Keepsake Care Guide</span>
            <ChevronDown
              className={`w-4 h-4 text-[#888] transition-transform ${
                openAccordion === "care" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openAccordion === "care" && (
            <div className="p-4 bg-white text-xs text-[#666] space-y-2 leading-relaxed">
              <p>
                • <strong>Forever Longevity:</strong> 100% handcrafted everlasting satin ribbon flowers that never wilt, dry up, or fade.
              </p>
              <p>
                • <strong>Zero Water Required:</strong> Never water or refrigerate! Your ribbon blooms are completely maintenance-free.
              </p>
              <p>
                • <strong>Keepsake Care:</strong> Keep in a dry area away from direct moisture. If dusty, gently dust the satin petals with a soft dry brush.
              </p>
            </div>
          )}
        </div>

        {/* Accordion 2: Luxury Packaging */}
        <div className="border border-[#EFEAE2] rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenAccordion(openAccordion === "packaging" ? null : "packaging")}
            className="w-full px-4 py-3 bg-[#FAF8F5] flex items-center justify-between text-xs font-serif font-semibold text-[#1E1E1E] cursor-pointer"
          >
            <span>Keepsake Velvet Box & Ribbon Specs</span>
            <ChevronDown
              className={`w-4 h-4 text-[#888] transition-transform ${
                openAccordion === "packaging" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openAccordion === "packaging" && (
            <div className="p-4 bg-white text-xs text-[#666] space-y-2 leading-relaxed">
              <p>
                • <strong>Keepsake Box:</strong> Rigid circular velvet presentation cylinder with gold-embossed brand seal. Reusable for jewelry and watches.
              </p>
              <p>
                • <strong>Ribbon:</strong> 38mm double-faced Italian satin ribbon with hand-tied couture bow.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Direct WhatsApp Concierge CTA */}
      <div className="pt-1 text-center">
        <a
          href={whatsappInquiryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-[#25D366] hover:text-[#20bd5a] font-medium transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Have a custom stem count or hotel room surprise? Chat on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
