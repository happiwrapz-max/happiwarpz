"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Check,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";

interface BotanicalAuthCardProps {
  initialMode?: "login" | "signup";
}

export default function BotanicalAuthCard({
  initialMode = "login",
}: BotanicalAuthCardProps) {
  const router = useRouter();
  const { login } = useAuthStore();

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const email = identifier.trim() || `${name.trim().toLowerCase().replace(/\s+/g, '')}@example.com`;
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || email.split("@")[0],
          email,
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.user) {
        // Also update local Zustand store
        login(data.user.email, password.trim());

        if (data.user.role === "owner" || data.user.role === "manager") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        return;
      }

      // Fallback to local authentication
      const success = login(email, password.trim());
      if (success) {
        if (email.includes("owner") || email.includes("manager")) {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.error || "Invalid credentials. Please verify your email and password.");
      }
    } catch {
      // Local fallback
      const email = identifier.trim();
      const success = email ? login(email, password.trim()) : false;
      if (success) {
        router.push("/dashboard");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top Header Mode Indicator matching reference */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setError(null);
          }}
          className={`text-sm sm:text-base font-serif font-medium tracking-wide transition-colors cursor-pointer ${
            mode === "signup"
              ? "text-[#1E1E1E] font-semibold"
              : "text-[#7A8A7A] hover:text-[#1E1E1E]"
          }`}
        >
          Sign up
        </button>
        <span className="text-[#9BAA9B] font-light">/</span>
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
          }}
          className={`text-sm sm:text-base font-serif font-medium tracking-wide transition-colors cursor-pointer ${
            mode === "login"
              ? "text-[#1E1E1E] font-semibold"
              : "text-[#7A8A7A] hover:text-[#1E1E1E]"
          }`}
        >
          Log In
        </button>
      </div>

      {/* Main Floating Rounded Card */}
      <div className="relative w-full max-w-5xl rounded-[32px] sm:rounded-[40px] overflow-hidden bg-[#E2E8E2] border border-white/70 shadow-[0_25px_70px_-15px_rgba(20,35,25,0.22)] p-4 sm:p-7 lg:p-10 min-h-[580px] flex items-center">
        {/* Background Visual Layer */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/auth/botanical-auth-card.jpg"
            alt="Happiwrapz Botanical Atelier and Satin Ribbons"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="object-cover object-left lg:object-center"
          />
          {/* Subtle gradient wash for seamless contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/40 lg:to-transparent pointer-events-none" />
        </div>

        {/* Left Side: Brand Wordmark over Botanical Scene */}
        <div className="relative z-10 hidden lg:flex flex-col justify-between h-full max-w-sm pl-4 pr-6 select-none pointer-events-none">
          <Link
            href="/"
            className="pointer-events-auto inline-flex items-center gap-2 group transition-transform duration-300 hover:scale-105"
          >
            <span className="font-serif text-3xl xl:text-4xl font-normal tracking-[0.16em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
              Happiwrapz
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#E10600] shadow-[0_0_10px_rgba(225,6,0,0.8)] -mt-3" />
          </Link>
          <div className="pt-24 space-y-1">
            <span className="text-[11px] font-serif uppercase tracking-[0.25em] text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
              Handcrafted Atelier
            </span>
            <p className="text-xs text-white/80 font-sans leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
              Everlasting ribbon roses, golden sunflowers, and luxury gifts.
            </p>
          </div>
        </div>

        {/* Right Side: Floating Clay / Glass Form Card matching reference */}
        <div className="relative z-10 w-full lg:max-w-[430px] lg:ml-auto bg-[#F2F6F2]/90 backdrop-blur-xl rounded-[26px] sm:rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.12),inset_0_1px_2px_rgba(255,255,255,0.95)] border border-white/80">
          {/* Form Header */}
          <div className="text-center mb-5">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1E2522] font-semibold tracking-[-0.01em]">
              {mode === "signup" ? "Create an account" : "Welcome back"}
            </h2>
            <p className="text-xs text-[#556358] mt-1 font-sans">
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError(null);
                    }}
                    className="font-semibold text-[#1E2522] hover:text-[#E10600] underline transition-colors cursor-pointer"
                  >
                    Log in
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setError(null);
                    }}
                    className="font-semibold text-[#1E2522] hover:text-[#E10600] underline transition-colors cursor-pointer"
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-2.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-[11px] text-center font-sans">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
            {/* Username / Name field (shown on signup) */}
            {mode === "signup" && (
              <div className="relative">
                <input
                  type="text"
                  required
                  name="fullname"
                  autoComplete="name"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/95 rounded-full text-xs text-[#1E2522] placeholder:text-[#9BA89D] border border-[#D7E0D7] shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] focus:outline-hidden focus:border-[#1E2522] focus:ring-1 focus:ring-[#1E2522] transition-all"
                />
                <User className="w-4 h-4 text-[#8C9C8F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            )}

            {/* Email / Username field */}
            <div className="relative">
              <input
                type="text"
                required
                name="user_identifier"
                autoComplete="email"
                placeholder={mode === "signup" ? "Email Address" : "Email or Username"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/95 rounded-full text-xs text-[#1E2522] placeholder:text-[#9BA89D] border border-[#D7E0D7] shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] focus:outline-hidden focus:border-[#1E2522] focus:ring-1 focus:ring-[#1E2522] transition-all"
              />
              <Mail className="w-4 h-4 text-[#8C9C8F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Password field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                name="user_secret_key"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white/95 rounded-full text-xs text-[#1E2522] placeholder:text-[#9BA89D] border border-[#D7E0D7] shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] focus:outline-hidden focus:border-[#1E2522] focus:ring-1 focus:ring-[#1E2522] transition-all"
              />
              <Lock className="w-4 h-4 text-[#8C9C8F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C9C8F] hover:text-[#1E2522] transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Confirm Password field on Signup */}
            {mode === "signup" && (
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  name="confirm_secret_key"
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white/95 rounded-full text-xs text-[#1E2522] placeholder:text-[#9BA89D] border border-[#D7E0D7] shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)] focus:outline-hidden focus:border-[#1E2522] focus:ring-1 focus:ring-[#1E2522] transition-all"
                />
                <Lock className="w-4 h-4 text-[#8C9C8F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C9C8F] hover:text-[#1E2522] transition-colors p-1"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            {/* Checkbox Rows */}
            <div className="space-y-1.5 pt-1 text-[11px] text-[#4E5C51] font-sans">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-sm border-[#BAC6BA] text-[#1E2522] focus:ring-0 accent-[#1E2522]"
                />
                <span>Remember me</span>
              </label>

              {mode === "signup" && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-sm border-[#BAC6BA] text-[#1E2522] focus:ring-0 accent-[#1E2522]"
                  />
                  <span>
                    I agree to{" "}
                    <Link href="/terms" className="font-semibold underline text-[#1E2522]">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="font-semibold underline text-[#1E2522]">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-[#1C2521] hover:bg-[#E10600] active:scale-[0.99] text-white font-serif font-semibold text-xs tracking-[0.14em] uppercase shadow-[0_6px_20px_rgba(28,37,33,0.3)] transition-all duration-300 cursor-pointer disabled:opacity-60"
              >
                {loading
                  ? "Verifying..."
                  : mode === "signup"
                  ? "Sign up"
                  : "Sign In"}
              </button>
            </div>
          </form>

          {/* Security note */}
          <div className="mt-4 pt-3 border-t border-[#D5DFD5] text-center">
            <span className="text-[10px] text-[#7C8C7E] flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#059669]" />
              <span>Encrypted Secure Login • Zero Online Payment Upfront</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
