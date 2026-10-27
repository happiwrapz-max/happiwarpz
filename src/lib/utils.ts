import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate an unguessable HW-XXXXXX order reference code
 */
export function generateOrderReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `HW-${code}`;
}

/**
 * Format price in Indian Rupees
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Order status configuration
 */
export const ORDER_STATUSES = {
  pending: {
    label: "Pending Confirmation",
    color: "var(--status-pending)",
    badgeClass: "badge-pending",
  },
  confirmed: {
    label: "Confirmed",
    color: "var(--status-confirmed)",
    badgeClass: "badge-confirmed",
  },
  preparing: {
    label: "Preparing",
    color: "var(--status-preparing)",
    badgeClass: "badge-preparing",
  },
  ready: {
    label: "Ready for Delivery",
    color: "var(--status-ready)",
    badgeClass: "badge-preparing",
  },
  delivered: {
    label: "Delivered",
    color: "var(--status-delivered)",
    badgeClass: "badge-delivered",
  },
  cancelled: {
    label: "Cancelled",
    color: "var(--status-cancelled)",
    badgeClass: "badge-cancelled",
  },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;

/**
 * Status transition map — enforces valid lifecycle transitions
 */
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};
