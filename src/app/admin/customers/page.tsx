"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
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
} from "lucide-react";
import { OrderRequest, CustomOrderRequest } from "@/lib/store/types";

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
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);

  const fetchClientele = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const map = new Map<string, CustomerProfile>();

        data.orders.forEach((o: OrderRequest) => {
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
              name: o.customer.name,
              email: o.customer.email,
              phone: o.customer.phone,
              address: o.customer.address,
              city: o.customer.city || "Bangalore",
              orderCount: 1,
              totalSpend: o.status !== "cancelled" ? amount : 0,
              orders: [o],
              lastOrderDate: o.createdAt,
            });
          }
        });

        setCustomers(Array.from(map.values()));
      }
    } catch (err) {
      console.error("Customers fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientele();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE2]">
        <div>
          <span className="text-xs font-semibold tracking-[0.2em] text-[#888888] uppercase">
            Clientele Intelligence
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal mt-0.5">
            Customer Directory
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Customer spending history, order frequencies, Bangalore delivery coordinates, and direct WhatsApp concierge access.
          </p>
        </div>

        <a
          href="/api/admin/analytics?export=customers"
          download
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#EFEAE2] text-xs font-serif font-semibold text-[#1E1E1E] hover:border-[#E10600] hover:text-[#E10600] transition-colors shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-[#E10600]" />
          <span>Export Clientele CSV</span>
        </a>
      </div>

      {/* Search and Metrics Strip */}
      <div className="p-4 bg-white rounded-3xl border border-[#EFEAE2] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name, email, phone, locality..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-full text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white transition-colors"
          />
        </div>

        <div className="text-xs font-serif text-[#777] flex items-center gap-4">
          <span>
            Total Clients: <strong className="text-[#1E1E1E]">{customers.length}</strong>
          </span>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-3xl border border-[#EFEAE2] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#EFEAE2] bg-[#FAF8F5] text-[#777] font-serif uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-4">Phone / WhatsApp</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-center">Orders</th>
                <th className="py-3.5 px-4">Total Spending</th>
                <th className="py-3.5 px-4">Avg Order Value</th>
                <th className="py-3.5 px-4">Last Order</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE4]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#888]">
                    Loading customer directory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#888]">
                    <Users className="w-8 h-8 mx-auto mb-2 text-[#CCC]" />
                    <p className="font-serif text-sm font-semibold text-[#1E1E1E]">No customers found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((client) => {
                  const aov = client.orderCount > 0 ? Math.round(client.totalSpend / client.orderCount) : 0;

                  return (
                    <tr
                      key={client.email}
                      className="hover:bg-[#FAF8F5]/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedCustomer(client)}
                    >
                      <td className="py-4 px-6">
                        <span className="font-serif font-bold text-sm text-[#1E1E1E] block">
                          {client.name}
                        </span>
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

                      <td className="py-4 px-4 text-[#666]">
                        <span className="block truncate max-w-[140px]">{client.address}</span>
                        <span className="text-[10px] text-[#999]">{client.city}</span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#EFEAE2]">
                          {client.orderCount}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-serif font-bold text-[#1E1E1E]">
                        {formatPrice(client.totalSpend)}
                      </td>

                      <td className="py-4 px-4 font-serif text-[#059669] font-medium">
                        {formatPrice(aov)}
                      </td>

                      <td className="py-4 px-4 text-[11px] text-[#888]">
                        {formatDate(client.lastOrderDate)}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(client);
                          }}
                          className="p-1.5 rounded-lg border border-[#EFEAE2] hover:border-[#E10600] text-[#777] hover:text-[#E10600] transition-colors"
                          title="Inspect profile"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
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

      {/* Customer Profile Inspection Modal / Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#EFEAE2] shadow-2xl space-y-6 text-xs animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EFEAE2]">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#1E1E1E]">
                  {selectedCustomer.name}
                </h3>
                <p className="text-[11px] text-[#666]">{selectedCustomer.email} • {selectedCustomer.phone}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-xs text-[#888] hover:text-[#1E1E1E]"
              >
                ✕ Close
              </button>
            </div>

            {/* Financial Stats */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2] text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#888] block">Lifetime Value</span>
                <span className="font-serif text-lg font-bold text-[#E10600] mt-0.5 block">
                  {formatPrice(selectedCustomer.totalSpend)}
                </span>
              </div>
              <div className="border-x border-[#EFEAE2]">
                <span className="text-[10px] uppercase font-bold text-[#888] block">Orders Placed</span>
                <span className="font-serif text-lg font-bold text-[#1E1E1E] mt-0.5 block">
                  {selectedCustomer.orderCount}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#888] block">Average Basket</span>
                <span className="font-serif text-lg font-bold text-emerald-600 mt-0.5 block">
                  {formatPrice(
                    selectedCustomer.orderCount > 0
                      ? Math.round(selectedCustomer.totalSpend / selectedCustomer.orderCount)
                      : 0
                  )}
                </span>
              </div>
            </div>

            {/* Historical Orders List */}
            <div className="space-y-3">
              <span className="font-serif font-bold text-sm text-[#1E1E1E] block">
                Order History ({selectedCustomer.orders.length})
              </span>
              <div className="divide-y divide-[#EFEAE2] border rounded-2xl border-[#EFEAE2] overflow-hidden">
                {selectedCustomer.orders.map((o) => (
                  <div key={o.id} className="p-3.5 hover:bg-[#FAF8F5] flex items-center justify-between transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#1E1E1E]">{o.reference}</span>
                        <span className="text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase bg-blue-50 text-blue-700">
                          {o.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666] mt-0.5">
                        {formatDate(o.createdAt)} • {o.items?.length} items
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-serif font-bold text-xs text-[#1E1E1E] block">
                        {formatPrice(o.totalAmount || o.subtotal || 0)}
                      </span>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        onClick={() => setSelectedCustomer(null)}
                        className="text-[11px] text-[#E10600] hover:underline font-semibold"
                      >
                        Inspect →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct WhatsApp Concierge Action */}
            <div className="pt-2 flex gap-3">
              <a
                href={`https://wa.me/${selectedCustomer.phone?.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-serif font-semibold uppercase tracking-wider text-xs transition-colors shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-6 py-3 rounded-full border border-[#EFEAE2] hover:bg-[#FAF8F5] text-[#666] font-serif text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
