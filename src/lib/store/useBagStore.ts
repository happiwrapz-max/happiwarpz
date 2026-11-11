"use client";

import { create } from "zustand";
import { BagItem, Product } from "./types";

interface BagState {
  items: BagItem[];
  isDrawerOpen: boolean;
  hasHydrated: boolean;
  addItem: (
    product: Product,
    quantity?: number,
    giftMessage?: string,
    options?: {
      selectedFlowerCount?: number;
      selectedColor?: string;
      customColorNote?: string;
      ribbonColor?: string;
      personalizationMessage?: string;
      specialInstructions?: string;
      tierPrice?: number;
    }
  ) => void;
  removeItem: (
    productId: string,
    options?: {
      selectedFlowerCount?: number;
      selectedColor?: string;
      ribbonColor?: string;
    }
  ) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    options?: {
      selectedFlowerCount?: number;
      selectedColor?: string;
      ribbonColor?: string;
    }
  ) => void;
  clearBag: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  hydrate: () => void;
}

const STORAGE_KEY = "hw-bag";

function saveToLocalStorage(items: BagItem[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to persist bag to localStorage:", e);
    }
  }
}

function loadFromLocalStorage(): BagItem[] {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to read bag from localStorage:", e);
    }
  }
  return [];
}

export const useBagStore = create<BagState>((set, get) => ({
  items: [],
  isDrawerOpen: false,
  hasHydrated: false,

  hydrate: () => {
    if (get().hasHydrated) return;
    const stored = loadFromLocalStorage();
    set({ items: stored, hasHydrated: true });
  },

  addItem: (product, quantity = 1, giftMessage, options) => {
    // Ensure hydrated first
    if (!get().hasHydrated && typeof window !== "undefined") {
      get().hydrate();
    }

    const { items } = get();
    const targetPrice = options?.tierPrice ?? product.price;
    const finalProduct = { ...product, price: targetPrice };

    // Match by product ID plus selected count, colors & customizations to allow separate cart lines
    const existingIndex = items.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.selectedFlowerCount === options?.selectedFlowerCount &&
        item.selectedColor === options?.selectedColor &&
        item.ribbonColor === options?.ribbonColor &&
        item.personalizationMessage === options?.personalizationMessage &&
        item.specialInstructions === options?.specialInstructions
    );

    let nextItems: BagItem[];
    if (existingIndex > -1) {
      nextItems = [...items];
      nextItems[existingIndex] = {
        ...nextItems[existingIndex],
        quantity: nextItems[existingIndex].quantity + quantity,
        product: finalProduct,
        tierPrice: targetPrice,
        customColorNote: options?.customColorNote || nextItems[existingIndex].customColorNote,
        ribbonColor: options?.ribbonColor || nextItems[existingIndex].ribbonColor,
        personalizationMessage: options?.personalizationMessage || nextItems[existingIndex].personalizationMessage,
        specialInstructions: options?.specialInstructions || nextItems[existingIndex].specialInstructions,
      };
    } else {
      const newItem: BagItem = {
        product: finalProduct,
        quantity,
        selectedOptions: {},
        giftMessage,
        selectedFlowerCount: options?.selectedFlowerCount,
        selectedColor: options?.selectedColor,
        customColorNote: options?.customColorNote,
        ribbonColor: options?.ribbonColor,
        personalizationMessage: options?.personalizationMessage,
        specialInstructions: options?.specialInstructions,
        tierPrice: targetPrice,
      };
      nextItems = [...items, newItem];
    }

    set({ items: nextItems });
    saveToLocalStorage(nextItems);
  },

  removeItem: (productId, options) => {
    set((state) => {
      const newItems = state.items.filter((item) => {
        if (item.product.id !== productId) return true;
        if (!options) return false;
        return (
          item.selectedFlowerCount !== options.selectedFlowerCount ||
          item.selectedColor !== options.selectedColor ||
          (options.ribbonColor && item.ribbonColor !== options.ribbonColor)
        );
      });
      saveToLocalStorage(newItems);
      return { items: newItems };
    });
  },

  updateQuantity: (productId, quantity, options) => {
    if (quantity < 1) {
      get().removeItem(productId, options);
      return;
    }
    set((state) => {
      const newItems = state.items.map((item) => {
        const matches =
          item.product.id === productId &&
          (!options ||
            (item.selectedFlowerCount === options.selectedFlowerCount &&
              item.selectedColor === options.selectedColor &&
              (!options.ribbonColor || item.ribbonColor === options.ribbonColor)));
        return matches ? { ...item, quantity } : item;
      });
      saveToLocalStorage(newItems);
      return { items: newItems };
    });
  },

  clearBag: () => {
    set({ items: [] });
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  },

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  totalPrice: () =>
    get().items.reduce(
      (sum, item) => sum + (item.tierPrice || item.product.price) * item.quantity,
      0
    ),
}));

// Cross-tab synchronization & auto-hydration on client
if (typeof window !== "undefined") {
  // Initial hydration on load
  setTimeout(() => {
    useBagStore.getState().hydrate();
  }, 0);

  // Sync when another tab/window updates localStorage
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      try {
        const updated = e.newValue ? JSON.parse(e.newValue) : [];
        if (Array.isArray(updated)) {
          useBagStore.setState({ items: updated, hasHydrated: true });
        }
      } catch (err) {
        console.warn("Storage sync error:", err);
      }
    }
  });
}
