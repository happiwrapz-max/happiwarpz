"use client";

import { create } from "zustand";
import { OrderRequest, BagItem, CustomerInfo, StatusChange } from "./types";
import { generateOrderReference, OrderStatus } from "@/lib/utils";

interface OrderState {
  orders: OrderRequest[];
  createOrder: (items: BagItem[], customer: CustomerInfo, deliveryDate?: string, deliverySlot?: string, notes?: string) => OrderRequest;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, by: string, note?: string) => void;
  getOrderByReference: (reference: string) => OrderRequest | undefined;
  getOrderById: (id: string) => OrderRequest | undefined;
  getOrdersByCustomerEmail: (email: string) => OrderRequest[];
  getOrdersByStatus: (status: OrderStatus) => OrderRequest[];
}

// Seed orders for demo/admin testing
const SEED_ORDERS: OrderRequest[] = [
  {
    id: "order-001",
    reference: "HW-A3K7P9",
    status: "pending",
    items: [
      {
        product: {
          id: "red-rose-bouquet",
          slug: "red-rose-bouquet",
          name: "Red Rose Bouquet",
          category: "Flower Bouquet",
          description: "A timeless expression of love.",
          price: 1499,
          images: ["/images/products/rose-bouquet-1.jpg"],
          inStock: true,
          featured: true,
          options: [],
        },
        quantity: 2,
        selectedOptions: {},
        giftMessage: "Happy Anniversary! ♡",
      },
    ],
    customer: {
      name: "Priya Sharma",
      email: "priya@example.com",
      phone: "+91 98765 43210",
      address: "42 Lily Lane, Koramangala",
      city: "Bangalore",
      pincode: "560034",
    },
    deliveryDate: "2026-11-01",
    deliverySlot: "10:00 AM - 1:00 PM",
    notes: "Please ring the doorbell twice",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    statusHistory: [],
  },
  {
    id: "order-002",
    reference: "HW-B8M2T4",
    status: "confirmed",
    items: [
      {
        product: {
          id: "glitter-rose-luxury",
          slug: "glitter-rose-luxury",
          name: "Red Rose Bouquet — Glitter Luxury Edition",
          category: "Flower Bouquet",
          description: "Handcrafted glitter roses in matte black wrap.",
          price: 1899,
          images: ["/images/products/glitter-rose-1.jpg"],
          inStock: true,
          featured: true,
          options: [],
        },
        quantity: 1,
        selectedOptions: {},
      },
    ],
    customer: {
      name: "Rohit Mehta",
      email: "rohit@example.com",
      phone: "+91 87654 32109",
      address: "15 Rose Garden, Indiranagar",
      city: "Bangalore",
      pincode: "560038",
    },
    deliveryDate: "2026-10-30",
    deliverySlot: "2:00 PM - 5:00 PM",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    statusHistory: [
      {
        from: "pending",
        to: "confirmed",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        by: "Happiwrapz Owner",
      },
    ],
  },
  {
    id: "order-003",
    reference: "HW-C5N9Q1",
    status: "preparing",
    items: [
      {
        product: {
          id: "midnight-rose-box",
          slug: "midnight-rose-box",
          name: "Midnight Black Rose Box",
          category: "Gift Box",
          description: "Exquisite velvet-finish box with preserved black roses.",
          price: 2499,
          images: ["/images/products/midnight-box-1.jpg"],
          inStock: true,
          featured: true,
          options: [],
        },
        quantity: 1,
        selectedOptions: {},
        giftMessage: "Wishing you all the best!",
      },
    ],
    customer: {
      name: "Ananya Krishnan",
      email: "ananya@example.com",
      phone: "+91 76543 21098",
      address: "8 Jasmine Villa, HSR Layout",
      city: "Bangalore",
      pincode: "560102",
    },
    deliveryDate: "2026-10-29",
    deliverySlot: "10:00 AM - 1:00 PM",
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    statusHistory: [
      {
        from: "pending",
        to: "confirmed",
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        by: "Happiwrapz Owner",
      },
      {
        from: "confirmed",
        to: "preparing",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        by: "Store Manager",
      },
    ],
  },
];

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: SEED_ORDERS,

  createOrder: (items, customer, deliveryDate, deliverySlot, notes) => {
    const newOrder: OrderRequest = {
      id: `order-${Date.now()}`,
      reference: generateOrderReference(),
      status: "pending",
      items,
      customer,
      deliveryDate,
      deliverySlot,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [],
    };
    set((state) => ({ orders: [newOrder, ...state.orders] }));
    return newOrder;
  },

  updateOrderStatus: (orderId, newStatus, by, note) => {
    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== orderId) return order;
        const change: StatusChange = {
          from: order.status,
          to: newStatus,
          timestamp: new Date().toISOString(),
          by,
          note,
        };
        return {
          ...order,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          statusHistory: [...order.statusHistory, change],
        };
      }),
    }));
  },

  getOrderByReference: (reference) =>
    get().orders.find((o) => o.reference === reference),

  getOrderById: (id) => get().orders.find((o) => o.id === id),

  getOrdersByCustomerEmail: (email) =>
    get().orders.filter((o) => o.customer.email === email),

  getOrdersByStatus: (status) =>
    get().orders.filter((o) => o.status === status),
}));
