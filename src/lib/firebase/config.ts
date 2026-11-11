import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCJBKG1L4qA4OlLSt8QgOnKJ5Tzjdu5_Kc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "happiwrapz-73a66.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "happiwrapz-73a66",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "happiwrapz-73a66.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1071176796781",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1071176796781:web:9dd1285e9ad54f00e5cd64",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-8DGYC4BZ1J",
};

// Safe singleton initialization for Next.js SSR / HMR
export const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Safe client-side Auth singleton
let authInstance: Auth | null = null;

export const getFirebaseAuth = (): Auth => {
  if (!authInstance) {
    authInstance = getAuth(app);
  }
  return authInstance;
};

// Google Provider helper
let googleProviderInstance: GoogleAuthProvider | null = null;
export const getGoogleProvider = (): GoogleAuthProvider => {
  if (!googleProviderInstance) {
    googleProviderInstance = new GoogleAuthProvider();
    googleProviderInstance.setCustomParameters({ prompt: "select_account" });
  }
  return googleProviderInstance;
};

// Safe client-side analytics initialization
let analyticsInstance: Analytics | null = null;

export const getFirebaseAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window === "undefined") return null;
  // Skip analytics on admin routes, in local dev, or when offline/adblocked
  if (
    window.location.pathname.startsWith("/admin") ||
    process.env.NODE_ENV === "development" ||
    (typeof navigator !== "undefined" && !navigator.onLine)
  ) {
    return null;
  }
  if (analyticsInstance) return analyticsInstance;

  try {
    const supported = await isSupported().catch(() => false);
    if (supported) {
      analyticsInstance = getAnalytics(app);
      return analyticsInstance;
    }
  } catch {
    // Non-blocking: Gracefully ignore adblockers (Brave Shields, uBlock) or blocked googleapis
  }
  return null;
};
