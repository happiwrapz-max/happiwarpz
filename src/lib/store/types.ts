// ── Shared Domain Types for Happiwrapz E-Commerce Management System ─────────

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  inStock: boolean;
  featured: boolean;
  options: ProductOption[];
  stockQuantity?: number;
  lowStockThreshold?: number;
  isMadeToOrder?: boolean;
  flowerType?: string;
  ribbonColor?: string;
  wrappingStyle?: string;
  preparationHours?: number;
  tags?: string[];
  archived?: boolean;
}

export interface ProductOption {
  id: string;
  label: string;
  values: string[];
}

export interface BagItem {
  product: Product;
  quantity: number;
  selectedOptions: Record<string, string>;
  giftMessage?: string;
}

export interface OrderRequest {
  id: string;
  reference: string; // HW-XXXXXX
  status: import("@/lib/utils").OrderStatus;
  items: BagItem[];
  customer: CustomerInfo;
  deliveryDate?: string;
  deliverySlot?: string;
  notes?: string;
  internalNotes?: string;
  subtotal?: number;
  discountAmount?: number;
  couponCode?: string;
  deliveryFee?: number;
  totalAmount?: number;
  customOrderId?: string;
  paymentMethod?: string;
  paymentStatus?: "pending" | "confirmed_whatsapp" | "paid" | "refunded";
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusChange[];
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

export interface StatusChange {
  from: string;
  to: string;
  timestamp: string;
  by: string;
  note?: string;
}

export type AdminRole =
  | "owner"
  | "super_admin"
  | "manager"
  | "order_manager"
  | "product_manager"
  | "content_manager"
  | "analyst"
  | "fulfillment"
  | "customer";

export interface User {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatar?: string;
  createdAt?: string;
}

// ── Advanced Custom Orders & Quotations ──────────────────────────────────────

export type CustomOrderStatus =
  | "new"
  | "reviewing"
  | "quote_draft"
  | "quote_sent"
  | "accepted"
  | "in_production"
  | "ready"
  | "delivered"
  | "rejected"
  | "cancelled";

export interface CustomOrderRequest {
  id: string;
  reference: string; // CUST-XXXXXX
  customer: CustomerInfo;
  occasion: string;
  productType: string;
  flowerPreferences: string;
  stemCount: number;
  wrappingStyle: string;
  boxStyle?: string;
  personalizationText: string;
  giftMessage?: string;
  budget: number;
  desiredDeliveryDate: string;
  desiredDeliverySlot?: string;
  specialInstructions?: string;
  referenceImages?: string[];
  status: CustomOrderStatus;
  assignedAdmin?: string;
  quotation?: Quotation | null;
  convertedOrderId?: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusChange[];
}

export interface QuotationLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quotation {
  id: string;
  customOrderId: string;
  lineItems: QuotationLineItem[];
  customizationFee: number;
  packagingFee: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  estimatedPrepTimeHours: number;
  expiresAt: string;
  notes?: string;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  materialCostEstimate?: number;
  laborCostEstimate?: number;
  createdAt: string;
  updatedAt: string;
}

// ── Inventory Movements ──────────────────────────────────────────────────────

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  change: number; // +20 or -1
  previousStock: number;
  newStock: number;
  reason: "restock" | "order_fulfillment" | "damage_write_off" | "audit_correction";
  actorName: string;
  actorRole: string;
  referenceId?: string; // e.g. order ID or PO
  timestamp: string;
}

// ── Discounts & Coupons ─────────────────────────────────────────────────────

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number; // e.g. 15 for 15% or 300 for ₹300
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
  applicableCategory?: string; // 'all' or specific category
  createdAt: string;
}

// ── Admin Notifications ─────────────────────────────────────────────────────

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: "order" | "custom_order" | "quote_accepted" | "low_stock" | "contact" | "system";
  referenceId?: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

// ── Storefront Website Settings ─────────────────────────────────────────────

export interface WebsiteSettings {
  announcement: string;
  announcementActive: boolean;
  announcementLink?: string;
  heroHeading: string;
  heroSubheading: string;
  heroButtonText: string;
  heroButtonLink: string;
  promoBannerActive: boolean;
  promoBannerText: string;
  contactPhone: string;
  contactEmail: string;
  deliveryRadiusKm: number;
  minLeadTimeHours: number;
  storeOpen: boolean;
  pauseMessage?: string;
  publishedAt: string;
  updatedBy: string;
}

// ── Demo Accounts ───────────────────────────────────────────────────────────

export const DEMO_ACCOUNTS: User[] = [
  {
    id: "demo-owner",
    email: "owner@happiwrapz.com",
    name: "Happiwrapz Owner",
    role: "owner",
  },
  {
    id: "demo-manager",
    email: "manager@happiwrapz.com",
    name: "Store Manager",
    role: "manager",
  },
  {
    id: "demo-product-manager",
    email: "catalog@happiwrapz.com",
    name: "Catalog Lead",
    role: "product_manager",
  },
  {
    id: "demo-customer",
    email: "customer@happiwrapz.com",
    name: "Demo Customer",
    role: "customer",
  },
];
