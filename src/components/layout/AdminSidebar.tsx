"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Boxes,
  Users,
  Tag,
  BarChart3,
  FileEdit,
  Bell,
  ShieldCheck,
  ClipboardList,
  Settings,
  ChevronRight,
  ExternalLink,
  LogOut,
  ChevronLeft,
  X,
  Plus,
  Sparkles,
  Activity,
} from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }> | React.ElementType;
  badge?: string;
  badgeColor?: string;
  ownerOnly?: boolean;
  quickAction?: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
  };
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

  // Streamlined 4-group navigation hierarchy that fits cleanly on all screen heights
  const navGroups: NavGroup[] = useMemo(
    () => [
      {
        group: "Overview",
        items: [
          { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
          { href: "/admin/analytics", label: "Analytics & Reports", icon: BarChart3 },
        ],
      },
      {
        group: "Orders & Operations",
        items: [
          {
            href: "/admin/orders",
            label: "Orders Queue",
            icon: ShoppingBag,
            badge: "Active",
            badgeColor: "bg-[#E10600] text-white",
          },
          {
            href: "/admin/custom-orders",
            label: "Custom Commissions",
            icon: RibbonEmblem,
            badge: "New",
            badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
          },
          { href: "/admin/inventory", label: "Inventory & Stock", icon: Boxes },
        ],
      },
      {
        group: "Catalog & Studio",
        items: [
          {
            href: "/admin/products",
            label: "Products",
            icon: Package,
            quickAction: {
              href: "/admin/products/new",
              icon: Plus,
              title: "Add Product",
            },
          },
          { href: "/admin/categories", label: "Categories", icon: Layers },
          { href: "/admin/occasions", label: "Occasions", icon: Sparkles },
          { href: "/admin/content", label: "Website Studio", icon: FileEdit },
          { href: "/admin/discounts", label: "Discounts & Coupons", icon: Tag },
        ],
      },
      {
        group: "Administration & Settings",
        items: [
          { href: "/admin/customers", label: "Customers", icon: Users },
          { href: "/admin/notifications", label: "Notifications", icon: Bell },
          {
            href: "/admin/monitoring",
            label: "Health & Monitoring",
            icon: Activity,
            badge: "Live",
            badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
          },
          {
            href: "/admin/team",
            label: "Staff Roles",
            icon: ShieldCheck,
            ownerOnly: true,
          },
          {
            href: "/admin/audit-log",
            label: "Audit Logs",
            icon: ClipboardList,
            ownerOnly: true,
          },
          { href: "/admin/settings", label: "Store Settings", icon: Settings },
        ],
      },
    ],
    []
  );

  const renderNavContent = (isMobileView: boolean) => (
    <div className="flex flex-col h-full bg-[#121214] text-white select-none">
      {/* ── Brand Header ── */}
      <div className="h-14 sm:h-16 px-3 sm:px-4 border-b border-white/10 flex items-center justify-between shrink-0">
        <Link
          href="/admin"
          onClick={isMobileView ? onCloseMobile : undefined}
          className="flex items-center gap-2.5 overflow-hidden group"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-[#E10600] to-[#990400] flex items-center justify-center shrink-0 shadow-md shadow-[#E10600]/30 group-hover:scale-105 transition-transform">
            <RibbonEmblem className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          {(!isCollapsed || isMobileView) && (
            <div className="min-w-0">
              <span className="text-sm font-serif font-bold tracking-tight text-white block leading-tight">
                Happiwrapz
              </span>
              <span className="text-[8.5px] text-[#A1A1AA] uppercase tracking-[0.18em] font-semibold block">
                Atelier Console
              </span>
            </div>
          )}
        </Link>

        {isMobileView ? (
          <button
            type="button"
            onClick={onCloseMobile}
            className="text-[#A1A1AA] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="text-[#71717A] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer hidden md:block"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* ── Navigation Items ── */}
      <div className="flex-1 overflow-y-auto px-2.5 sm:px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-0.5">
            {(!isCollapsed || isMobileView) && (
              <h3 className="text-[9.5px] uppercase tracking-[0.16em] font-semibold text-[#71717A] px-2.5 mb-1">
                {group.group}
              </h3>
            )}
            {group.items.map((item) => {
              if (item.ownerOnly && role !== "owner" && role !== "super_admin") return null;

              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <div key={item.href} className="group/item relative flex items-center">
                  <Link
                    href={item.href}
                    onClick={isMobileView ? onCloseMobile : undefined}
                    title={isCollapsed && !isMobileView ? item.label : undefined}
                    className={`flex-1 flex items-center ${
                      isCollapsed && !isMobileView ? "justify-center px-1.5 py-2" : "justify-between px-2.5 py-1.5"
                    } rounded-xl text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-[#E10600] text-white font-semibold shadow-md shadow-[#E10600]/25"
                        : "text-[#D4D4D8] hover:text-white hover:bg-white/[0.07]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "scale-105" : "text-[#A1A1AA] group-hover/item:text-white"}`} />
                      {(!isCollapsed || isMobileView) && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {(!isCollapsed || isMobileView) && item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                          item.badgeColor || "bg-white/10 text-white"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>

                  {/* Optional Quick Add Icon for Products */}
                  {(!isCollapsed || isMobileView) && item.quickAction && (
                    <Link
                      href={item.quickAction.href}
                      onClick={isMobileView ? onCloseMobile : undefined}
                      title={item.quickAction.title}
                      className="p-1 ml-0.5 text-[#71717A] hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <item.quickAction.icon className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── User & Live Storefront Footer ── */}
      <div className="p-2.5 sm:p-3 border-t border-white/10 space-y-1.5 bg-[#0E0E10] shrink-0">
        <Link
          href="/"
          target="_blank"
          onClick={isMobileView ? onCloseMobile : undefined}
          className={`flex items-center ${
            isCollapsed && !isMobileView ? "justify-center p-2" : "justify-between px-2.5 py-1.5"
          } rounded-xl text-xs text-[#A1A1AA] hover:text-white hover:bg-white/[0.08] transition-colors border border-white/5`}
          title="Open Live Website in New Tab"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-[#E10600]" />
            {(!isCollapsed || isMobileView) && <span>Live Storefront</span>}
          </span>
          {(!isCollapsed || isMobileView) && (
            <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded-sm bg-emerald-950 text-emerald-400 border border-emerald-800/40">
              Online
            </span>
          )}
        </Link>

        {(!isCollapsed || isMobileView) && (
          <div className="flex items-center justify-between px-2 pt-1.5 border-t border-white/5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-[#E10600]/20 border border-[#E10600]/40 flex items-center justify-center text-[11px] font-bold text-[#FF6B6B] shrink-0">
                {(user?.name || "O")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user?.name || "Store Owner"}
                </p>
                <p className="text-[9.5px] text-[#71717A] truncate">
                  {user?.role || "owner"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="p-1 text-[#71717A] hover:text-[#E10600] hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 md:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] flex flex-col md:hidden shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderNavContent(true)}
      </aside>

      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-full shrink-0 border-r border-[#242428] transition-all duration-300 z-40 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {renderNavContent(false)}
      </aside>
    </>
  );
}
