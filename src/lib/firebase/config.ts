import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

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

// Firebase Core Services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Safe client-side analytics initialization
let analyticsInstance: Analytics | null = null;

export const getFirebaseAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window === "undefined") return null;
  if (analyticsInstance) return analyticsInstance;

  try {
    const supported = await isSupported();
    if (supported) {
      analyticsInstance = getAnalytics(app);
      return analyticsInstance;
    }
  } catch (err) {
    console.warn("Firebase Analytics initialization warning:", err);
  }
  return null;
};
