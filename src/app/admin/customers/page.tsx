"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice, formatDate, formatDateTime } from "@/lib/utils";
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  TrendingUp,
  Calendar,
  X,
  ArrowRight,
  Download,
  Award,
  Sparkles,
  MessageSquare,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { OrderRequest } from "@/lib/store/types";

interface CustomerProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  orderCount: number;
  totalSpend: number;
  orders: OrderRequest[];
  lastOrderDate: string;
  isRegistered?: boolean;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSegment, setFilterSegment] = useState<"all" | "vip" | "repeat" | "new">("all");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  const fetchClientele = async () => {
    setLoading(true);
    try {
      // 1. Fetch Orders to compile real purchasing behavior
      const [ordersRes, usersRes] = await Promise.all([
        fetch("/api/orders").then((r) => r.json()).catch(() => ({ orders: [] })),
        fetch("/api/admin/users").then((r) => r.json()).catch(() => ({ users: [] })),
      ]);

      const map = new Map<string, CustomerProfile>();

      // Populate from orders
      if (ordersRes.success && Array.isArray(ordersRes.orders)) {
        ordersRes.orders.forEach((o: OrderRequest) => {
          if (!o.customer?.email) return;
          const emailKey = o.customer.email.toLowerCase().trim();
          const amount = o.totalAmount || o.subtotal || 0;

          if (map.has(emailKey)) {
            const existing = map.get(emailKey)!;
            existing.orderCount += 1;
            existing.totalSpend += o.status !== "cancelled" ? amount : 0;
            existing.orders.push(o);
            if (new Date(o.createdAt).getTime() > new Date(existing.lastOrderDate).getTime()) {
              existing.lastOrderDate = o.createdAt;
            }
          } else {
            map.set(emailKey, {
              name: o.customer.name || emailKey.split("@")[0],
              email: o.customer.email,
              phone: o.customer.phone || "+91 ",
              address: o.customer.address || "Coimbatore Studio Pickup",
              city: o.customer.city || "Coimbatore",
              orderCount: 1,
              totalSpend: o.status !== "cancelled" ? amount : 0,
              orders: [o],
              lastOrderDate: o.createdAt,
              isRegistered: false,
            });
          }
        });
      }

      // Merge registered users
      if (usersRes.success && Array.isArray(usersRes.users)) {
        usersRes.users.forEach((u: any) => {
          const emailKey = u.email.toLowerCase().trim();
          if (map.has(emailKey)) {
            map.get(emailKey)!.isRegistered = true;
          } else if (u.role === "customer") {
            map.set(emailKey, {
              name: u.name || emailKey.split("@")[0],
              email: u.email,
              phone: "+91 7708354636",
              address: "Coimbatore, Tamil Nadu",
              city: "Coimbatore",
              orderCount: 0,
              totalSpend: 0,
              orders: [],
              lastOrderDate: new Date().toISOString(),
              isRegistered: true,
            });
          }
        });
      }

      setCustomers(Array.from(map.values()));
    } catch (err) {
      console.error("Customers fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientele();
  }, []);

  // Customer segmentation logic
  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterSegment === "vip") return c.totalSpend >= 3000;
    if (filterSegment === "repeat") return c.orderCount >= 2;
    if (filterSegment === "new") return c.orderCount <= 1;

    return true;
  });

  // KPI calculations
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpend, 0);
  const avgLTV = customers.length > 0 ? Math.round(totalRevenue / customers.length) : 0;
  const vipCount = customers.filter((c) => c.totalSpend >= 3000).length;
  const repeatCount = customers.filter((c) => c.orderCount >= 2).length;
  const repeatRate = customers.length > 0 ? Math.round((repeatCount / customers.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE2]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-serif font-semibold text-[#E10600] uppercase tracking-[0.2em] mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Client Relationship Management</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal">
            Customer Directory & Profiles
          </h1>
          <p className="text-xs text-[#666] mt-0.5">
            Spending history, order frequencies, Coimbatore delivery coordinates, and direct WhatsApp concierge access.
          </p>
        </div>

        <a
          href="/api/admin/analytics?export=customers"
          download
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#EFEAE2] text-xs font-serif font-semibold text-[#1E1E1E] hover:border-[#E10600] hover:text-[#E10600] transition-colors shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-[#E10600]" />
          <span>Export Clientele CSV</span>
        </a>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs">
          <span className="text-xs text-[#777] font-medium block">Total Clientele</span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1E1E] mt-1 block">
            {customers.length}
          </span>
          <p className="text-[11px] text-[#666] mt-1">Verified patrons & accounts</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs">
          <span className="text-xs text-[#777] font-medium block">VIP Patrons (₹3,000+)</span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-600 mt-1 block">
            {vipCount}
          </span>
          <p className="text-[11px] text-amber-700 mt-1">High-value luxury collectors</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs">
          <span className="text-xs text-[#777] font-medium block">Average Lifetime Value</span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1E1E] mt-1 block">
            {formatPrice(avgLTV)}
          </span>
          <p className="text-[11px] text-[#059669] mt-1">Per active customer</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#EFEAE2] shadow-xs">
          <span className="text-xs text-[#777] font-medium block">Repeat Client Rate</span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-emerald-600 mt-1 block">
            {repeatRate}%
          </span>
          <p className="text-[11px] text-[#666] mt-1">{repeatCount} clients with 2+ orders</p>
        </div>
      </div>

      {/* Search and Segmentation Tabs */}
      <div className="p-4 bg-white rounded-3xl border border-[#EFEAE2] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, email, phone, city..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-full text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white transition-colors"
          />
        </div>

        {/* Segmentation Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Clients" },
            { id: "vip", label: "VIP Patrons" },
            { id: "repeat", label: "Repeat Buyers" },
            { id: "new", label: "New Clients" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterSegment(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif transition-all cursor-pointer whitespace-nowrap ${
                filterSegment === tab.id
                  ? "bg-[#E10600] text-white font-semibold shadow-xs"
                  : "bg-[#FAF8F5] text-[#666] hover:bg-[#F2ECE4] hover:text-[#1E1E1E]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-white rounded-3xl border border-[#EFEAE2] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#EFEAE2] bg-[#FAF8F5] text-[#777] font-serif uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6">Customer & Tier</th>
                <th className="py-3.5 px-4">Contact & WhatsApp</th>
                <th className="py-3.5 px-4">Delivery City</th>
                <th className="py-3.5 px-4 text-center">Orders</th>
                <th className="py-3.5 px-4">Lifetime Spend</th>
                <th className="py-3.5 px-4">Avg Order Value</th>
                <th className="py-3.5 px-4">Latest Order</th>
                <th className="py-3.5 px-6 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE4]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#888]">
                    Loading customer records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#888]">
                    <Users className="w-8 h-8 mx-auto mb-2 text-[#CCC]" />
                    <p className="font-serif text-sm font-semibold text-[#1E1E1E]">No matching customers found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((client) => {
                  const aov = client.orderCount > 0 ? Math.round(client.totalSpend / client.orderCount) : 0;
                  const isVip = client.totalSpend >= 3000;

                  return (
                    <tr
                      key={client.email}
                      className="hover:bg-[#FAF8F5]/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedCustomer(client)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-[#1E1E1E] block">
                            {client.name}
                          </span>
                          {isVip && (
                            <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-serif font-semibold">
                              VIP
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#888]">{client.email}</span>
                      </td>

                      <td className="py-4 px-4">
                        <a
                          href={`https://wa.me/${client.phone?.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#25D366] hover:underline font-semibold inline-flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{client.phone}</span>
                        </a>
                      </td>

                      <td className="py-4 px-4 text-[#555] font-serif">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#E10600]" />
                          <span>{client.city}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="font-mono font-bold text-xs bg-[#FAF8F5] border border-[#EFEAE2] px-2.5 py-1 rounded-full text-[#1E1E1E]">
                          {client.orderCount}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-serif font-bold text-[#E10600] text-sm">
                        {formatPrice(client.totalSpend)}
                      </td>

                      <td className="py-4 px-4 font-serif font-semibold text-[#1E1E1E]">
                        {formatPrice(aov)}
                      </td>

                      <td className="py-4 px-4 text-[#777] text-[11px]">
                        {client.orders.length > 0 ? formatDate(client.lastOrderDate) : "Account Only"}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          className="text-xs font-serif font-semibold text-[#E10600] hover:underline inline-flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
          <div className="bg-white h-full w-full max-w-lg shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div>
              {/* Drawer Top */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EFEAE2]">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-2xl font-bold text-[#1E1E1E]">
                      {selectedCustomer.name}
                    </h2>
                    {selectedCustomer.totalSpend >= 3000 && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-serif font-semibold">
                        ★ VIP Patron
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#888]">{selectedCustomer.email}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 rounded-full hover:bg-[#FAF8F5] text-[#888] hover:text-[#1E1E1E]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Direct Communication Strip */}
              <div className="grid grid-cols-2 gap-3 py-5 border-b border-[#EFEAE2]">
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className="p-3 bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#EFEAE2] rounded-2xl flex items-center justify-center gap-2 text-xs font-serif font-semibold text-[#1E1E1E] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#E10600]" />
                  <span>Direct Telephone</span>
                </a>

                <a
                  href={`https://wa.me/${selectedCustomer.phone?.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(selectedCustomer.name)},%20greeting%20from%20Happiwrapz%20Floral%20Studio!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-2xl flex items-center justify-center gap-2 text-xs font-serif font-semibold text-[#25D366] transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Chat</span>
                </a>
              </div>

              {/* Client Metrics */}
              <div className="grid grid-cols-3 gap-3 py-5 border-b border-[#EFEAE2] text-center">
                <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2]">
                  <span className="text-[10px] text-[#888] uppercase font-serif font-semibold block">Total Orders</span>
                  <span className="font-serif text-xl font-bold text-[#1E1E1E] mt-0.5 block">
                    {selectedCustomer.orderCount}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2]">
                  <span className="text-[10px] text-[#888] uppercase font-serif font-semibold block">Total Spend</span>
                  <span className="font-serif text-xl font-bold text-[#E10600] mt-0.5 block">
                    {formatPrice(selectedCustomer.totalSpend)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2]">
                  <span className="text-[10px] text-[#888] uppercase font-serif font-semibold block">City</span>
                  <span className="font-serif text-sm font-bold text-[#1E1E1E] mt-1 block truncate">
                    {selectedCustomer.city}
                  </span>
                </div>
              </div>

              {/* Address */}
              <div className="py-4 border-b border-[#EFEAE2] space-y-1">
                <span className="text-[11px] font-serif font-semibold uppercase tracking-wider text-[#888]">
                  Primary Delivery Address
                </span>
                <p className="text-xs text-[#1E1E1E] leading-relaxed">
                  {selectedCustomer.address}, {selectedCustomer.city}
                </p>
              </div>

              {/* Order History */}
              <div className="py-4 space-y-3">
                <span className="text-[11px] font-serif font-semibold uppercase tracking-wider text-[#888] block">
                  Purchased Orders ({selectedCustomer.orders.length})
                </span>

                {selectedCustomer.orders.length === 0 ? (
                  <p className="text-xs text-[#888] p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2] text-center">
                    No orders placed yet. Client registered via account portal.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedCustomer.orders.map((o) => (
                      <div
                        key={o.id}
                        className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="font-mono font-bold text-[#1E1E1E]">
                              {o.reference}
                            </strong>
                            <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-white border border-[#EFEAE2] uppercase font-semibold">
                              {o.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#888] mt-0.5 block">
                            {formatDate(o.createdAt)} • {o.items?.length || 1} items
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="font-serif font-bold text-[#E10600] block">
                            {formatPrice(o.totalAmount || o.subtotal || 0)}
                          </span>
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="text-[11px] text-[#1E1E1E] hover:underline font-semibold"
                          >
                            Inspect →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCustomer(null)}
              className="w-full mt-4 py-3 rounded-full bg-[#1E1E1E] hover:bg-black text-white text-xs font-serif font-semibold uppercase tracking-wider transition-colors"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
