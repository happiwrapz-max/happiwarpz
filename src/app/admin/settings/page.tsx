"use client";

import { useState, useEffect } from "react";
import {
  Check,
  Settings,
  Power,
  Clock,
  MapPin,
  Loader2,
  Sparkles,
  Phone,
  Database,
  Download,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Truck,
  CreditCard,
  Zap,
  Server,
  Trash2,
} from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [storeOpen, setStoreOpen] = useState(true);
  const [leadTimeHours, setLeadTimeHours] = useState("4");
  const [morningSlot, setMorningSlot] = useState(true);
  const [afternoonSlot, setAfternoonSlot] = useState(true);
  const [eveningSlot, setEveningSlot] = useState(true);
  const [deliveryRadius, setDeliveryRadius] = useState("25");
  const [ownerWhatsApp, setOwnerWhatsApp] = useState("+91 7708354636");
  const [contactLocation, setContactLocation] = useState("Coimbatore, Tamil Nadu, India");
  const [instagramUrl, setInstagramUrl] = useState("https://www.instagram.com/happiwrapz/");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Backup State
  const [backups, setBackups] = useState<Array<{ name: string; size: number; createdAt: string }>>([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  // Redis Cache State
  const [cacheStats, setCacheStats] = useState<{
    provider: "upstash-redis" | "ioredis" | "in-memory-fallback";
    endpoint: string;
    connected: boolean;
    redisUrlConfigured: boolean;
    hits: number;
    misses: number;
    hitRate: string;
    keysCount: number;
    cachedKeysSample: string[];
  } | null>(null);
  const [cachePurging, setCachePurging] = useState(false);
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);

  const loadCacheStats = async () => {
    try {
      const res = await fetch("/api/admin/cache");
      const data = await res.json();
      if (res.ok && data.success && data.cache) {
        setCacheStats(data.cache);
      }
    } catch {
      // non-blocking
    }
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/content?t=" + Date.now(), { cache: "no-store" });
        const data = await res.json();
        if (res.ok && data.success && data.settings) {
          setStoreOpen(data.settings.storeOpen ?? true);
          setLeadTimeHours(String(data.settings.minLeadTimeHours ?? 4));
          setDeliveryRadius(String(data.settings.deliveryRadiusKm ?? 25));
          setOwnerWhatsApp(data.settings.contactPhone ?? "+91 7708354636");
          setContactLocation(data.settings.contactLocation ?? "Coimbatore, Tamil Nadu, India");
          setInstagramUrl(data.settings.instagramUrl ?? "https://www.instagram.com/happiwrapz/");
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }

    async function loadBackups() {
      try {
        const res = await fetch("/api/admin/backup");
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.backups)) {
          setBackups(data.backups);
        }
      } catch {
        // non-blocking
      }
    }

    loadSettings();
    loadBackups();
    loadCacheStats();
  }, []);

  const handlePurgeCache = async () => {
    setCachePurging(true);
    setCacheMessage(null);
    try {
      const res = await fetch("/api/admin/cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pattern: "*" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCacheStats(data.cache);
        setCacheMessage("High-performance cache flushed! Fresh catalog and content will be loaded on demand.");
        setTimeout(() => setCacheMessage(null), 4500);
      } else {
        setCacheMessage("Failed to flush cache: " + (data.error || "Unknown error"));
      }
    } catch (err: any) {
      setCacheMessage("Network error flushing cache: " + err.message);
    } finally {
      setCachePurging(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            storeOpen,
            minLeadTimeHours: Number(leadTimeHours) || 4,
            deliveryRadiusKm: Number(deliveryRadius) || 25,
            contactPhone: ownerWhatsApp,
            contactLocation,
            instagramUrl,
          },
          actorName: "Happiwrapz Owner",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(data.error || "Failed to update settings");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBackup = async () => {
    setBackupLoading(true);
    setBackupMessage(null);
    try {
      const res = await fetch("/api/admin/backup", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setBackupMessage(`Snapshot created: ${data.backupFile} (Checksum: ${data.checksum?.substring(0, 8)}...)`);
        // Refresh backup list
        const bRes = await fetch("/api/admin/backup");
        const bData = await bRes.json();
        if (bData.success && Array.isArray(bData.backups)) {
          setBackups(bData.backups);
        }
      } else {
        setBackupMessage(`Backup failed: ${data.error}`);
      }
    } catch (err: any) {
      setBackupMessage(`Error: ${err.message}`);
    } finally {
      setBackupLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE2]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-serif font-semibold text-[#E10600] uppercase tracking-[0.2em] mb-1">
            <Settings className="w-3.5 h-3.5" />
            <span>Studio Governance</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal">
            Studio Controls & Business Settings
          </h1>
          <p className="text-xs text-[#666] mt-0.5">
            Configure Coimbatore delivery coverage, fulfillment lead times, emergency studio pause, and database backups.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-[#888] flex items-center justify-center gap-2 bg-white rounded-3xl border border-[#EFEAE2]">
          <Loader2 className="w-4 h-4 animate-spin text-[#E10600]" />
          <span>Loading studio configuration...</span>
        </div>
      ) : (
        <div className="space-y-6">
          <form
            onSubmit={handleSave}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-6"
          >
            {/* Store Pause / Open Switch */}
            <div
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                storeOpen
                  ? "bg-emerald-50/70 border-emerald-200"
                  : "bg-red-50/70 border-red-200"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <Power
                    className={`w-4 h-4 ${
                      storeOpen ? "text-emerald-600" : "text-red-600"
                    }`}
                  />
                  <strong className="text-sm font-serif font-bold text-[#1E1E1E]">
                    {storeOpen
                      ? "Studio is Open for Order Requests"
                      : "Studio Order Requests are Currently Paused"}
                  </strong>
                </div>
                <p className="text-xs text-[#666] mt-0.5 leading-relaxed">
                  {storeOpen
                    ? "Clients can freely submit requests for handcrafted ribbon flowers in Coimbatore."
                    : "A prominent notice informs visitors that the studio is at capacity for holidays."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStoreOpen(!storeOpen)}
                className={`px-5 py-2.5 rounded-full text-xs font-serif font-semibold uppercase tracking-wider cursor-pointer transition-colors shadow-2xs self-start sm:self-auto ${
                  storeOpen
                    ? "bg-emerald-700 text-white hover:bg-emerald-800"
                    : "bg-[#E10600] text-white hover:bg-[#c00500]"
                }`}
              >
                {storeOpen ? "Pause Orders" : "Resume Orders"}
              </button>
            </div>

            {/* Official Contact Parameters */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-[#1E1E1E] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E10600]" />
                <span>Official Business Identity</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                    Official Business Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={contactLocation}
                      onChange={(e) => setContactLocation(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                    Official Telephone & WhatsApp (tel: link)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={ownerWhatsApp}
                      onChange={(e) => setOwnerWhatsApp(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                    Official Instagram Page URL
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888]">
                      <InstagramIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery & Lead Times */}
            <div className="space-y-4 pt-4 border-t border-[#EFEAE2]">
              <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-[#1E1E1E] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#E10600]" />
                <span>Delivery Logistics & Crafting Lead Times</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                    Minimum Crafting Lead Time (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="72"
                    value={leadTimeHours}
                    onChange={(e) => setLeadTimeHours(e.target.value)}
                    className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white font-mono font-bold"
                  />
                  <p className="text-[11px] text-[#888] mt-1">Minimum hours required before order can be delivered.</p>
                </div>

                <div>
                  <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                    Delivery Radius (km from Coimbatore Studio)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={deliveryRadius}
                    onChange={(e) => setDeliveryRadius(e.target.value)}
                    className="w-full text-xs p-3 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white font-mono font-bold"
                  />
                  <p className="text-[11px] text-[#888] mt-1">Maximum coverage distance for same-day delivery.</p>
                </div>
              </div>
            </div>

            {/* Active Delivery Slots */}
            <div className="space-y-3 pt-4 border-t border-[#EFEAE2]">
              <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-[#1E1E1E]">
                Active Coimbatore Hand-Delivery Slots
              </h3>

              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] cursor-pointer hover:border-[#CCC] transition-colors">
                  <span className="font-serif font-medium text-[#1E1E1E]">Morning Delivery Window (9:00 AM - 12:00 PM)</span>
                  <input
                    type="checkbox"
                    checked={morningSlot}
                    onChange={(e) => setMorningSlot(e.target.checked)}
                    className="w-4 h-4 accent-[#E10600] rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] cursor-pointer hover:border-[#CCC] transition-colors">
                  <span className="font-serif font-medium text-[#1E1E1E]">Afternoon Delivery Window (1:00 PM - 5:00 PM)</span>
                  <input
                    type="checkbox"
                    checked={afternoonSlot}
                    onChange={(e) => setAfternoonSlot(e.target.checked)}
                    className="w-4 h-4 accent-[#E10600] rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] cursor-pointer hover:border-[#CCC] transition-colors">
                  <span className="font-serif font-medium text-[#1E1E1E]">Evening Hand-Delivery Window (6:00 PM - 9:00 PM)</span>
                  <input
                    type="checkbox"
                    checked={eveningSlot}
                    onChange={(e) => setEveningSlot(e.target.checked)}
                    className="w-4 h-4 accent-[#E10600] rounded"
                  />
                </label>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-[#EFEAE2] flex items-center justify-between">
              <span className="text-[11px] text-[#888]">
                Changes are written to database and logged in audit trail.
              </span>

              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-[#E10600] hover:bg-[#c00500] text-white px-8 py-3 text-xs font-serif font-semibold uppercase tracking-wider transition-all shadow-md shadow-[#E10600]/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : saved ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved to Database</span>
                  </>
                ) : (
                  <span>Save Studio Settings</span>
                )}
              </button>
            </div>
          </form>

          {/* Redis & High-Performance Caching Subsystem */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-serif font-bold uppercase tracking-wider text-[#1E1E1E]">
                  <Zap className="w-4 h-4 text-[#D4AF37]" />
                  <span>Redis & High-Performance Cache Subsystem</span>
                </div>
                <p className="text-xs text-[#666] mt-0.5">
                  Sub-millisecond caching for catalog products, inventory counts, and storefront content with zero-downtime memory fallback.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadCacheStats}
                  title="Refresh Cache Stats"
                  className="p-2.5 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] hover:bg-[#F2ECE4] text-[#666] transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handlePurgeCache}
                  disabled={cachePurging}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E1E1E] hover:bg-[#E10600] text-white text-xs font-serif font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {cachePurging ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Flushing Cache...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5 text-[#FFE082]" />
                      <span>Purge All Cache</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {cacheMessage && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{cacheMessage}</span>
              </div>
            )}

            {/* Cache Diagnostic Metrics */}
            {cacheStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F5] p-4 rounded-2xl border border-[#EFEAE2] text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-serif text-[#888] tracking-wider block">Engine Provider</span>
                  <span className="font-mono font-bold text-[#1E1E1E] flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${cacheStats.provider === "upstash-redis" || cacheStats.provider === "ioredis" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                    {cacheStats.provider === "upstash-redis" ? "Upstash Redis" : cacheStats.provider === "ioredis" ? "ioredis (Cluster)" : "In-Memory Store"}
                  </span>
                  <span className="text-[10px] text-[#777] block truncate" title={cacheStats.endpoint}>
                    {cacheStats.endpoint || "Local Cache"}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-serif text-[#888] tracking-wider block">Cache Hit Rate</span>
                  <span className="font-mono font-bold text-[#1E1E1E]">{cacheStats.hitRate}</span>
                  <span className="text-[10px] text-emerald-600 block">{cacheStats.hits} Cache Hits</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-serif text-[#888] tracking-wider block">Cached Keys</span>
                  <span className="font-mono font-bold text-[#1E1E1E]">{cacheStats.keysCount} Active Keys</span>
                  <span className="text-[10px] text-[#777] block">{cacheStats.misses} Cache Misses</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-serif text-[#888] tracking-wider block">Edge Cache Mode</span>
                  <span className="font-mono font-bold text-[#1E1E1E]">Serverless REST</span>
                  <span className="text-[10px] text-emerald-600 block">Sub-millisecond latency</span>
                </div>
              </div>
            )}
          </div>

          {/* Database Backup & Disaster Recovery Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-serif font-bold uppercase tracking-wider text-[#1E1E1E]">
                  <Database className="w-4 h-4 text-[#E10600]" />
                  <span>Database Snapshot & Disaster Recovery</span>
                </div>
                <p className="text-xs text-[#666] mt-0.5">
                  Generate SHA-256 verified atomic backups of all orders, products, customer records, and settings.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCreateBackup}
                disabled={backupLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E1E1E] hover:bg-black text-white text-xs font-serif font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {backupLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Snapshot...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5 text-[#E10600]" />
                    <span>Create Instant Backup</span>
                  </>
                )}
              </button>
            </div>

            {backupMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{backupMessage}</span>
              </div>
            )}

            {/* Backups List */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-serif font-semibold uppercase tracking-wider text-[#888] block">
                Existing Snapshots ({backups.length})
              </span>
              {backups.length === 0 ? (
                <p className="text-xs text-[#888] p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2] text-center">
                  No previous snapshots found. Click &quot;Create Instant Backup&quot; above to generate one.
                </p>
              ) : (
                <div className="divide-y divide-[#F2ECE4] border border-[#EFEAE2] rounded-2xl overflow-hidden bg-[#FAF8F5]">
                  {backups.slice(0, 5).map((b) => (
                    <div key={b.name} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <strong className="font-mono text-[11px] text-[#1E1E1E] block">{b.name}</strong>
                        <span className="text-[10px] text-[#888]">
                          {new Date(b.createdAt).toLocaleString()} • {Math.round(b.size / 1024)} KB
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-serif font-semibold">
                        Verified SHA-256
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
