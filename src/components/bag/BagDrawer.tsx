"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBagStore } from "@/lib/store/useBagStore";
import { useOrderStore } from "@/lib/store/useOrderStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Gift,
  Check
} from "lucide-react";
import { buildCloudinaryUrl } from "@/lib/cloudinary";

export default function BagDrawer() {
  const router = useRouter();
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    totalPrice,
    clearBag,
  } = useBagStore();

  const createOrder = useOrderStore((s) => s.createOrder);
  const { user } = useAuthStore();

  // Multi-step flow inside drawer:
  // 1 = Bag Items & Add-ons, 2 = Date & Time, 3 = Delivery info, 4 = Order Confirmed
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Reset step to 1 when drawer opens
  useEffect(() => {
    if (isDrawerOpen && step === 4) {
      setStep(1);
    }
  }, [isDrawerOpen]);

  // Step 1: Add-ons state
  const [hasGreetingCard, setHasGreetingCard] = useState(false);
  const [greetingCardText, setGreetingCardText] = useState("");
  const [hasChocolate, setHasChocolate] = useState(false);
  const [hasWine, setHasWine] = useState(false);
  const [hasSmsConfirmation, setHasSmsConfirmation] = useState(true);
  const [smsNumber, setSmsNumber] = useState("+91 98765 43210");

  // Step 2: Date & Time state
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date("2026-10-27"));
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date("2026-10-01"));
  const [deliverySlot, setDeliverySlot] = useState("9:00 - 11:00");

  // Step 3: Recipient & Address state
  const [recipientName, setRecipientName] = useState(user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState("+91 ");
  const [city, setCity] = useState("Coimbatore");
  const [street, setStreet] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [postalCode, setPostalCode] = useState("560034");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Step 4: Confirmed Order Ref
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);

  if (!isDrawerOpen) return null;

  // Pricing calculations
  const itemsTotal = totalPrice();
  const addOnsTotal =
    (hasGreetingCard ? 99 : 0) +
    (hasChocolate ? 299 : 0) +
    (hasWine ? 499 : 0);
  const grandTotal = itemsTotal + addOnsTotal;

  // Calendar generation
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const formattedSelectedDate = selectedDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleDaySelect = (day: number) => {
    const newDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setFormError("Your bag is empty.");
      return;
    }
    if (!recipientName.trim() || !phoneNumber.trim() || !street.trim()) {
      setFormError("Please fill in recipient name, phone, and delivery street.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      const fullAddress = `${houseNumber ? `#${houseNumber}, ` : ""}${street.trim()}`;
      const extrasNotes = [
        hasGreetingCard ? `Handwritten Card: "${greetingCardText.trim() || "With Love"}"` : "",
        hasChocolate ? "Add-on: Belgian Chocolates" : "",
        hasWine ? "Add-on: Sparkling Cider/Wine" : "",
        hasSmsConfirmation ? `SMS: ${smsNumber}` : "",
        notes.trim() ? `Note: ${notes.trim()}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      const order = createOrder(
        items,
        {
          name: recipientName.trim(),
          email: user?.email || "concierge@happiwrapz.in",
          phone: phoneNumber.trim(),
          address: fullAddress,
          city: city.trim(),
          pincode: postalCode.trim(),
        },
        selectedDate.toISOString().split("T")[0],
        `${deliverySlot} Delivery`,
        extrasNotes || undefined
      );

      clearBag();
      setConfirmedRef(order.reference);
      setSubmitting(false);
      setStep(4);
    } catch {
      setFormError("Failed to dispatch request. Please check details.");
      setSubmitting(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Happiwrapz! I just submitted order request ${confirmedRef || "HW-A3K7P9"} for ${recipientName || "Valued Customer"}. Could you please confirm bloom availability for ${formattedSelectedDate} (${deliverySlot})?`
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[60] transition-opacity duration-300"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* In-Place Slide-Out Order Procedure Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white z-[70] shadow-2xl flex flex-col border-l border-[#EFEAE2] animate-slide-in-right">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EFEAE2] bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E10600]" />
            <h2 className="font-serif text-sm font-semibold uppercase tracking-wider text-[#1E1E1E]">
              {step === 1 && `Shopping Bag (${items.length})`}
              {step === 2 && "Step 2: Date & Time of Delivery"}
              {step === 3 && "Step 3: Delivery Information"}
              {step === 4 && "Order Request Confirmed"}
            </h2>
          </div>
          <button
            onClick={closeDrawer}
            className="p-1.5 text-[#666] hover:text-[#E10600] rounded-full hover:bg-white transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar (Floriam Image 1) */}
        {step < 4 && items.length > 0 && (
          <div className="px-6 py-2.5 bg-white border-b border-[#EFEAE2] flex items-center justify-between text-[11px] font-serif">
            <button
              onClick={() => setStep(1)}
              className={`transition-colors cursor-pointer ${
                step === 1 ? "text-[#E10600] font-bold" : "text-[#777]"
              }`}
            >
              1. Bag & Extras
            </button>
            <span className="text-[#CCC]">&gt;</span>
            <button
              onClick={() => setStep(2)}
              className={`transition-colors cursor-pointer ${
                step === 2 ? "text-[#E10600] font-bold" : step > 2 ? "text-[#1E1E1E]" : "text-[#999]"
              }`}
            >
              2. Date & Time
            </button>
            <span className="text-[#CCC]">&gt;</span>
            <button
              onClick={() => setStep(3)}
              className={`transition-colors cursor-pointer ${
                step === 3 ? "text-[#E10600] font-bold" : "text-[#999]"
              }`}
            >
              3. Recipient Info
            </button>
          </div>
        )}

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* ===================================================================
              STEP 1: BAG ITEMS & ADD-ONS
              =================================================================== */}
          {step === 1 && (
            <>
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-16 h-16 mb-4 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#E10600] border border-[#EFEAE2]">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <p className="font-serif text-lg text-[#1E1E1E] font-medium mb-1">
                    Your bag is empty
                  </p>
                  <p className="text-xs text-[#666] mb-6 max-w-xs leading-relaxed">
                    Explore our handcrafted ribbon rose & sunflower bouquets, signature glitter editions, and gift hampers.
                  </p>
                  <button
                    onClick={() => {
                      closeDrawer();
                      router.push("/catalog");
                    }}
                    className="inline-flex items-center gap-2 bg-[#E10600] hover:bg-[#C20500] text-white px-7 py-3 rounded-full text-xs font-serif uppercase tracking-wider font-semibold cursor-pointer transition-all"
                  >
                    <span>Browse Collection</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Items List */}
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex gap-3.5 p-3.5 rounded-2xl bg-white border border-[#EFEAE2] shadow-2xs"
                      >
                        <div className="relative w-18 h-18 rounded-xl overflow-hidden bg-[#FAF8F5] shrink-0 border border-[#EFEAE2] p-1">
                          <Image
                            src={buildCloudinaryUrl(item.product.images[0], { preset: "thumbnail" })}
                            alt={item.product.name}
                            fill
                            className="object-contain"
                            sizes="72px"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-serif font-semibold text-[#1E1E1E] truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-[10px] font-serif uppercase tracking-wider text-[#E10600] mt-0.5">
                            {item.product.category}
                          </p>
                          <p className="text-xs font-serif font-bold text-[#1E1E1E] mt-1">
                            {formatPrice(item.product.price)}
                          </p>

                          {/* Flower Count & Color Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {item.selectedFlowerCount && (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[10px] text-[#1E1E1E] font-medium border border-[#EFEAE2]">
                                💐 {item.selectedFlowerCount} Flowers
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[10px] text-[#555] border border-[#EFEAE2]">
                                {item.selectedColor}
                              </span>
                            )}
                          </div>

                          {item.customColorNote && (
                            <p className="text-[10px] text-[#555] bg-[#FAF8F5] p-1.5 rounded mt-1 border border-[#EFEAE2] line-clamp-2">
                              <span className="font-semibold text-[#1E1E1E]">Custom Note:</span> {item.customColorNote}
                            </p>
                          )}

                          {item.giftMessage && (
                            <p className="text-[10px] text-[#666] italic bg-[#FAF8F5] p-1.5 rounded mt-1 border border-[#EFEAE2] line-clamp-1">
                              &ldquo;{item.giftMessage}&rdquo;
                            </p>
                          )}

                          {/* Controls */}
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#EFEAE2]/60">
                            <div className="flex items-center border border-[#EFEAE2] rounded-full h-7 px-1.5 bg-[#FAF8F5]">
                              <button
                                onClick={() =>
                                  updateQuantity(item.product.id, item.quantity - 1, {
                                    selectedFlowerCount: item.selectedFlowerCount,
                                    selectedColor: item.selectedColor,
                                  })
                                }
                                className="w-5 h-5 flex items-center justify-center text-[#555] hover:text-[#E10600] cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-serif font-semibold text-[#1E1E1E]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.product.id, item.quantity + 1, {
                                    selectedFlowerCount: item.selectedFlowerCount,
                                    selectedColor: item.selectedColor,
                                  })
                                }
                                className="w-5 h-5 flex items-center justify-center text-[#555] hover:text-[#E10600] cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() =>
                                removeItem(item.product.id, {
                                  selectedFlowerCount: item.selectedFlowerCount,
                                  selectedColor: item.selectedColor,
                                })
                              }
                              className="text-[#999] hover:text-[#E10600] transition-colors p-1 cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add-ons Accessories (Floriam Image 1!) */}
                  <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EFEAE2] space-y-3">
                    <h4 className="font-serif text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider">
                      Add-on Enhancements
                    </h4>

                    {/* Greeting Card */}
                    <div className="space-y-1.5">
                      <label className="flex items-center justify-between text-xs cursor-pointer">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hasGreetingCard}
                            onChange={(e) => setHasGreetingCard(e.target.checked)}
                            className="w-3.5 h-3.5 accent-[#E10600] cursor-pointer"
                          />
                          <span className="text-[#1E1E1E]">Handwritten Greeting card</span>
                        </div>
                        <span className="font-serif font-semibold text-[#555]">+₹99</span>
                      </label>
                      {hasGreetingCard && (
                        <input
                          type="text"
                          placeholder="Card message (e.g. Happy Birthday!)..."
                          value={greetingCardText}
                          onChange={(e) => setGreetingCardText(e.target.value)}
                          className="w-full text-xs px-3 py-1.5 bg-white border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600]"
                        />
                      )}
                    </div>

                    {/* Chocolate */}
                    <label className="flex items-center justify-between text-xs cursor-pointer pt-2 border-t border-[#EFEAE2]/60">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={hasChocolate}
                          onChange={(e) => setHasChocolate(e.target.checked)}
                          className="w-3.5 h-3.5 accent-[#E10600] cursor-pointer"
                        />
                        <span className="text-[#1E1E1E]">Artisanal Belgian Chocolates</span>
                      </div>
                      <span className="font-serif font-semibold text-[#555]">+₹299</span>
                    </label>

                    {/* Wine / Cider */}
                    <label className="flex items-center justify-between text-xs cursor-pointer pt-2 border-t border-[#EFEAE2]/60">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={hasWine}
                          onChange={(e) => setHasWine(e.target.checked)}
                          className="w-3.5 h-3.5 accent-[#E10600] cursor-pointer"
                        />
                        <span className="text-[#1E1E1E]">Celebration Sparkling Wine/Cider</span>
                      </div>
                      <span className="font-serif font-semibold text-[#555]">+₹499</span>
                    </label>

                    {/* Free SMS */}
                    <label className="flex items-center justify-between text-xs cursor-pointer pt-2 border-t border-[#EFEAE2]/60">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={hasSmsConfirmation}
                          onChange={(e) => setHasSmsConfirmation(e.target.checked)}
                          className="w-3.5 h-3.5 accent-[#E10600] cursor-pointer"
                        />
                        <span className="text-[#1E1E1E]">SMS & WhatsApp Status Updates</span>
                      </div>
                      <span className="font-serif font-semibold text-[#059669]">FREE</span>
                    </label>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ===================================================================
              STEP 2: DATE & TIME OF DELIVERY (Floriam Image 1 Screen 2)
              =================================================================== */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Calendar Widget */}
              <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EFEAE2]">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EFEAE2]">
                  <button
                    onClick={() =>
                      setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))
                    }
                    className="p-1 text-[#666] hover:text-[#1E1E1E] cursor-pointer"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-serif text-xs font-semibold text-[#1E1E1E]">
                    {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </span>
                  <button
                    onClick={() =>
                      setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))
                    }
                    className="p-1 text-[#666] hover:text-[#1E1E1E] cursor-pointer"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-serif font-semibold text-[#777] mb-1">
                  <span>M</span>
                  <span>T</span>
                  <span>W</span>
                  <span>T</span>
                  <span>F</span>
                  <span>S</span>
                  <span>S</span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-sans">
                  {calendarDays.map((d, i) => {
                    if (d === null) return <div key={`empty-${i}`} className="h-8" />;
                    const isSelected =
                      selectedDate.getDate() === d &&
                      selectedDate.getMonth() === calendarMonth.getMonth();

                    return (
                      <button
                        key={d}
                        onClick={() => handleDaySelect(d)}
                        className={`h-8 w-full rounded-full flex items-center justify-center text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#E10600] text-white font-bold shadow-xs"
                            : "text-[#1E1E1E] hover:bg-white"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Slots */}
              <div className="space-y-2">
                <span className="text-[11px] font-serif uppercase tracking-wider text-[#666] block font-medium">
                  Delivery Time Window:
                </span>
                {[
                  { slot: "9:00 - 11:00", label: "Morning Priority (Handcrafted Dispatch)" },
                  { slot: "12:00 - 14:00", label: "Afternoon Delight" },
                  { slot: "15:00 - 18:00", label: "Evening Celebratory Surprise" },
                ].map((s) => (
                  <label
                    key={s.slot}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      deliverySlot === s.slot
                        ? "border-[#E10600] bg-[#E10600]/[0.03] text-[#1E1E1E]"
                        : "border-[#EFEAE2] hover:border-[#CCC] text-[#555]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="drawerSlot"
                      value={s.slot}
                      checked={deliverySlot === s.slot}
                      onChange={(e) => setDeliverySlot(e.target.value)}
                      className="w-3.5 h-3.5 accent-[#E10600] cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-[#1E1E1E] block">{s.slot}</span>
                      <span className="text-[10px] text-[#777]">{s.label}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Selected Schedule Card */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#EFEAE2] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#888] uppercase font-serif block">
                    Scheduled Day & Slot:
                  </span>
                  <span className="font-serif font-bold text-[#1E1E1E]">
                    {formattedSelectedDate}
                  </span>
                  <span className="text-[#E10600] block text-[11px]">
                    Slot: {deliverySlot}
                  </span>
                </div>
                <Calendar className="w-6 h-6 text-[#E10600]/60 shrink-0" />
              </div>
            </div>
          )}

          {/* ===================================================================
              STEP 3: RECIPIENT & DELIVERY DETAILS (Floriam Image 1 Screen 3)
              =================================================================== */}
          {step === 3 && (
            <form id="drawerOrderForm" onSubmit={handleSubmitOrder} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#444] mb-1">
                  *Recipient Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#444] mb-1">
                  *WhatsApp / Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#444] mb-1">
                    *City
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#444] mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#444] mb-1">
                    House #
                  </label>
                  <input
                    type="text"
                    placeholder="42-B"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-[#444] mb-1">
                    *Street / Locality
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="80ft Road, Koramangala 4th Block"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#444] mb-1">
                  Concierge notes (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Special instructions or landmark..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white resize-none"
                />
              </div>

              {/* Zero Online Charge Note */}
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EFEAE2] flex items-start gap-2.5 text-xs text-[#555]">
                <ShieldCheck className="w-4 h-4 text-[#E10600] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#1E1E1E]">Zero Online Charge</strong>: No credit card is needed. Handcrafted flowers confirmed directly by the store owner on WhatsApp.
                </span>
              </div>
            </form>
          )}

          {/* ===================================================================
              STEP 4: ORDER CONFIRMED IN-PLACE
              =================================================================== */}
          {step === 4 && (
            <div className="py-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] text-[#E10600] border border-[#E10600]/20 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] font-serif font-semibold tracking-[0.2em] text-[#E10600] uppercase block mb-1">
                  REQUEST DISPATCHED
                </span>
                <h3 className="font-serif text-2xl text-[#1E1E1E] font-normal">
                  Thank you, {recipientName}!
                </h3>
                <p className="text-xs text-[#666] mt-1 max-w-xs mx-auto leading-relaxed">
                  Your floral order request has been sent directly to the Happiwrapz owner.
                </p>
              </div>

              {/* Reference Box */}
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2] text-left text-xs space-y-2">
                <div className="flex justify-between pb-2 border-b border-[#EFEAE2]">
                  <span className="text-[#777] font-serif uppercase tracking-wider">
                    Reference Code
                  </span>
                  <span className="font-mono text-base font-bold text-[#E10600]">
                    {confirmedRef}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">Scheduled:</span>
                  <span className="font-medium text-[#1E1E1E]">{formattedSelectedDate} ({deliverySlot})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">Payment:</span>
                  <span className="text-[#059669] font-medium">Zero Online Charge</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <a
                  href={`https://wa.me/919876543210?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-3.5 rounded-full text-xs font-serif uppercase tracking-wider font-semibold shadow-xs transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Connect on WhatsApp Now</span>
                </a>

                <Link
                  href={`/order/lookup?ref=${confirmedRef}`}
                  onClick={closeDrawer}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-full text-xs font-serif uppercase tracking-wider text-[#1E1E1E] hover:bg-[#FAF8F5] border border-[#EFEAE2] transition-colors"
                >
                  <span>Track Request Status</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#E10600]" />
                </Link>

                <button
                  onClick={closeDrawer}
                  className="text-xs text-[#888] hover:text-[#1E1E1E] transition-colors cursor-pointer"
                >
                  Done, continue browsing
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Bottom Action Bar */}
        {step < 4 && items.length > 0 && (
          <div className="border-t border-[#EFEAE2] px-6 py-4 bg-[#FAF8F5] space-y-3">
            {/* Price Row */}
            <div className="flex items-center justify-between text-xs font-serif">
              <span className="text-[#666] uppercase tracking-wider font-medium">
                Total Request Value:
              </span>
              <span className="text-xl font-bold text-[#E10600]">
                {formatPrice(grandTotal)}
              </span>
            </div>

            {/* Stepper Buttons */}
            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 bg-[#E10600] hover:bg-[#C20500] text-white rounded-full text-xs font-serif uppercase tracking-[0.16em] font-semibold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(225,6,0,0.25)] transition-all cursor-pointer"
              >
                <span>Continue to Date & Time</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 2 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-white hover:bg-[#F0ECE4] text-[#1E1E1E] border border-[#EFEAE2] rounded-full text-xs font-serif uppercase tracking-wider font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-[2] py-3 bg-[#E10600] hover:bg-[#C20500] text-white rounded-full text-xs font-serif uppercase tracking-[0.16em] font-semibold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(225,6,0,0.25)] transition-all cursor-pointer"
                >
                  <span>Continue to Delivery Info</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-white hover:bg-[#F0ECE4] text-[#1E1E1E] border border-[#EFEAE2] rounded-full text-xs font-serif uppercase tracking-wider font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  form="drawerOrderForm"
                  disabled={submitting}
                  className="flex-[2] py-3 bg-[#E10600] hover:bg-[#C20500] text-white rounded-full text-xs font-serif uppercase tracking-[0.16em] font-semibold flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(225,6,0,0.28)] transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{submitting ? "Submitting..." : "CONFIRM ORDER REQUEST"}</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
