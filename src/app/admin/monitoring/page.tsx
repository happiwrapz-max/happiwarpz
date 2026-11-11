"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  FileText,
  Download,
  Trash2,
  ShieldAlert,
  Server,
  Database,
  Cloud,
  Key,
  ShoppingBag,
  Mail,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { AppErrorEvent, ErrorKPIs, SystemHealthReport } from "@/lib/server/errorTypes";

export default function AdminMonitoringPage() {
  const [errors, setErrors] = useState<AppErrorEvent[]>([]);
  const [kpi, setKpi] = useState<ErrorKPIs>({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    unresolved: 0,
    investigating: 0,
    resolved: 0,
  });
  const [health, setHealth] = useState<SystemHealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [healthLoading, setHealthLoading] = useState(false);

  // Filters
  const [selectedSeverity, setSelectedSeverity] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Error details drawer
  const [activeError, setActiveError] = useState<AppErrorEvent | null>(null);
  const [newNote, setNewNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      if (data.report) {
        setHealth(data.report);
      }
    } catch (err) {
      console.error("Health check fetch error:", err);
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSeverity !== "ALL") params.set("severity", selectedSeverity);
      if (selectedCategory !== "ALL") params.set("category", selectedCategory);
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/admin/monitoring/errors?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setErrors(data.errors || []);
        if (data.kpi) setKpi(data.kpi);
      }
    } catch (err) {
      console.error("Errors fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchErrors();
  }, [selectedSeverity, selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchErrors();
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/monitoring/errors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Incident marked as ${newStatus}.`);
        if (activeError && activeError.id === id) {
          setActiveError(data.error);
        }
        await fetchErrors();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeError || !newNote.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/monitoring/errors/${activeError.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNote.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveError(data.error);
        setNewNote("");
        showToast("Investigation note saved.");
        await fetchErrors();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePurgeResolved = async () => {
    if (!confirm("Are you sure you want to clear all resolved error records?")) return;
    try {
      const res = await fetch("/api/admin/monitoring/errors", { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "Resolved errors purged.");
        await fetchErrors();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify({ exportDate: new Date().toISOString(), kpi, errors }, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `happiwrapz-error-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-rose-100 text-rose-800 border-rose-300 font-bold";
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-300 font-bold";
      case "MEDIUM":
        return "bg-amber-100 text-amber-800 border-amber-300 font-semibold";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300 font-medium";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "INVESTIGATING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "IGNORED":
        return "bg-neutral-100 text-neutral-600 border-neutral-200";
      default:
        return "bg-rose-50 text-rose-700 border-rose-200";
    }
  };

  return (
    <div className="space-y-8 w-full max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE2]">
        <div>
          <span className="text-xs font-semibold tracking-[0.2em] text-[#888888] uppercase">
            Site Reliability & Telemetry
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal mt-0.5">
            System Health & Error Monitoring
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Centralized error classification, diagnostic logging, service health checks, and automatic incident recovery.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              fetchHealth();
              fetchErrors();
            }}
            disabled={loading || healthLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-[#EFEAE2] hover:border-[#CCC] text-xs font-serif font-semibold text-[#1E1E1E] transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? "animate-spin" : ""}`} />
            <span>Probe Health</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-[#EFEAE2] hover:border-[#CCC] text-xs font-serif font-semibold text-[#1E1E1E] transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit</span>
          </button>

          <button
            type="button"
            onClick={handlePurgeResolved}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1E1E1E] hover:bg-black text-white text-xs font-serif font-semibold transition-colors shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear Resolved</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4 High-Impact KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-[#EFEAE2] shadow-2xs space-y-1">
          <span className="text-[11px] font-serif font-semibold text-[#888] uppercase tracking-wider block">
            System Status
          </span>
          <div className="flex items-center gap-2 pt-1">
            <span
              className={`w-3 h-3 rounded-full animate-pulse ${
                health?.overall === "healthy"
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : health?.overall === "degraded"
                  ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                  : "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              }`}
            />
            <strong className="text-xl font-serif text-[#1E1E1E] capitalize">
              {health?.overall || "Checking..."}
            </strong>
          </div>
          <span className="text-[11px] text-[#666] block pt-1">
            Uptime: {Math.floor((health?.uptimeSeconds || 0) / 60)} mins • Heap: {health?.memoryUsageMb || 0} MB
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-[#EFEAE2] shadow-2xs space-y-1">
          <span className="text-[11px] font-serif font-semibold text-[#888] uppercase tracking-wider block">
            Unresolved Incidents
          </span>
          <div className="text-2xl font-serif font-bold text-[#E10600] pt-1">
            {kpi.unresolved}
          </div>
          <span className="text-[11px] text-[#666] block">
            {kpi.investigating} currently under investigation
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-[#EFEAE2] shadow-2xs space-y-1">
          <span className="text-[11px] font-serif font-semibold text-[#888] uppercase tracking-wider block">
            Critical & High Severity
          </span>
          <div className="text-2xl font-serif font-bold text-[#1E1E1E] pt-1">
            {kpi.critical + kpi.high}
          </div>
          <span className="text-[11px] text-[#666] block">
            {kpi.critical} Critical • {kpi.high} High
          </span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-[#EFEAE2] shadow-2xs space-y-1">
          <span className="text-[11px] font-serif font-semibold text-[#888] uppercase tracking-wider block">
            Total Occurrences Grouped
          </span>
          <div className="text-2xl font-serif font-bold text-[#1E1E1E] pt-1">
            {kpi.total}
          </div>
          <span className="text-[11px] text-[#059669] font-medium block">
            ✓ {kpi.resolved} successfully resolved
          </span>
        </div>
      </div>

      {/* Live Service Health Grid */}
      <div className="bg-white p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#EFEAE2]">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#E10600]" />
            <h2 className="font-serif text-base font-bold text-[#1E1E1E]">
              Integrated Services Health Matrix
            </h2>
          </div>
          <span className="text-[11px] text-[#888]">
            Probed {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : "Just now"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(health?.services || []).map((service) => (
            <div
              key={service.name}
              className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <strong className="text-xs font-serif font-semibold text-[#1E1E1E] truncate">
                  {service.name}
                </strong>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    service.status === "healthy"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : service.status === "degraded"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}
                >
                  {service.status}
                </span>
              </div>
              <p className="text-[11px] text-[#666] leading-tight font-sans">
                {service.details}
              </p>
              <div className="flex items-center justify-between text-[10px] text-[#888] pt-1 font-mono">
                <span>Latency: {service.latencyMs}ms</span>
                <span>Category: {service.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Error Telemetry Feed */}
      <div className="bg-white rounded-3xl border border-[#EFEAE2] shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#EFEAE2]">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#1E1E1E]">
              Diagnostic Error Telemetry
            </h2>
            <p className="text-xs text-[#666] mt-0.5">
              Live deduplicated event log with stack traces, correlation IDs, and resolution workflows.
            </p>
          </div>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search error message, route..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white"
            />
          </form>
        </div>

        {/* Filter Pills Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-semibold text-[#888] uppercase tracking-wider mr-1">
            Filters:
          </span>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#EFEAE2] bg-[#FAF8F5] text-xs font-medium text-[#1E1E1E] focus:outline-hidden"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
            <option value="LOW">Low Only</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#EFEAE2] bg-[#FAF8F5] text-xs font-medium text-[#1E1E1E] focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            <option value="DATABASE">Database</option>
            <option value="AUTHENTICATION">Authentication</option>
            <option value="PAYMENT_ORDER">Payment & Order</option>
            <option value="CART">Cart Operations</option>
            <option value="IMAGE_UPLOAD">Image Upload</option>
            <option value="SECURITY">Security</option>
            <option value="RUNTIME">Runtime / UI</option>
            <option value="NETWORK">Network</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#EFEAE2] bg-[#FAF8F5] text-xs font-medium text-[#1E1E1E] focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="UNRESOLVED">Unresolved</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        {/* Error Events List */}
        {loading ? (
          <div className="py-16 text-center text-xs text-[#888] flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#E10600]" />
            <span>Loading error telemetry...</span>
          </div>
        ) : errors.length === 0 ? (
          <div className="py-16 text-center space-y-2 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#DDD]">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="font-serif text-sm font-semibold text-[#1E1E1E]">
              Zero active errors matching filter criteria
            </h3>
            <p className="text-xs text-[#888]">
              All systems operating stably within normal production tolerances.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EFEAE2]">
            {errors.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveError(item)}
                className="py-4 px-3 -mx-3 rounded-2xl hover:bg-[#FAF8F5] transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] border ${getSeverityBadge(
                        item.severity
                      )}`}
                    >
                      {item.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-neutral-100 text-neutral-700">
                      {item.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                    {item.occurrenceCount > 1 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E10600]/10 text-[#E10600] border border-[#E10600]/20">
                        {item.occurrenceCount}x grouped
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-[#1E1E1E] font-mono truncate">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-[#888] font-mono flex-wrap">
                    {item.route && <span>Route: {item.route}</span>}
                    {item.endpoint && <span>Endpoint: {item.endpoint}</span>}
                    <span>First: {new Date(item.firstSeen).toLocaleDateString()}</span>
                    <span>Last: {new Date(item.lastSeen).toLocaleTimeString()}</span>
                    <span>ID: {item.requestId}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  <span className="text-xs font-serif font-semibold text-[#E10600] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Error Details Drawer / Modal ── */}
      {activeError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#EFEAE2] shadow-2xl max-w-2xl w-full p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EFEAE2]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs border ${getSeverityBadge(activeError.severity)}`}>
                    {activeError.severity}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-neutral-100 text-neutral-700">
                    {activeError.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(activeError.status)}`}>
                    {activeError.status}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1E1E1E] mt-1">
                  Incident Diagnostics: {activeError.id}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveError(null)}
                className="p-1 rounded-lg text-[#888] hover:text-[#1E1E1E] hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message Box */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#888] block">
                Sanitized Error Message
              </span>
              <p className="text-xs font-mono text-[#1E1E1E] break-all leading-relaxed font-semibold">
                {activeError.message}
              </p>
            </div>

            {/* Diagnostic Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2]">
                <span className="text-[10px] text-[#888] block">HTTP Status</span>
                <strong className="text-[#1E1E1E]">{activeError.statusCode || 500}</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2]">
                <span className="text-[10px] text-[#888] block">Occurrence Count</span>
                <strong className="text-[#1E1E1E]">{activeError.occurrenceCount}x</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2]">
                <span className="text-[10px] text-[#888] block">Correlation Request ID</span>
                <strong className="text-[#1E1E1E] truncate block">{activeError.requestId}</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2]">
                <span className="text-[10px] text-[#888] block">First Detected</span>
                <strong className="text-[#1E1E1E] text-[11px] block">{new Date(activeError.firstSeen).toLocaleString()}</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2]">
                <span className="text-[10px] text-[#888] block">Latest Recurrence</span>
                <strong className="text-[#1E1E1E] text-[11px] block">{new Date(activeError.lastSeen).toLocaleString()}</strong>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2]">
                <span className="text-[10px] text-[#888] block">Environment</span>
                <strong className="text-[#1E1E1E] capitalize">{activeError.environment}</strong>
              </div>
            </div>

            {/* Sanitized Stack Trace if available */}
            {activeError.stack && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888] block">
                  Sanitized Execution Stack Trace
                </span>
                <pre className="p-3.5 rounded-2xl bg-[#1E1E1E] text-neutral-300 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-48 scrollbar-thin">
                  {activeError.stack}
                </pre>
              </div>
            )}

            {/* Investigation & Resolution Notes History */}
            <div className="space-y-2 pt-2 border-t border-[#EFEAE2]">
              <span className="text-xs font-serif font-bold text-[#1E1E1E] block">
                Investigation Audit Trail ({activeError.resolutionNotes?.length || 0})
              </span>

              {activeError.resolutionNotes && activeError.resolutionNotes.length > 0 ? (
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {activeError.resolutionNotes.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2] text-xs space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] text-[#888]">
                        <strong>{n.author}</strong>
                        <span>{new Date(n.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-[#333] font-sans">{n.note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#888]">No investigation notes entered yet.</p>
              )}

              {/* Add Note Input */}
              <form onSubmit={handleAddNote} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add resolution or investigation note..."
                  className="flex-1 text-xs px-3.5 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={actionLoading || !newNote.trim()}
                  className="px-4 py-2 bg-[#1E1E1E] hover:bg-black text-white text-xs font-serif font-semibold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  Save Note
                </button>
              </form>
            </div>

            {/* Admin Resolution Action Buttons */}
            <div className="pt-3 border-t border-[#EFEAE2] flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs text-[#666]">
                Change status:
              </span>

              <div className="flex items-center gap-2">
                {activeError.status !== "RESOLVED" ? (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(activeError.id, "RESOLVED")}
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-serif font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark as Resolved</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(activeError.id, "UNRESOLVED")}
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-serif font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reopen Incident</span>
                  </button>
                )}

                {activeError.status !== "INVESTIGATING" && activeError.status !== "RESOLVED" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(activeError.id, "INVESTIGATING")}
                    disabled={actionLoading}
                    className="px-4 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#EFEAE2] text-[#1E1E1E] text-xs font-serif font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Set Investigating
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
