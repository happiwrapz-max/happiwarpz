"use client";

import { create } from "zustand";
import { BagItem, Product } from "./types";

interface BagState {
  items: BagItem[];
  isDrawerOpen: boolean;
  addItem: (product: Product, quantity?: number, giftMessage?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearBag: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useBagStore = create<BagState>((set, get) => ({
  items: [],
  isDrawerOpen: false,

  addItem: (product, quantity = 1, giftMessage) => {
    const { items } = get();
    const existing = items.find((item) => item.product.id === product.id);
    if (existing) {
      set({
        items: items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      });
    } else {
      set({
        items: [
          ...items,
          { product, quantity, selectedOptions: {}, giftMessage },
        ],
      });
    }
    // Persist to localStorage
    if (typeof window !== "undefined") {
      const updated = get().items;
      localStorage.setItem("hw-bag", JSON.stringify(updated));
    }
  },

  removeItem: (productId) => {
    set((state) => {
      const newItems = state.items.filter(
        (item) => item.product.id !== productId
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("hw-bag", JSON.stringify(newItems));
      }
      return { items: newItems };
    });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity < 1) {
      get().removeItem(productId);
      return;
    }
    set((state) => {
      const newItems = state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("hw-bag", JSON.stringify(newItems));
      }
      return { items: newItems };
    });
  },

  clearBag: () => {
    set({ items: [] });
    if (typeof window !== "undefined") {
      localStorage.removeItem("hw-bag");
    }
  },

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  totalPrice: () =>
    get().items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    ),
}));
