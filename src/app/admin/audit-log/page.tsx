"use client";

import { useState, useEffect } from "react";
import { formatDateTime } from "@/lib/utils";
import { ClipboardList, Filter, Search, Download, RefreshCw, ShieldCheck } from "lucide-react";

interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  entity: string;
  details: string;
  timestamp: string;
}

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/audit");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.logs)) {
        const mapped: AuditEntry[] = data.logs.map((l: any) => ({
          id: l.id,
          action: l.action,
          actor: `${l.actorName || "Staff"} (${l.actorRole || "staff"})`,
          entity: l.reference || l.orderId || "system",
          details: l.note || `Action ${l.action}`,
          timestamp: l.timestamp,
        }));
        setLogs(mapped);
      }
    } catch (err) {
      console.warn("Could not fetch server audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter((l) => {
    const matchesAction = filterAction === "all" || l.action === filterAction;
    const matchesSearch =
      searchTerm === "" ||
      l.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes("CONVERTED") || action.includes("CONFIRMED"))
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (action.includes("STATUS") || action.includes("ORDER"))
      return "bg-blue-100 text-blue-800 border-blue-200";
    if (action.includes("INVENTORY") || action.includes("STOCK"))
      return "bg-amber-100 text-amber-800 border-amber-200";
    if (action.includes("SETTINGS") || action.includes("USER") || action.includes("ROLE"))
      return "bg-purple-100 text-purple-800 border-purple-200";
    if (action.includes("DELETED") || action.includes("CANCEL"))
      return "bg-red-100 text-red-800 border-red-200";
    return "bg-zinc-100 text-zinc-800 border-zinc-200";
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Timestamp", "Action", "Actor", "Entity", "Details"];
    const rows = filtered.map((l) => [
      l.id,
      new Date(l.timestamp).toLocaleString("en-IN"),
      l.action,
      `"${l.actor.replace(/"/g, '""')}"`,
      l.entity,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `happiwrapz-audit-log-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-[0.2em] text-[#888888] uppercase">
            Security & Governance
          </span>
          <h1 className="font-serif text-3xl text-[#2A2A2A] mt-1">
            Operational Audit Trail
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Immutable, append-only log of all order transitions, inventory balances, quotations, promotions, and staff actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadLogs}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#C0C0C0] text-[#2A2A2A] text-xs font-semibold rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--charcoal)] hover:bg-[var(--signal-red)] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[var(--border-subtle)] shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by reference ID, staff member name, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#C0C0C0] rounded-xl text-[#2A2A2A] focus:outline-none focus:border-[#2A2A2A]"
          />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="text-xs px-3 py-2 rounded-xl bg-white border border-[#C0C0C0] text-[#2A2A2A] focus:outline-none w-full sm:w-auto"
        >
          <option value="all">All Audit Actions</option>
          <option value="STATUS_TRANSITION">Order Status Transitions</option>
          <option value="CUSTOM_ORDER_STATUS_CHANGED">Custom Order Milestones</option>
          <option value="QUOTATION_CREATED">Quotations Drafted/Sent</option>
          <option value="CUSTOM_ORDER_CONVERTED">Custom Commissions Converted</option>
          <option value="INVENTORY_ADJUSTED">Inventory Adjustments</option>
          <option value="COUPON_CREATED">Coupons Created</option>
          <option value="COUPON_STATUS_CHANGED">Coupon Toggles</option>
          <option value="WEBSITE_SETTINGS_PUBLISHED">Website Settings Published</option>
          <option value="USER_ROLE_CHANGED">Staff Access Changes</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[var(--border-subtle)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--canvas-warm)] border-b border-[var(--border-subtle)]">
              <tr className="text-[#888888] uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6 font-semibold">Timestamp</th>
                <th className="py-3.5 px-6 font-semibold">Action Type</th>
                <th className="py-3.5 px-6 font-semibold">Actor</th>
                <th className="py-3.5 px-6 font-semibold">Target Entity</th>
                <th className="py-3.5 px-6 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#888888]">
                    No audit log records found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono text-[#888888] text-[11px] whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-[#2A2A2A] whitespace-nowrap">
                      {log.actor}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-[var(--signal-red)] whitespace-nowrap">
                      {log.entity}
                    </td>
                    <td className="py-4 px-6 text-[#666666] leading-relaxed max-w-md">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
