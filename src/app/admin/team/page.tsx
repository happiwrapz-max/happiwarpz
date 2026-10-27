"use client";

import { useState, useEffect } from "react";
import { User } from "@/lib/store/types";
import { ShieldCheck, ShieldAlert, UserPlus, Trash2, Key, Check, Loader2, Sparkles } from "lucide-react";

export default function AdminTeamPage() {
  const [team, setTeam] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<User["role"]>("manager");

  const loadTeam = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && data.success) {
        setTeam(data.users);
      }
    } catch (err) {
      console.error("Failed to fetch team:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          role: newRole,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewName("");
        setNewEmail("");
        showToast(`Staff account for ${data.user.name} created successfully.`);
        await loadTeam();
      } else {
        alert(data.error || "Failed to add team member");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while adding team member");
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, newR: User["role"]) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newR }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTeam((prev) =>
          prev.map((m) => (m.id === userId ? { ...m, role: newR } : m))
        );
        showToast("Role permission updated and recorded in audit log.");
      } else {
        alert(data.error || "Failed to update role");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while updating role");
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from admin access?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTeam((prev) => prev.filter((m) => m.id !== userId));
        showToast(`${name} was removed from the team.`);
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while deleting user");
    }
  };

  const staffList = team.filter((u) => u.role !== "customer");

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-[0.2em] text-[#888888] uppercase">
            Access Governance & Security
          </span>
          <h1 className="font-serif text-3xl text-[#2A2A2A] mt-1">
            Team Roles & Access Control
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Multi-tier Role-Based Access Control (RBAC) across Super Admin, Store Manager, and Fulfillment Studio staff.
          </p>
        </div>

        {feedback && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-full font-semibold shadow-xs">
            <Check className="w-4 h-4 text-emerald-600" />
            {feedback}
          </div>
        )}
      </div>

      {/* Role Definitions Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[var(--border-subtle)] shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--signal-red)]" />
            <strong className="text-xs font-bold text-[#2A2A2A] uppercase tracking-wider">Owner / Super Admin</strong>
          </div>
          <p className="text-xs text-[#666666] leading-relaxed">
            Unrestricted administrative privileges: financial analytics, quotation authorization, team governance, and content publishing.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[var(--border-subtle)] shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <strong className="text-xs font-bold text-[#2A2A2A] uppercase tracking-wider">Store Manager</strong>
          </div>
          <p className="text-xs text-[#666666] leading-relaxed">
            Full catalog CRUD, inventory balance adjustments, promotional coupons, customer drawer access, and quotation drafting.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[var(--border-subtle)] shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <strong className="text-xs font-bold text-[#2A2A2A] uppercase tracking-wider">Fulfillment Staff</strong>
          </div>
          <p className="text-xs text-[#666666] leading-relaxed">
            Order workflow transitions (Preparing, Out for Delivery, Delivered), packing slip printing, and custom ribbon assembly tracking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Add Staff Form */}
        <div className="bg-white p-6 rounded-3xl border border-[var(--border-subtle)] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[var(--signal-red)]" />
            <h2 className="font-serif text-base text-[#2A2A2A]">
              Provision Staff Account
            </h2>
          </div>

          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Kavita Nair"
                className="w-full text-xs p-2.5 bg-white border border-[#C0C0C0] rounded-xl text-[#2A2A2A] focus:outline-none focus:border-[#2A2A2A]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                Atelier Email
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="staff@happiwrapz.in"
                className="w-full text-xs p-2.5 bg-white border border-[#C0C0C0] rounded-xl text-[#2A2A2A] focus:outline-none focus:border-[#2A2A2A]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                Designated Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full text-xs p-2.5 bg-white border border-[#C0C0C0] rounded-xl text-[#2A2A2A] focus:outline-none focus:border-[#2A2A2A]"
              >
                <option value="manager">Store Manager (Catalog & Quotes)</option>
                <option value="fulfillment">Fulfillment Studio (Lifecycle & Delivery)</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-full bg-[var(--charcoal)] hover:bg-[var(--signal-red)] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              Provision Access
            </button>
          </form>
        </div>

        {/* Existing Team Members */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-[var(--border-subtle)] shadow-xs overflow-hidden">
          <div className="p-4 bg-[var(--canvas-warm)] border-b border-[var(--border-subtle)] flex items-center justify-between">
            <span className="text-xs font-bold text-[#2A2A2A] uppercase tracking-wider">
              Active Authorized Personnel ({staffList.length})
            </span>
            <span className="text-[11px] text-[#888888]">
              Role modifications take effect immediately
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-[#888888] flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--signal-red)]" />
              Loading authorized staff directory...
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {staffList.map((member) => (
                <div
                  key={member.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--charcoal)] text-white font-bold flex items-center justify-center text-sm shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-[#2A2A2A]">{member.name}</strong>
                        {member.role === "owner" && (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-[var(--signal-red)] font-bold text-[10px]">
                            SUPER ADMIN
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#888888] font-mono">{member.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <select
                      value={member.role}
                      disabled={member.role === "owner"}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                      className="text-xs px-3 py-1.5 rounded-xl border border-[#C0C0C0] bg-white font-semibold text-[#2A2A2A] focus:outline-none disabled:bg-zinc-100 disabled:cursor-not-allowed"
                    >
                      <option value="owner">Owner / Super Admin</option>
                      <option value="manager">Store Manager</option>
                      <option value="fulfillment">Fulfillment Studio</option>
                    </select>

                    {member.role !== "owner" && (
                      <button
                        type="button"
                        onClick={() => handleDelete(member.id, member.name)}
                        className="text-[#888888] hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Revoke access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
