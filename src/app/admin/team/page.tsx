"use client";

import { useState, useEffect } from "react";
import { User } from "@/lib/store/types";
import {
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Trash2,
  Key,
  Check,
  Loader2,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export default function AdminTeamPage() {
  const [team, setTeam] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New staff provisioning state
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<User["role"]>("manager");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Admin password reset modal state
  const [pwdModalUser, setPwdModalUser] = useState<User | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState("");
  const [showResetPasswordVal, setShowResetPasswordVal] = useState(false);
  const [updatingPwd, setUpdatingPwd] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

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
    setTimeout(() => setFeedback(null), 3500);
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    const special = "#$@!";
    let res = "";
    for (let i = 0; i < 7; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    res += special.charAt(Math.floor(Math.random() * special.length));
    res += Math.floor(100 + Math.random() * 900);
    return res;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) return;

    if (newPassword && newPassword.length < 6) {
      alert("Password must be at least 6 characters in length.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          role: newRole,
          password: newPassword.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewName("");
        setNewEmail("");
        setNewPassword("");
        showToast(
          `Staff account for ${data.user.name} created successfully${
            newPassword ? " with admin password set" : ""
          }.`
        );
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

  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdModalUser) return;
    if (resetPasswordVal.trim().length < 6) {
      setPwdError("Security password must be at least 6 characters in length.");
      return;
    }

    setUpdatingPwd(true);
    setPwdError(null);
    try {
      const res = await fetch(`/api/admin/users/${pwdModalUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: resetPasswordVal.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Security password for ${pwdModalUser.name} updated successfully.`);
        setPwdModalUser(null);
        setResetPasswordVal("");
        await loadTeam();
      } else {
        setPwdError(data.error || "Failed to update staff password.");
      }
    } catch (err: any) {
      setPwdError(err.message || "Failed to reach server.");
    } finally {
      setUpdatingPwd(false);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-[0.2em] text-[#888888] uppercase">
            Access Governance & Security
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1E1E] font-normal mt-0.5">
            Team Roles & Access Control
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Multi-tier Role-Based Access Control (RBAC). Admin sets staff passwords; team members cannot alter credentials.
          </p>
        </div>

        {feedback && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-full font-semibold shadow-xs animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            {feedback}
          </div>
        )}
      </div>

      {/* Security Governance Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <strong className="font-semibold block">Store Administrator Password Policy Active</strong>
          <p className="text-[11.5px] text-amber-800/90 leading-relaxed font-sans">
            Only the Store Administrator/Owner can create or change team passwords. Self-service password modification by staff members is strictly prohibited to preserve atelier order and catalog governance.
          </p>
        </div>
      </div>

      {/* Role Definitions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#EFEAE2] shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E10600]" />
            <strong className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider">
              Owner / Super Admin
            </strong>
          </div>
          <p className="text-xs text-[#666666] leading-relaxed">
            Unrestricted administrative privileges: financial analytics, quotation authorization, team password provisioning, and content publishing.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#EFEAE2] shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <strong className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider">
              Store Manager
            </strong>
          </div>
          <p className="text-xs text-[#666666] leading-relaxed">
            Full catalog CRUD, inventory balance adjustments, promotional coupons, customer drawer access, and quotation drafting.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#EFEAE2] shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <strong className="text-xs font-bold text-[#1E1E1E] uppercase tracking-wider">
              Fulfillment Staff
            </strong>
          </div>
          <p className="text-xs text-[#666666] leading-relaxed">
            Order workflow transitions (Preparing, Out for Delivery, Delivered), packing slip printing, and custom ribbon assembly tracking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Add Staff Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EFEAE2]">
            <UserPlus className="w-4 h-4 text-[#E10600]" />
            <h2 className="font-serif text-base font-bold text-[#1E1E1E]">
              Provision Staff Account
            </h2>
          </div>

          <form onSubmit={handleAdd} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Kavita Nair"
                className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                Store Email Address
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="staff@happiwrapz.in"
                className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1">
                Designated Staff Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full text-xs px-3.5 py-2.5 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] font-medium focus:outline-hidden focus:border-[#E10600] focus:bg-white"
              >
                <option value="manager">Store Manager (Catalog & Quotes)</option>
                <option value="fulfillment">Fulfillment Studio (Lifecycle & Delivery)</option>
              </select>
            </div>

            {/* Password Creation Field (Admin sets it) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider">
                  Staff Password / Passcode
                </label>
                <button
                  type="button"
                  onClick={() => setNewPassword(generateRandomPassword())}
                  className="text-[10px] text-[#E10600] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Generate</span>
                </button>
              </div>

              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Set staff passcode (min 6 chars)"
                  className="w-full pl-9 pr-9 py-2.5 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] font-mono focus:outline-hidden focus:border-[#E10600] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#1E1E1E]"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-[#888] leading-tight">
                🔒 Staff cannot change this password; only Admin can update it later.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-2 py-3 rounded-full bg-[#1E1E1E] hover:bg-[#E10600] text-white text-xs font-serif font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Provision Staff Account</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Active Staff Personnel Directory */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EFEAE2] shadow-xs overflow-hidden">
          <div className="p-4 bg-[#FAF8F5] border-b border-[#EFEAE2] flex items-center justify-between">
            <span className="text-xs font-serif font-bold text-[#1E1E1E] uppercase tracking-wider">
              Active Authorized Personnel ({staffList.length})
            </span>
            <span className="text-[11px] text-[#888888]">
              Admin-managed credentials
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-[#888888] flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#E10600]" />
              Loading authorized staff directory...
            </div>
          ) : (
            <div className="divide-y divide-[#EFEAE2]">
              {staffList.map((member) => (
                <div
                  key={member.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF8F5]/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#1E1E1E] text-white font-serif font-bold flex items-center justify-center text-sm shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm text-[#1E1E1E] truncate">{member.name}</strong>
                        {member.role === "owner" && (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-[#E10600] font-bold text-[10px]">
                            SUPER ADMIN
                          </span>
                        )}
                        {member.hasPassword ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Lock className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Password Protected</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Key className="w-2.5 h-2.5 text-amber-600" />
                            <span>No Password Set</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#888888] font-mono truncate block">{member.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0 flex-wrap">
                    {/* Role Dropdown */}
                    <select
                      value={member.role}
                      disabled={member.role === "owner"}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as any)}
                      className="text-xs px-3 py-1.5 rounded-xl border border-[#C0C0C0] bg-white font-semibold text-[#1E1E1E] focus:outline-hidden disabled:bg-zinc-100 disabled:cursor-not-allowed"
                    >
                      <option value="owner">Owner / Super Admin</option>
                      <option value="manager">Store Manager</option>
                      <option value="fulfillment">Fulfillment Studio</option>
                    </select>

                    {/* Admin Set / Change Password Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setPwdModalUser(member);
                        setResetPasswordVal("");
                        setPwdError(null);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-[#C0C0C0] bg-white hover:bg-neutral-50 text-xs font-serif font-semibold text-[#1E1E1E] inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="Set or reset security password"
                    >
                      <Key className="w-3.5 h-3.5 text-[#E10600]" />
                      <span>{member.hasPassword ? "Change Pass" : "Set Pass"}</span>
                    </button>

                    {/* Delete User Button */}
                    {member.role !== "owner" && (
                      <button
                        type="button"
                        onClick={() => handleDelete(member.id, member.name)}
                        className="text-[#888888] hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
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

      {/* ── Admin Password Reset Modal ── */}
      {pwdModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#EFEAE2] shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EFEAE2]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#E10600]/10 border border-[#E10600]/20 flex items-center justify-center text-[#E10600]">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#1E1E1E]">
                    Set Staff Password
                  </h3>
                  <p className="text-xs text-[#666]">
                    Admin security override for <strong>{pwdModalUser.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPwdModalUser(null)}
                className="p-1 rounded-lg text-[#888] hover:text-[#1E1E1E] hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Security Policy Reminder */}
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] text-[11px] text-[#666] leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E10600] shrink-0 mt-0.5" />
              <span>
                <strong>Admin Exclusive Control:</strong> Team members are locked from changing this password. Only you as Store Admin can reset or modify their access credentials.
              </span>
            </div>

            {pwdError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}

            {/* Password Form */}
            <form onSubmit={handleAdminResetPassword} className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-serif font-semibold text-[#1E1E1E] uppercase tracking-wider block">
                    New Security Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setResetPasswordVal(generateRandomPassword())}
                    className="text-[11px] text-[#E10600] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Generate Strong Passcode</span>
                  </button>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-[#888] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showResetPasswordVal ? "text" : "password"}
                    required
                    value={resetPasswordVal}
                    onChange={(e) => setResetPasswordVal(e.target.value)}
                    placeholder="Enter new staff password (min 6 chars)"
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] font-mono focus:outline-hidden focus:border-[#E10600] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPasswordVal(!showResetPasswordVal)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#1E1E1E]"
                  >
                    {showResetPasswordVal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPwdModalUser(null)}
                  className="px-4 py-2.5 rounded-full border border-[#EFEAE2] text-xs font-serif font-semibold text-[#666] hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPwd}
                  className="px-6 py-2.5 rounded-full bg-[#E10600] hover:bg-[#c00500] text-white text-xs font-serif font-semibold uppercase tracking-wider transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {updatingPwd ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Password...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Update Staff Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
