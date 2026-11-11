"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { getFirebaseAuth, getGoogleProvider } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";

function AuthModalInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthModalOpen, authModalMode, openAuthModal, closeAuthModal, setUser } =
    useAuthStore();

  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync mode from store
  useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
    }
  }, [authModalMode]);

  // Read URL query parameter "?auth=login" or "?auth=signup"
  useEffect(() => {
    const authQuery = searchParams.get("auth");
    if (authQuery === "login" || authQuery === "signup" || authQuery === "forgot") {
      openAuthModal(authQuery);
    }
  }, [searchParams, openAuthModal]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        handleModalClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen]);

  const handleModalClose = () => {
    closeAuthModal();
    // Clean URL query params if present without reload
    if (typeof window !== "undefined" && window.location.search.includes("auth=")) {
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
    }
  };

  if (!isAuthModalOpen) return null;

  const syncServerSession = async (userEmail: string, userName?: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, name: userName }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Authentication verification failed.");
    }
    return data.user;
  };

  const parseAuthError = (err: any): string => {
    const code = err?.code || "";
    const msg = err?.message || "";

    if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
      return "Incorrect credentials. Please verify your email and password.";
    }
    if (code === "auth/user-not-found") {
      return "No account exists with this email address. Please switch to Create Account.";
    }
    if (code === "auth/email-already-in-use") {
      return "An account with this email address already exists. Please sign in.";
    }
    if (code === "auth/weak-password") {
      return "Password is too weak. Please use at least 6 characters.";
    }
    if (code === "auth/user-disabled") {
      return "This account has been disabled. Please contact Happiwrapz support (+91 7708354636).";
    }
    if (code === "auth/network-request-failed") {
      return "Network connection failed. Please check your internet connection.";
    }
    if (code === "auth/popup-closed-by-user") {
      return "Google sign-in was cancelled.";
    }
    return msg || "Authentication could not be completed. Please try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address (e.g. name@domain.com).");
      return;
    }

    if (mode === "forgot") {
      setLoading(true);
      try {
        const auth = getFirebaseAuth();
        try {
          await sendPasswordResetEmail(auth, cleanEmail);
        } catch {
          await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: cleanEmail }),
          });
        }
        setSuccessMessage("Password reset instructions have been dispatched to your email.");
      } catch (err: any) {
        setErrorMessage(parseAuthError(err));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters in length.");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      const auth = getFirebaseAuth();
      let userEmail = cleanEmail;
      let userName = name.trim();

      if (mode === "signup") {
        try {
          const userCred = await createUserWithEmailAndPassword(
            auth,
            cleanEmail,
            cleanPassword
          );
          userEmail = userCred.user.email || cleanEmail;
        } catch (firebaseErr: any) {
          if (firebaseErr.code === "auth/email-already-in-use") {
            throw firebaseErr;
          }
          // Server-side registration fallback
          const regRes = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: userName,
              email: cleanEmail,
              password: cleanPassword,
            }),
          });
          const regData = await regRes.json();
          if (!regRes.ok || !regData.success) {
            throw new Error(regData.error || "Registration could not be completed.");
          }
        }
      } else {
        try {
          const userCred = await signInWithEmailAndPassword(
            auth,
            cleanEmail,
            cleanPassword
          );
          userEmail = userCred.user.email || cleanEmail;
        } catch (firebaseErr: any) {
          if (
            firebaseErr.code === "auth/wrong-password" ||
            firebaseErr.code === "auth/user-not-found" ||
            firebaseErr.code === "auth/invalid-credential"
          ) {
            throw firebaseErr;
          }
        }
      }

      // Synchronize authoritative server session
      const authoritativeUser = await syncServerSession(userEmail, userName || undefined);
      setUser(authoritativeUser);
      setSuccessMessage(mode === "signup" ? "Account created successfully!" : "Signed in successfully!");

      setTimeout(() => {
        handleModalClose();
        if (authoritativeUser.role === "owner" || authoritativeUser.role === "admin") {
          router.push("/admin");
        }
      }, 700);
    } catch (err: any) {
      setErrorMessage(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const auth = getFirebaseAuth();
      const provider = getGoogleProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      if (!googleUser.email) {
        throw new Error("Google account did not provide an email address.");
      }

      const authoritativeUser = await syncServerSession(
        googleUser.email,
        googleUser.displayName || undefined
      );

      setUser(authoritativeUser);
      setSuccessMessage("Signed in with Google!");

      setTimeout(() => {
        handleModalClose();
        if (authoritativeUser.role === "owner" || authoritativeUser.role === "admin") {
          router.push("/admin");
        }
      }, 700);
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        setErrorMessage(parseAuthError(err));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      {/* ── Background Page Blur Overlay ── */}
      <div
        onClick={handleModalClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      />

      {/* ── Authentic Luxury Pop Up Login Card ── */}
      <div className="relative z-10 w-full max-w-[960px] bg-white rounded-[26px] sm:rounded-[32px] shadow-[0_20px_70px_rgba(0,0,0,0.3)] overflow-hidden border border-[#EFEAE2] flex flex-col md:flex-row my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Right Close Button */}
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-6 p-2 rounded-full bg-white/90 hover:bg-white text-[#666] hover:text-[#1E1E1E] shadow-xs hover:shadow-md transition-all cursor-pointer z-30"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── Left Column: Handcrafted Ribbon Rose Bouquet in Black Wrap ── */}
        <div className="relative hidden md:flex md:w-[48%] bg-[#FAF8F5] flex-col justify-center items-center overflow-hidden min-h-[560px] border-r border-[#F0ECE4]">
          <Image
            src="/images/auth/login-bouquet-panel.jpg"
            alt="Handcrafted crimson satin ribbon roses bouquet in black luxury wrap with red ribbon bow"
            fill
            className="object-cover object-center transform hover:scale-[1.02] transition-transform duration-700 ease-out"
            priority
          />
          {/* Subtle gradient feather to ensure seamless merge with white */}
          <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none" />
        </div>

        {/* Mobile Artwork Header (visible only on mobile) */}
        <div className="relative md:hidden w-full h-40 bg-[#FAF8F5] overflow-hidden">
          <Image
            src="/images/auth/login-bouquet-panel.jpg"
            alt="Handcrafted crimson ribbon roses"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </div>

        {/* ── Right Column: Authentic Luxury Login Form ── */}
        <div className="w-full md:w-[52%] px-6 py-8 sm:px-10 sm:py-10 flex flex-col justify-between bg-white relative">
          <div>
            {/* Top Calligraphy Script Logo: Happiwrapz with heart */}
            <div className="flex justify-center mb-1">
              <div className="relative w-48 sm:w-56 h-16 select-none">
                <Image
                  src="/images/auth/happiwrapz-calligraphy-logo.png"
                  alt="Happiwrapz"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Title: LOGIN in bold tracked uppercase */}
            <h2
              id="auth-modal-title"
              className="text-lg sm:text-xl font-bold uppercase tracking-[0.22em] text-[#1A1A1A] text-center mb-6"
            >
              {mode === "signup"
                ? "CREATE ACCOUNT"
                : mode === "forgot"
                ? "RESET PASSWORD"
                : "LOGIN"}
            </h2>

            {/* Error Message Pill */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Success Message Pill */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* Main Form Fields with Signature Golden Border */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-4 py-3 bg-white border border-[#C5A880] focus:border-[#B3131B] focus:ring-1 focus:ring-[#B3131B] rounded-xl text-xs sm:text-sm text-[#1A1A1A] placeholder:text-[#888] outline-hidden transition-all shadow-2xs"
                  />
                </div>
              )}

              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-white border border-[#C5A880] focus:border-[#B3131B] focus:ring-1 focus:ring-[#B3131B] rounded-xl text-xs sm:text-sm text-[#1A1A1A] placeholder:text-[#888] outline-hidden transition-all shadow-2xs"
                />
              </div>

              {mode !== "forgot" && (
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    minLength={6}
                    className="w-full pl-4 pr-11 py-3 bg-white border border-[#C5A880] focus:border-[#B3131B] focus:ring-1 focus:ring-[#B3131B] rounded-xl text-xs sm:text-sm text-[#1A1A1A] placeholder:text-[#888] outline-hidden transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* Remember Me & Forgot Password Utilities */}
              {mode === "login" && (
                <div className="flex items-center justify-between pt-0.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-[#666] select-none hover:text-[#1A1A1A]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#B3131B] rounded-xs cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[#B3131B] hover:underline font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Primary SIGN IN Crimson Pill Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full bg-[#B3131B] hover:bg-[#8F0E15] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-[0.22em] shadow-md shadow-[#B3131B]/30 hover:shadow-lg hover:shadow-[#B3131B]/40 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>VERIFYING...</span>
                  </>
                ) : (
                  <span>
                    {mode === "signup"
                      ? "CREATE ACCOUNT"
                      : mode === "forgot"
                      ? "SEND RESET INSTRUCTIONS"
                      : "SIGN IN"}
                  </span>
                )}
              </button>
            </form>

            {/* Google Authentication Alternative */}
            {mode !== "forgot" && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading || loading}
                  className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-full border border-[#C5A880]/60 hover:border-[#B3131B] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#1E1E1E] transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{googleLoading ? "Connecting..." : "Continue with Google"}</span>
                </button>
              </div>
            )}

            {/* Toggle Mode Footer */}
            <div className="text-center mt-4 text-xs text-[#666]">
              {mode === "login" ? (
                <p>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[#B3131B] font-semibold hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[#B3131B] font-semibold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* ── Signature Bottom Tagline: BECAUSE MOMENTS DESERVE FLOWERS. ── */}
          <div className="pt-4 border-t border-[#F0ECE4] mt-5">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.24em] text-[#1A1A1A] text-center uppercase block select-none">
              BECAUSE MOMENTS DESERVE FLOWERS.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthModal() {
  return (
    <Suspense fallback={null}>
      <AuthModalInner />
    </Suspense>
  );
}
