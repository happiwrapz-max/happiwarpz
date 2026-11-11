"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  ShieldAlert,
  ArrowLeft,
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, setUser, initAuth } = useAuthStore();
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // In-place admin login state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    initAuth();
  }, [initAuth]);

  // Handle direct admin login
  const handleAdminSignIn = async (emailToUse?: string) => {
    const targetEmail = (emailToUse || adminEmail).trim();
    if (!targetEmail) {
      setAuthError("Please provide an administrator email address.");
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: targetEmail,
          password: adminPassword || undefined,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setUser(data.user);
        if (data.user.role === "customer") {
          setAuthError(
            `Account ${data.user.email} is a customer. Please use an authorized staff email (e.g. owner@happiwrapz.com).`
          );
        }
      } else {
        setAuthError(data.error || "Authentication failed. Please verify credentials.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to reach authentication service.");
    } finally {
      setAuthLoading(false);
    }
  };

  // During SSR or initial hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#E10600] border-t-transparent animate-spin" />
      </div>
    );
  }

  const isStaff =
    user &&
    ["owner", "admin", "super_admin", "manager", "order_manager", "product_manager"].includes(
      user.role
    );

  // If not authenticated or not staff, display the in-place admin authentication console
  if (!isAuthenticated || !user || !isStaff) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#EFEAE2] p-8 sm:p-10 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Brand & Badge Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-[#E10600]/10 border border-[#E10600]/20 flex items-center justify-center mx-auto text-[#E10600]">
              <Lock className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] text-[10px] font-serif font-semibold tracking-[0.2em] uppercase text-[#E10600]">
              <Sparkles className="w-3 h-3" />
              <span>Studio Governance Portal</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E1E1E]">
              Happiwrapz Admin Studio
            </h1>
            <p className="text-xs text-[#666] leading-relaxed">
              Restricted management area for Coimbatore order dispatch, inventory controls, and studio pricing.
            </p>
          </div>

          {/* Customer Warning if logged in as customer */}
          {user && user.role === "customer" && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Access Denied — Staff Authentication Required</strong>
                <span>Signed in as <em>{user.email}</em> (Customer). Switch to authorized store staff credentials below to enter.</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {authError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed">
              {authError}
            </div>
          )}

          {/* Quick Staff Access Shortcuts */}
          <div className="space-y-2.5 pt-1">
            <span className="text-[10px] font-serif font-semibold tracking-wider text-[#888] uppercase block text-center">
              Quick Authorized Access
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleAdminSignIn("owner@happiwrapz.com")}
                disabled={authLoading}
                className="w-full py-2.5 px-3 bg-[#1E1E1E] hover:bg-black text-white rounded-xl text-xs font-serif font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#E10600]" />
                <span>Store Owner</span>
              </button>
              <button
                type="button"
                onClick={() => handleAdminSignIn("manager@happiwrapz.com")}
                disabled={authLoading}
                className="w-full py-2.5 px-3 bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#EFEAE2] text-[#1E1E1E] rounded-xl text-xs font-serif font-semibold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                <span>Store Manager</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#EFEAE2]" />
            <span className="text-[10px] font-serif text-[#888] uppercase tracking-wider">or sign in with staff email</span>
            <div className="flex-1 h-px bg-[#EFEAE2]" />
          </div>

          {/* Staff Credentials Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAdminSignIn();
            }}
            className="space-y-3.5"
          >
            <div>
              <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="staff@happiwrapz.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                Security Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#1E1E1E] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-[#E10600] hover:bg-[#c00500] text-white rounded-full text-xs font-serif font-semibold uppercase tracking-wider transition-all shadow-md shadow-[#E10600]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {authLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Authenticate Admin Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Return Link */}
          <div className="pt-2 border-t border-[#EFEAE2] text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#666] hover:text-[#1E1E1E] font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Happiwrapz Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard Layout
  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#FAF8F5] text-[#1E1E1E]">
      <Suspense fallback={<div className="hidden md:block w-64 bg-[#121214] h-full shrink-0" />}>
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      </Suspense>

      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <AdminHeader
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto scrollbar-thin scrollbar-thumb-[#EFEAE2]">
          {children}
        </main>
      </div>
    </div>
  );
}
