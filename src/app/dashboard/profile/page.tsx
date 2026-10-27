"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { User, Mail, Phone, Bell, Shield, Check } from "lucide-react";

export default function CustomerProfilePage() {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || "Priya Sharma");
  const [email, setEmail] = useState(user?.email || "priya@example.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <span className="text-xs font-semibold tracking-[0.2em] text-[#E10600] uppercase font-serif">
          Account Settings
        </span>
        <h1 className="font-serif text-3xl text-[#1E1E1E] mt-1">
          Profile & Preferences
        </h1>
        <p className="text-xs text-[#666] mt-1">
          Update your contact details and WhatsApp notification preferences for order confirmations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5 font-serif">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-xs bg-white border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5 font-serif">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-xs bg-white border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1E1E1E] uppercase tracking-wider mb-1.5 font-serif">
            WhatsApp Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-xs bg-white border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:ring-1 focus:ring-[#E10600]"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE2] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E1E1E] font-serif">
            <Bell className="w-4 h-4 text-[#E10600]" />
            <span>Notification Preferences</span>
          </div>
          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 text-[#666] cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="rounded text-[#E10600] accent-[#E10600]"
              />
              <span>Receive real-time WhatsApp updates when owner confirms request</span>
            </label>
            <label className="flex items-center gap-2 text-[#666] cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="rounded text-[#E10600] accent-[#E10600]"
              />
              <span>Delivery photo dispatched upon arrival</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-full bg-[#1E1E1E] hover:bg-[#E10600] text-white px-8 py-3 text-xs font-serif uppercase tracking-wider font-semibold transition-all duration-300 shadow-xs flex items-center gap-2 cursor-pointer"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Saved Successfully</span>
            </>
          ) : (
            <span>Save Preferences</span>
          )}
        </button>
      </form>
    </div>
  );
}
