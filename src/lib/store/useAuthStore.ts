"use client";

import { create } from "zustand";
import { User } from "./types";
import { getFirebaseAuth } from "@/lib/firebase";
import { signOut as firebaseSignOut, onAuthStateChanged } from "firebase/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "signup" | "forgot";
  setUser: (user: User) => void;
  initAuth: () => void;
  openAuthModal: (mode?: "login" | "signup" | "forgot") => void;
  closeAuthModal: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAuthModalOpen: false,
  authModalMode: "login",

  openAuthModal: (mode = "login") => set({ isAuthModalOpen: true, authModalMode: mode }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  setUser: (user: User) => {
    set({ user, isAuthenticated: true, isLoading: false });
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("hw-user", JSON.stringify(user));
      } catch {
        // Safe fallback
      }
    }
  },

  initAuth: () => {
    if (typeof window === "undefined") return;

    // 1. Instant local hydration to prevent UI flicker
    try {
      const stored = localStorage.getItem("hw-user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          set({ user: parsed, isAuthenticated: true });
        }
      }
    } catch {
      // Ignore corrupted local storage
    }

    // 2. Authoritative server verification via signed HMAC session cookie
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.authenticated && data.user) {
          get().setUser(data.user);
        } else if (!data.authenticated) {
          // If server says not authenticated and no user in local storage, clear
          if (!localStorage.getItem("hw-user")) {
            set({ user: null, isAuthenticated: false, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        }
      })
      .catch(() => {
        set({ isLoading: false });
      });

    // 3. Attach Firebase Auth state listener
    try {
      const auth = getFirebaseAuth();
      onAuthStateChanged(auth, (fbUser) => {
        if (fbUser && !get().isAuthenticated) {
          const user: User = {
            id: fbUser.uid,
            email: fbUser.email || "",
            name: fbUser.displayName || fbUser.email?.split("@")[0] || "Valued Client",
            role: "customer",
            avatar: fbUser.photoURL || undefined,
          };
          get().setUser(user);
        }
      });
    } catch {
      // Non-blocking in non-browser environments
    }
  },

  logout: async () => {
    set({ user: null, isAuthenticated: false, isLoading: false });
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("hw-user");
      } catch {
        // Safe fallback
      }
    }

    // Server-side cookie cleanup
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Non-blocking
    }

    // Firebase Auth cleanup
    try {
      const auth = getFirebaseAuth();
      await firebaseSignOut(auth);
    } catch {
      // Non-blocking
    }
  },
}));
