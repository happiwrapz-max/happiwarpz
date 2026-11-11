"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import { ShoppingBag, Sparkles, ChevronLeft } from "lucide-react";
import { useBagStore } from "@/lib/store/useBagStore";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { buildCloudinaryUrl } from "@/lib/cloudinary";

interface FlyingItem {
  id: string;
  image: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

export default function FloatingRightCart() {
  const pathname = usePathname();
  const items = useBagStore((s) => s.items);
  const openDrawer = useBagStore((s) => s.openDrawer);
  const totalItems = useBagStore((s) => s.totalItems);
  const totalPrice = useBagStore((s) => s.totalPrice);
  const hydrate = useBagStore((s) => s.hydrate);

  const [mounted, setMounted] = useState(false);
  const [badgeAnimated, setBadgeAnimated] = useState(false);
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [floatingPlusAlert, setFloatingPlusAlert] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const cartBtnRef = useRef<HTMLButtonElement>(null);
  const prevCountRef = useRef<number>(0);

  // Compute live cart count & price
  const itemCount = totalItems();
  const cartTotal = totalPrice();

  // Show on customer-facing storefront pages (Home, Collection, Shop, Product, Dashboard)
  // Hide on admin back-office pages
  const isAllowedPage = useMemo(() => {
    if (!pathname) return false;
    if (pathname.startsWith("/admin")) return false;
    if (pathname === "/") return true;
    if (pathname === "/catalog" || pathname === "/shop") return true;
    if (pathname.startsWith("/product/")) return true;
    if (pathname.startsWith("/dashboard")) return true;
    return true; // Default visible across storefront
  }, [pathname]);

  // Ensure hydration on mount
  useEffect(() => {
    setMounted(true);
    hydrate();

    const handleProductPicked = (e: Event) => {
      const customEvent = e as CustomEvent<{
        product?: { images?: string[]; name?: string; price?: number };
        sourceRect?: DOMRect;
      }>;

      // Pulse badge & alert
      setBadgeAnimated(true);
      setFloatingPlusAlert(true);
      setTimeout(() => setBadgeAnimated(false), 600);
      setTimeout(() => setFloatingPlusAlert(false), 1400);

      // Parabolic flight thumbnail from product button to floating cart
      if (customEvent.detail?.sourceRect && cartBtnRef.current) {
        const src = customEvent.detail.sourceRect;
        const target = cartBtnRef.current.getBoundingClientRect();
        const img =
          customEvent.detail.product?.images?.[0] ||
          "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881723/happiwrapz/assets/hero-desktop.jpg";

        const flyingId = `fly-${Date.now()}-${Math.random()}`;
        const newFlyer: FlyingItem = {
          id: flyingId,
          image: img,
          startX: src.left + src.width / 2,
          startY: src.top + src.height / 2,
          targetX: target.left + target.width / 2,
          targetY: target.top + target.height / 2,
        };

        setFlyingItems((prev) => [...prev, newFlyer]);

        setTimeout(() => {
          setFlyingItems((prev) => prev.filter((item) => item.id !== flyingId));
        }, 900);
      }
    };

    window.addEventListener("happiwrapz:product-picked", handleProductPicked);
    return () => {
      window.removeEventListener("happiwrapz:product-picked", handleProductPicked);
    };
  }, [hydrate]);

  // Trigger pulse animation when itemCount changes
  useEffect(() => {
    if (mounted && itemCount !== prevCountRef.current) {
      if (itemCount > prevCountRef.current) {
        setBadgeAnimated(true);
        const timer = setTimeout(() => setBadgeAnimated(false), 600);
        prevCountRef.current = itemCount;
        return () => clearTimeout(timer);
      }
      prevCountRef.current = itemCount;
    }
  }, [itemCount, mounted]);

  // Avoid hydration mismatch during initial SSR
  if (!mounted || !isAllowedPage) return null;

  return (
    <>
      {/* ── 1. Parabolic Flying Product Animation Layer ── */}
      {flyingItems.map((item) => (
        <div
          key={item.id}
          className="pointer-events-none fixed z-[9999]"
          style={
            {
              left: `${item.startX}px`,
              top: `${item.startY}px`,
              animation: "flyToCart 0.85s cubic-bezier(0.2, 0.8, 0.25, 1) forwards",
              "--target-x": `${item.targetX - item.startX}px`,
              "--target-y": `${item.targetY - item.startY}px`,
            } as React.CSSProperties
          }
        >
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 border-white shadow-2xl bg-white">
            <Image
              src={buildCloudinaryUrl(item.image, { preset: "thumbnail" })}
              alt="Adding to bag"
              fill
              className="object-contain p-1"
            />
          </div>
        </div>
      ))}

      {/* ── 2. Floating Cart Container ── */}
      {/* Positioned at bottom-right viewport edge with safe-area support, never blocking center content */}
      <aside
        aria-label="Floating shopping bag"
        className="fixed z-[9998] select-none pointer-events-auto
          bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-4
          sm:bottom-8 sm:right-8
          flex flex-col items-end"
      >
        {/* Floating "+1 Added!" Alert Notification */}
        {floatingPlusAlert && (
          <div className="pointer-events-none absolute -top-11 right-2 px-3.5 py-1.5 rounded-full bg-[#E10600] text-white text-[11px] font-serif font-bold tracking-wider uppercase shadow-xl shadow-[#E10600]/35 animate-fade-slide-up flex items-center gap-1.5 whitespace-nowrap z-50">
            <Sparkles className="w-3.5 h-3.5 text-[#FFE082]" />
            <span>Added to Bag!</span>
          </div>
        )}

        <div className="relative flex items-center">
          {/* ── Desktop Hover Tooltip (Sliding Out to the Left) ── */}
          <div
            className={`hidden sm:flex items-center gap-2.5 pr-4 pl-3.5 py-2.5 rounded-2xl bg-[#1E1E1E]/95 text-white shadow-2xl backdrop-blur-md border border-white/10 pointer-events-none absolute right-full mr-3 whitespace-nowrap transition-all duration-300 ${
              showTooltip
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-3 pointer-events-none"
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5 text-[#E10600] animate-pulse" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-serif font-bold uppercase tracking-wider text-white">
                View Your Cart
              </span>
              <span className="text-[11px] text-[#BBB] font-sans">
                {itemCount > 0
                  ? `${itemCount} ${itemCount === 1 ? "item" : "items"} • ${formatPrice(cartTotal)}`
                  : "Your cart is currently empty"}
              </span>
            </div>
          </div>

          {/* ── The Floating Cart Button (Luxury Boutique Redesign) ── */}
          <button
            ref={cartBtnRef}
            type="button"
            onClick={openDrawer}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            aria-label={`Open shopping cart with ${itemCount} items totaling ${formatPrice(cartTotal)}`}
            style={{
              WebkitTapHighlightColor: "transparent",
            }}
            className={`group relative flex items-center justify-center cursor-pointer transition-all duration-300 outline-none
              /* Circular floating jewel button */
              w-14 h-14 sm:w-16 sm:h-16 rounded-full
              bg-white/95 backdrop-blur-md
              border-2 border-[#EFEAE2] hover:border-[#E10600]
              shadow-[0_10px_30px_rgba(30,30,30,0.14)] hover:shadow-[0_16px_40px_rgba(225,6,0,0.28)]
              hover:ring-4 hover:ring-[#E10600]/12
              hover:-translate-y-1 active:scale-95
              text-[#1E1E1E] hover:text-[#E10600]
            `}
          >
            {/* Subtle inner ambient ring */}
            <span className="absolute inset-1 rounded-full border border-black/5 pointer-events-none" />

            {/* Shopping Bag Icon */}
            <div className="relative flex items-center justify-center">
              <ShoppingBag
                strokeWidth={1.8}
                className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300 ${
                  badgeAnimated
                    ? "scale-125 text-[#E10600]"
                    : "text-[#1E1E1E] group-hover:text-[#E10600] group-hover:scale-110"
                }`}
              />

              {/* ── Cart Item Quantity Badge ── */}
              {itemCount > 0 && (
                <span
                  key={itemCount}
                  className={`absolute -top-3 -right-3 sm:-top-3.5 sm:-right-3.5
                    min-w-[22px] h-[22px] px-1.5
                    rounded-full bg-[#E10600] text-white text-[11px] font-bold
                    flex items-center justify-center border-2 border-white shadow-md
                    transition-all duration-300 pointer-events-none ${
                      badgeAnimated ? "scale-130 ring-2 ring-[#FFE082]" : "scale-100"
                    }`}
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
