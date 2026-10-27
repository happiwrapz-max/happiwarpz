"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-white text-[#1E1E1E]">
      <Navbar />

      <main className="container-main max-w-md pt-32 pb-20 px-4 sm:px-6">
        <div className="bg-[#FAF8F5] rounded-3xl p-8 sm:p-10 border border-[#EFEAE2] shadow-sm">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#666] hover:text-[#E10600] mb-6 transition-colors font-serif"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>

          <span className="text-[10px] font-serif font-semibold tracking-[0.25em] text-[#E10600] uppercase block mb-1">
            ACCOUNT RECOVERY
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#1E1E1E] font-normal mb-2">
            Reset Password
          </h1>
          <p className="text-xs text-[#666] mb-6 leading-relaxed">
            Enter your account email. We will dispatch a secure reset verification code directly to your inbox.
          </p>

          {submitted ? (
            <div className="p-6 bg-white border border-[#EFEAE2] rounded-2xl text-center space-y-4 animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base text-[#1E1E1E] font-semibold">
                Reset Link Dispatched
              </h3>
              <p className="text-xs text-[#666]">
                If an account exists for <strong className="text-[#1E1E1E]">{email}</strong>, a recovery link has been sent. Check your spam folder if it doesn't arrive within a minute.
              </p>
              <Link
                href="/login"
                className="inline-block px-6 py-2.5 rounded-full bg-[#1E1E1E] hover:bg-[#E10600] text-white text-xs font-serif uppercase tracking-wider font-semibold transition-colors"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-serif font-medium text-[#1E1E1E] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#E10600] hover:bg-[#C20500] disabled:opacity-60 text-white rounded-full text-xs font-serif uppercase tracking-wider font-semibold transition-all shadow-xs cursor-pointer"
              >
                {loading ? "Sending Code..." : "Send Reset Code"}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-[#EFEAE2] flex items-center gap-2 text-[11px] text-[#777]">
            <ShieldCheck className="w-4 h-4 text-[#E10600] shrink-0" />
            <span>Happiwrapz Concierge Verification Service</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
