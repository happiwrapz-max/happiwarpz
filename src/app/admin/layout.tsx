"use client";

import { useEffect, useState, Suspense } from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, loginAsDemo } = useAuthStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // For convenience in dev, if not logged in, auto-login as owner
    if (!isAuthenticated) {
      loginAsDemo("owner");
    }
  }, [isAuthenticated, loginAsDemo]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex text-[#1E1E1E]">
      <Suspense fallback={<div className="hidden md:block w-64 bg-[#1E1E1E] h-screen shrink-0" />}>
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      </Suspense>

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
