"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShoppingBag,
  ArrowRight,
  Check,
  Filter,
} from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";
import { AdminNotification } from "@/lib/store/types";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "unread">("all");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Notifications fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.warn("Failed to mark all as read:", err);
    }
  };

  const handleMarkOne = async (id: string) => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.warn("Failed to mark notification:", err);
    }
  };

  const filtered = notifications.filter((n) =>
    filterType === "all" ? true : !n.isRead
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE2]">
        <div>
          <span className="text-xs font-semibold tracking-[0.2em] text-[#888888] uppercase">
            Real-Time Activity Feed
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal mt-0.5">
            Admin Notification Center
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Real-time alerts for incoming bouquet orders, custom commission requests, and low inventory notices.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E1E1E] hover:bg-[#E10600] text-white text-xs font-serif font-semibold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilterType("all")}
          className={`px-4 py-1.5 rounded-full text-xs font-serif font-semibold transition-colors cursor-pointer ${
            filterType === "all"
              ? "bg-[#E10600] text-white"
              : "bg-white border border-[#EFEAE2] text-[#666] hover:text-[#1E1E1E]"
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType("unread")}
          className={`px-4 py-1.5 rounded-full text-xs font-serif font-semibold transition-colors cursor-pointer ${
            filterType === "unread"
              ? "bg-[#E10600] text-white"
              : "bg-white border border-[#EFEAE2] text-[#666] hover:text-[#1E1E1E]"
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-[#EFEAE2] shadow-xs overflow-hidden divide-y divide-[#F2ECE4]">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#888]">Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-[#888] space-y-2">
            <Bell className="w-8 h-8 mx-auto text-[#CCC]" />
            <p className="font-serif text-sm font-semibold text-[#1E1E1E]">No notifications found</p>
            <p className="text-xs text-[#888]">You are completely caught up!</p>
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                !notif.isRead ? "bg-[#FFF9F9]" : "hover:bg-[#FAF8F5]"
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <span
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                    notif.type === "order"
                      ? "bg-emerald-500"
                      : notif.type === "low_stock"
                      ? "bg-amber-500"
                      : "bg-[#E10600]"
                  }`}
                />
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#1E1E1E] leading-snug">
                    {notif.title}
                  </h3>
                  <p className="text-xs text-[#666] mt-0.5 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-[#999] block mt-1">
                    {formatDateTime(notif.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!notif.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkOne(notif.id)}
                    className="p-1.5 rounded-lg border border-[#EFEAE2] hover:bg-[#FAF8F5] text-[#888] hover:text-[#1E1E1E] transition-colors cursor-pointer text-[10px]"
                    title="Mark as read"
                  >
                    Mark Read
                  </button>
                )}

                <Link
                  href={notif.link || "/admin"}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] hover:border-[#E10600] text-xs font-serif font-semibold text-[#1E1E1E] hover:text-[#E10600] transition-colors"
                >
                  <span>Inspect</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
