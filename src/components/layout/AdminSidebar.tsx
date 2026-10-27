"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  LayoutDashboard,
  ShoppingBag,
  Sparkles,
  Package,
  Layers,
  Boxes,
  Users,
  Tag,
  BarChart3,
  FileEdit,
  Bell,
  ShieldAlert,
  ClipboardList,
  Settings,
  ChevronRight,
  ExternalLink,
  LogOut,
  ChevronLeft,
  X,
} from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: string;
  ownerOnly?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({
  isCollapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const role = user?.role || "owner";

  // Navigation items categorized by operational department
  const navItems: NavGroup[] = [
    {
      group: "Core Operations",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/orders", label: "Orders", icon: ShoppingBag, badge: "3" },
        { href: "/admin/custom-orders", label: "Custom Orders", icon: RibbonEmblem, badge: "New" },
        { href: "/admin/inventory", label: "Inventory", icon: Boxes },
      ],
    },
    {
      group: "Catalog & Merchandising",
      items: [
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/categories", label: "Categories", icon: Layers },
        { href: "/admin/occasions", label: "Occasions", icon: RibbonEmblem },
        { href: "/admin/discounts", label: "Discounts & Coupons", icon: Tag },
        { href: "/admin/content", label: "Website Studio", icon: FileEdit },
      ],
    },
    {
      group: "Clientele & Intelligence",
      items: [
        { href: "/admin/customers", label: "Customers", icon: Users },
        { href: "/admin/analytics", label: "Analytics & Reports", icon: BarChart3 },
        { href: "/admin/notifications", label: "Notifications", icon: Bell },
      ],
    },
    {
      group: "Governance & Settings",
      items: [
        { href: "/admin/team", label: "Admin Users & Roles", icon: ShieldAlert, ownerOnly: true },
        { href: "/admin/audit-log", label: "Activity Logs", icon: ClipboardList, ownerOnly: true },
        { href: "/admin/settings", label: "Settings", icon: Settings },
      ],
    },
  ];

  const renderNavContent = (isMobileView: boolean) => (
    <>
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-[#333] flex items-center justify-between">
        <Link
          href="/admin"
          onClick={isMobileView ? onCloseMobile : undefined}
          className="flex items-center gap-2.5 overflow-hidden"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#E10600] shrink-0 animate-pulse" />
          {(!isCollapsed || isMobileView) && (
            <div>
              <span className="text-base font-serif font-bold tracking-tight text-white block leading-tight">
                Happiwrapz
              </span>
              <span className="text-[9px] text-[#AAA] font-serif uppercase tracking-[0.2em] font-semibold">
                Admin Studio
              </span>
            </div>
          )}
        </Link>

        {isMobileView ? (
          <button
            type="button"
            onClick={onCloseMobile}
            className="text-[#AAA] hover:text-white p-2 rounded-lg transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="text-[#888] hover:text-white p-1 rounded-md transition-colors cursor-pointer hidden md:block"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin">
        {navItems.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {(!isCollapsed || isMobileView) && (
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#777] px-3 block mb-1">
                {group.group}
              </span>
            )}
            {group.items.map((item) => {
              if (item.ownerOnly && role !== "owner" && role !== "super_admin") return null;

              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={isMobileView ? onCloseMobile : undefined}
                  title={isCollapsed && !isMobileView ? item.label : undefined}
                  className={`flex items-center ${
                    isCollapsed && !isMobileView ? "justify-center px-2 py-3" : "justify-between px-3 py-2.5"
                  } rounded-xl text-xs font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-[#E10600] text-white font-semibold shadow-xs"
                      : "text-[#CCC] hover:bg-white/6 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    {(!isCollapsed || isMobileView) && <span className="truncate">{item.label}</span>}
                  </div>
                  {(!isCollapsed || isMobileView) && item.badge && !isActive && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9.5px] font-bold bg-[#E10600]/20 text-[#FF6B6B]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info & User Switcher */}
      <div className="p-3 border-t border-[#333] space-y-2 bg-[#191919]">
        <Link
          href="/"
          target="_blank"
          onClick={isMobileView ? onCloseMobile : undefined}
          className={`flex items-center ${
            isCollapsed && !isMobileView ? "justify-center p-2" : "justify-between px-3 py-2"
          } rounded-xl text-xs text-[#AAA] hover:text-white hover:bg-white/6 transition-colors`}
          title="View Live Storefront"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            {(!isCollapsed || isMobileView) && <span>Live Storefront</span>}
          </span>
          {(!isCollapsed || isMobileView) && <ChevronRight className="w-3.5 h-3.5 text-[#666]" />}
        </Link>

        {(!isCollapsed || isMobileView) && (
          <div className="flex items-center justify-between px-3 pt-2 border-t border-[#2A2A2A]">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || "Store Owner"}
              </p>
              <p className="text-[10px] text-[#888] truncate">
                {user?.email || "owner@happiwrapz.com"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="p-1.5 text-[#888] hover:text-[#E10600] transition-colors cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Off-Canvas Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Off-Canvas Slide-in Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] bg-[#1E1E1E] text-white flex flex-col md:hidden shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderNavContent(true)}
      </aside>

      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 shrink-0 border-r border-[#333] transition-all duration-300 select-none z-40 bg-[#1E1E1E] text-white ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {renderNavContent(false)}
      </aside>
    </>
  );
}


