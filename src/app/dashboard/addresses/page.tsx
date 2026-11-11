"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2, Edit2, Check } from "lucide-react";

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

const INITIAL_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    name: "Priya Sharma (Home)",
    phone: "+91 98765 43210",
    address: "42 Lily Lane, Koramangala 4th Block",
    city: "Bangalore",
    pincode: "560034",
    isDefault: true,
  },
  {
    id: "addr-2",
    name: "Priya Sharma (Office)",
    phone: "+91 98765 43210",
    address: "Prestige Tech Park, Marathahalli-Sarjapur Ring Rd",
    city: "Bangalore",
    pincode: "560103",
    isDefault: false,
  },
];

export default function SavedAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;
    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      name,
      phone,
      address,
      city: "Bangalore",
      pincode: pincode || "560001",
      isDefault: false,
    };
    setAddresses([...addresses, newAddr]);
    setShowAddForm(false);
    setName("");
    setPhone("");
    setAddress("");
    setPincode("");
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses(
      addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-[0.2em] text-[#888888] uppercase">
            Address Book
          </span>
          <h1 className="font-serif text-3xl text-[#2A2A2A] mt-1">
            Saved Addresses
          </h1>
          <p className="text-xs text-[#666666] mt-1">
            Manage your recipient destinations for swift bouquet and gift delivery requests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--charcoal)] hover:bg-[var(--signal-red)] text-white px-5 py-2.5 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Add Address Form Modal / Expandable */}
      {showAddForm && (
        <form
          onSubmit={handleAddAddress}
          className="p-6 rounded-2xl border border-[#C0C0C0] bg-[var(--canvas-warm)] space-y-4 animate-fade-in-up"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#2A2A2A]">
            Add Destination Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                Recipient Label / Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Mehta (Residence)"
                className="w-full text-xs p-2.5 bg-white border border-[#C0C0C0] rounded-lg focus:outline-none focus:border-[#2A2A2A]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-xs p-2.5 bg-white border border-[#C0C0C0] rounded-lg focus:outline-none focus:border-[#2A2A2A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#666666] mb-1">
              Complete Address *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Door No, Building, Street, Area"
              className="w-full text-xs p-2.5 bg-white border border-[#C0C0C0] rounded-lg focus:outline-none focus:border-[#2A2A2A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                City
              </label>
              <input
                type="text"
                disabled
                value="Coimbatore"
                className="w-full text-xs p-2.5 bg-zinc-100 border border-[#C0C0C0] rounded-lg text-[#666666]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#666666] mb-1">
                Pincode
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="560034"
                className="w-full text-xs p-2.5 bg-white border border-[#C0C0C0] rounded-lg focus:outline-none focus:border-[#2A2A2A]"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs text-[#666666] hover:text-[#2A2A2A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[var(--charcoal)] text-white text-xs font-semibold hover:bg-[var(--signal-red)] transition-colors"
            >
              Save Address
            </button>
          </div>
        </form>
      )}

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`p-5 rounded-2xl border transition-all ${
              addr.isDefault
                ? "border-[#2A2A2A] bg-zinc-50/50 shadow-xs"
                : "border-[var(--border-subtle)] bg-white hover:border-[#C0C0C0]"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--signal-red)]" />
                <h3 className="font-semibold text-sm text-[#2A2A2A]">
                  {addr.name}
                </h3>
              </div>
              {addr.isDefault && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#2A2A2A] text-white px-2 py-0.5 rounded-full">
                  Default
                </span>
              )}
            </div>

            <p className="text-xs text-[#666666] leading-relaxed mb-3">
              {addr.address}, {addr.city} - {addr.pincode}
            </p>

            {addr.phone && (
              <p className="text-xs text-[#888888] mb-4">Phone: {addr.phone}</p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-xs">
              {!addr.isDefault && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(addr.id)}
                  className="text-xs text-[#666666] hover:text-[#2A2A2A] underline cursor-pointer"
                >
                  Set as default
                </button>
              )}
              {addr.isDefault && <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Primary Delivery</span>}

              <button
                type="button"
                onClick={() => handleDelete(addr.id)}
                className="text-red-600 hover:text-red-700 p-1 transition-colors ml-auto cursor-pointer"
                aria-label="Delete address"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
