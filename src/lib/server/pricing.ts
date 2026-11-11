import { CATALOG } from "@/lib/data/catalog";
import { BagItem, Coupon, Product } from "@/lib/store/types";
import { getCoupons, getProducts } from "./db";

export interface ValidatedOrderCalculation {
  validatedItems: BagItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  deliveryFee: number;
  totalAmount: number;
}

/**
 * Validates order items against the server catalog and recalculates subtotal, discounts, and totals
 */
export async function calculateOrderPricing(
  items: unknown[],
  rawCouponCode?: string
): Promise<{ success: true; data: ValidatedOrderCalculation } | { success: false; error: string }> {
  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, error: "At least one gift item is required" };
  }

  // Fetch all authoritative server products
  const serverProducts = await getProducts();
  const productMap = new Map<string, Product>();

  for (const p of CATALOG) {
    productMap.set(p.id, p);
  }
  for (const p of serverProducts) {
    productMap.set(p.id, p);
  }

  const validatedItems: BagItem[] = [];
  let subtotal = 0;

  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;
    const rawProduct = (raw.product && typeof raw.product === "object") ? (raw.product as Record<string, unknown>) : null;
    const productId = String(raw.productId || rawProduct?.id || raw.id || "");
    const quantity = Math.max(1, Math.min(100, Math.floor(Number(raw.quantity) || 1)));

    // Look up authoritative product from server catalog
    const authoritativeProduct = productMap.get(productId);
    if (!authoritativeProduct) {
      return { success: false, error: `Invalid product in bag: ${productId}` };
    }

    const selectedOptions = (raw.selectedOptions && typeof raw.selectedOptions === "object" && !Array.isArray(raw.selectedOptions)) ? (raw.selectedOptions as Record<string, string>) : {};

    // Validate if a flower count tier was selected with custom pricing
    let unitPrice = authoritativeProduct.price;
    if (authoritativeProduct.flowerTiers && Array.isArray(authoritativeProduct.flowerTiers)) {
      const tierId = selectedOptions.flowerTierId || selectedOptions["Flower Tier"] || selectedOptions.tierId;
      const countVal = Number(selectedOptions.flowerCount || selectedOptions["Flower Count"]);
      const matchingTier = authoritativeProduct.flowerTiers.find((t) =>
        (tierId && t.id === tierId) ||
        (countVal && t.count === countVal)
      );
      if (matchingTier && typeof matchingTier.price === "number" && matchingTier.price > 0) {
        unitPrice = matchingTier.price;
      }
    }

    const itemTotal = unitPrice * quantity;
    subtotal += itemTotal;

    validatedItems.push({
      product: authoritativeProduct,
      quantity,
      selectedOptions,
      giftMessage: typeof raw.giftMessage === "string" ? raw.giftMessage.slice(0, 300) : undefined,
    });
  }

  if (validatedItems.length === 0) {
    return { success: false, error: "No valid products in order request." };
  }

  let discountAmount = 0;
  let validatedCouponCode: string | undefined = undefined;

  // Server-side coupon verification
  if (rawCouponCode && typeof rawCouponCode === "string") {
    const code = rawCouponCode.trim().toUpperCase();
    const coupons = await getCoupons();
    const coupon = coupons.find((c: Coupon) => c.code.toUpperCase() === code && c.active);

    if (coupon) {
      const now = new Date().toISOString();
      const isValidDate =
        (!coupon.validFrom || coupon.validFrom <= now) &&
        (!coupon.validUntil || coupon.validUntil >= now);
      const isUsageAvailable = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;
      const isMinAmountMet = subtotal >= (coupon.minOrderAmount || 0);

      if (isValidDate && isUsageAvailable && isMinAmountMet) {
        validatedCouponCode = coupon.code;
        if (coupon.type === "percentage") {
          discountAmount = Math.round((subtotal * coupon.value) / 100);
          if (coupon.maxDiscountAmount) {
            discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
          }
        } else {
          // Flat discount
          discountAmount = Math.min(subtotal, coupon.value);
        }
      }
    }
  }

  const deliveryFee = subtotal >= 1500 ? 0 : 100;
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

  return {
    success: true,
    data: {
      validatedItems,
      subtotal,
      discountAmount,
      couponCode: validatedCouponCode,
      deliveryFee,
      totalAmount,
    },
  };
}
