"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Package, MapPin, User, LogOut, Shield } from "lucide-react";

function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const navLinks = [
    { href: "/dashboard", label: "My Orders", icon: Package },
    { href: "/dashboard/addresses", label: "Saved Addresses", icon: MapPin },
    { href: "/dashboard/profile", label: "Profile & Settings", icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1E1E1E] selection:bg-[#E10600]/15 selection:text-[#E10600]">
      <Navbar />

      <div className="container-main pt-28 pb-16 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar */}
          <aside className="lg:col-span-3 bg-[#FAF8F5] rounded-3xl border border-[#EFEAE2] p-6 shadow-xs space-y-6">
            {/* User Profile Info */}
            <div className="flex items-center gap-3.5 pb-6 border-b border-[#EFEAE2]">
              <div className="w-12 h-12 rounded-full bg-[#E10600] text-white font-serif font-bold flex items-center justify-center text-lg shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
              </div>
              <div className="min-w-0">
                <h3 className="font-serif text-base text-[#1E1E1E] font-semibold truncate">
                  {user?.name || "Customer Account"}
                </h3>
                <p className="text-xs text-[#888] truncate">
                  {user?.email || "customer@happiwrapz.in"}
                </p>
                <span className="inline-block mt-1 text-[10px] uppercase font-serif font-bold tracking-wider text-[#E10600]">
                  • {user?.role || "Customer"}
                </span>
              </div>
            </div>

            {/* Admin Switcher if role is owner/manager */}
            {(user?.role === "owner" || user?.role === "manager") && (
              <div className="p-4 bg-white rounded-2xl border border-[#EFEAE2] text-xs text-[#1E1E1E]">
                <div className="flex items-center gap-2 font-serif font-semibold text-[#E10600] mb-1">
                  <Shield className="w-4 h-4" />
                  <span>Store Owner Access</span>
                </div>
                <p className="text-[11px] text-[#666] mb-3">
                  Switch to store management portal.
                </p>
                <Link
                  href="/admin"
                  className="block w-full text-center py-2 rounded-xl bg-[#1E1E1E] text-white text-[11px] font-serif font-semibold uppercase tracking-wider hover:bg-[#E10600] transition-colors"
                >
                  Go to Admin Dashboard
                </Link>
              </div>
            )}

            {/* Navigation Menu */}
            <nav className="space-y-1.5 font-serif">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs uppercase tracking-wider font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-[#E10600] text-white shadow-xs"
                        : "text-[#555] hover:bg-white hover:text-[#1E1E1E]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs uppercase tracking-wider font-semibold text-[#DC2626] hover:bg-red-50 transition-all duration-200 text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Main Dashboard Canvas */}
          <main className="lg:col-span-9 bg-white rounded-3xl border border-[#EFEAE2] p-6 sm:p-8 shadow-xs">
            {children}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}
