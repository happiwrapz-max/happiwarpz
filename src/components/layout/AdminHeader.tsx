"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  Search,
  Bell,
  Menu,
  Check,
  ChevronRight,
  ExternalLink,
  LogOut,
  User,
  ShieldCheck,
  Package,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import { AdminNotification } from "@/lib/store/types";

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  onToggleMobileSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export default function AdminHeader({
  onToggleSidebar,
  onToggleMobileSidebar,
  isSidebarCollapsed,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Load live notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: AdminNotification) => !n.isRead).length);
      }
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn("Failed to mark all as read:", err);
    }
  };

  // Mark single as read
  const handleNotificationClick = async (notif: AdminNotification) => {
    if (!notif.isRead) {
      try {
        await fetch("/api/admin/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: notif.id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {}
    }
    setShowNotifDropdown(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  // Generate breadcrumb items
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const url = "/" + pathSegments.slice(0, index + 1).join("/");
    const label =
      segment === "admin"
        ? "Dashboard"
        : segment
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    return { url, label };
  });

  return (
    <>
      <header className="h-14 sm:h-16 bg-white border-b border-[#EFEAE2] px-3 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        {/* Left Side: Collapse Toggle on desktop / Drawer Toggle on mobile & Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Drawer Button */}
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl text-[#666] hover:bg-[#FAF8F5] hover:text-[#1E1E1E] transition-colors cursor-pointer"
            aria-label="Open Admin Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Button */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="hidden md:flex p-2 rounded-xl text-[#666] hover:bg-[#FAF8F5] hover:text-[#1E1E1E] transition-colors cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Mobile Title */}
          <div className="flex md:hidden items-center gap-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-[#E10600] shrink-0 animate-pulse" />
            <span className="font-serif font-bold text-sm text-[#1E1E1E] truncate">Happiwrapz</span>
            <span className="text-[9px] uppercase tracking-wider font-semibold text-[#888] bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#EFEAE2]">Admin</span>
          </div>

          {/* Breadcrumb Navigation on Desktop */}
          <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1.5 text-xs text-[#777] min-w-0">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <div key={crumb.url} className="flex items-center gap-1.5 min-w-0">
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-[#BBB] shrink-0" />}
                  {isLast ? (
                    <span className="font-semibold text-[#1E1E1E] truncate max-w-[200px]">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.url}
                      className="hover:text-[#E10600] transition-colors truncate"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Right Side Actions: Global Search, Store Status, Notifications, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-4">
          {/* Mobile Search Button */}
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="md:hidden p-2 rounded-xl text-[#666] hover:bg-[#FAF8F5] hover:text-[#1E1E1E] transition-colors cursor-pointer"
            aria-label="Search Studio"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Desktop Search Bar */}
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] text-xs text-[#888] hover:border-[#CCC] transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#888]" />
            <span>Search orders, products, clients...</span>
            <kbd className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-[#E5E0D8] text-[#999]">
              ⌘K
            </kbd>
          </button>

          {/* Store Status Pill */}
          <div className="hidden lg:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Studio Open</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-xl text-[#666] hover:bg-[#FAF8F5] hover:text-[#1E1E1E] transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E10600] text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#EFEAE2] shadow-xl z-50 overflow-hidden text-xs">
                <div className="p-3.5 border-b border-[#EFEAE2] flex items-center justify-between bg-[#FAF8F5]">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-[#1E1E1E]">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#E10600]/10 text-[#E10600] text-[10px] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-[#E10600] hover:underline font-medium cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#F2ECE4]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-[#888]">
                      <Bell className="w-6 h-6 mx-auto mb-2 text-[#CCC]" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 8).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 hover:bg-[#FAF8F5] transition-colors cursor-pointer flex gap-3 items-start ${
                          !notif.isRead ? "bg-[#FFF9F9]" : ""
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                            notif.type === "order"
                              ? "bg-emerald-500"
                              : notif.type === "low_stock"
                              ? "bg-amber-500"
                              : "bg-[#E10600]"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#1E1E1E] leading-tight">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-[#666] line-clamp-2 mt-0.5">
                            {notif.message}
                          </p>
                          <span className="text-[9.5px] text-[#999] mt-1 block">
                            {new Date(notif.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-[#EFEAE2] text-center bg-[#FAF8F5]">
                  <Link
                    href="/admin/notifications"
                    onClick={() => setShowNotifDropdown(false)}
                    className="text-[11px] text-[#1E1E1E] hover:text-[#E10600] font-semibold"
                  >
                    View All Notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile & Account Menu */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 sm:p-1.5 rounded-full hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#1E1E1E] text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-semibold text-[#1E1E1E] block leading-tight">
                  {user?.name || "Store Owner"}
                </span>
                <span className="text-[10px] text-[#E10600] uppercase font-bold tracking-wider">
                  {user?.role || "Owner"}
                </span>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#EFEAE2] shadow-xl z-50 p-2 text-xs space-y-1">
                <div className="p-2.5 border-b border-[#EFEAE2] mb-1">
                  <p className="font-semibold text-[#1E1E1E] truncate">{user?.name}</p>
                  <p className="text-[11px] text-[#888] truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-[#E10600]/10 text-[#E10600] font-bold text-[9px] uppercase tracking-wider">
                    Role: {user?.role}
                  </span>
                </div>

                <Link
                  href="/"
                  target="_blank"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#555] hover:bg-[#FAF8F5] hover:text-[#1E1E1E] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Live Storefront</span>
                </Link>

                <Link
                  href="/admin/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#555] hover:bg-[#FAF8F5] hover:text-[#1E1E1E] transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Studio Settings</span>
                </Link>

                <div className="border-t border-[#EFEAE2] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      router.push("/login");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#E10600] hover:bg-[#FFF0F0] transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="font-semibold">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Quick Navigation Strip - Instant 1-tap navigation on phone screens */}
      <nav
        aria-label="Mobile Admin Navigation"
        className="md:hidden bg-white/95 backdrop-blur-md border-b border-[#EFEAE2] px-2.5 py-2 overflow-x-auto scrollbar-none sticky top-14 z-20 flex items-center gap-1.5 shadow-2xs"
      >
        {[
          { href: "/admin", label: "Dashboard", icon: "📊" },
          { href: "/admin/orders", label: "Orders", icon: "🛍️" },
          { href: "/admin/custom-orders", label: "Custom", icon: "🎀" },
          { href: "/admin/products", label: "Products", icon: "📦" },
          { href: "/admin/inventory", label: "Inventory", icon: "🗃️" },
          { href: "/admin/analytics", label: "Reports", icon: "📈" },
          { href: "/admin/settings", label: "Settings", icon: "⚙️" },
        ].map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-serif transition-all shrink-0 active:scale-95 ${
                isActive
                  ? "bg-[#E10600] text-white shadow-xs font-semibold"
                  : "bg-[#FAF8F5] text-[#555] border border-[#EFEAE2] hover:text-[#1E1E1E]"
              }`}
            >
              <span className="text-[11px]">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Global Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-start justify-center pt-20 p-4">
          <div className="bg-white rounded-3xl border border-[#EFEAE2] shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#EFEAE2] flex items-center gap-3">
              <Search className="w-5 h-5 text-[#E10600]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, custom orders, products, customers..."
                autoFocus
                className="w-full text-sm text-[#1E1E1E] placeholder-[#999] focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="text-xs text-[#888] hover:text-[#1E1E1E] px-2 py-1 rounded-md border border-[#E5E0D8]"
              >
                ESC
              </button>
            </div>

            <div className="p-4 max-h-80 overflow-y-auto space-y-2 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#999] px-2">
                Quick Navigation
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/admin/orders"
                  onClick={() => setShowSearchModal(false)}
                  className="p-2.5 rounded-xl border border-[#EFEAE2] hover:border-[#E10600] flex items-center gap-2 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-[#E10600]" />
                  <span>Orders Lifecycle</span>
                </Link>
                <Link
                  href="/admin/custom-orders"
                  onClick={() => setShowSearchModal(false)}
                  className="p-2.5 rounded-xl border border-[#EFEAE2] hover:border-[#E10600] flex items-center gap-2 transition-colors"
                >
                  <Package className="w-4 h-4 text-[#E10600]" />
                  <span>Custom Commissions</span>
                </Link>
                <Link
                  href="/admin/inventory"
                  onClick={() => setShowSearchModal(false)}
                  className="p-2.5 rounded-xl border border-[#EFEAE2] hover:border-[#E10600] flex items-center gap-2 transition-colors"
                >
                  <Package className="w-4 h-4 text-[#E10600]" />
                  <span>Inventory Control</span>
                </Link>
                <Link
                  href="/admin/analytics"
                  onClick={() => setShowSearchModal(false)}
                  className="p-2.5 rounded-xl border border-[#EFEAE2] hover:border-[#E10600] flex items-center gap-2 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#E10600]" />
                  <span>Business Analytics</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
