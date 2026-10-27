"use client";

import { create } from "zustand";
import { User, DEMO_ACCOUNTS } from "./types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  loginAsDemo: (role: "owner" | "manager" | "customer") => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: (email: string, _password: string) => {
    // Demo: match by email, accept any password
    const demoUser = DEMO_ACCOUNTS.find((u) => u.email === email);
    if (demoUser) {
      set({ user: demoUser, isAuthenticated: true });
      if (typeof window !== "undefined") {
        localStorage.setItem("hw-user", JSON.stringify(demoUser));
      }
      return true;
    }
    // For now, create a customer account for any other email
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name: email.split("@")[0],
      role: "customer",
    };
    set({ user: newUser, isAuthenticated: true });
    if (typeof window !== "undefined") {
      localStorage.setItem("hw-user", JSON.stringify(newUser));
    }
    return true;
  },

  loginAsDemo: (role) => {
    const demoUser = DEMO_ACCOUNTS.find((u) => u.role === role);
    if (demoUser) {
      set({ user: demoUser, isAuthenticated: true });
      if (typeof window !== "undefined") {
        localStorage.setItem("hw-user", JSON.stringify(demoUser));
      }
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    if (typeof window !== "undefined") {
      localStorage.removeItem("hw-user");
    }
  },
}));
