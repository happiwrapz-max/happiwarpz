"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  X,
  Search,
  Check,
  Loader2,
  ExternalLink,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { CLOUDINARY_STUDIO_ASSETS, CloudinaryAsset } from "@/lib/data/cloudinaryAssets";

interface CloudinaryMediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
  selectedUrl?: string;
}

export default function CloudinaryMediaSelectorModal({
  isOpen,
  onClose,
  onSelect,
  title = "Select Image from Cloudinary Cloud Library",
  selectedUrl,
}: CloudinaryMediaSelectorModalProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState("");
  const [customAssets, setCustomAssets] = useState<CloudinaryAsset[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const allAssets = [...customAssets, ...CLOUDINARY_STUDIO_ASSETS];

  const filteredAssets = allAssets.filter((asset) => {
    const matchesTab = activeTab === "all" || asset.category === activeTab;
    const matchesSearch =
      asset.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image to Cloudinary.");
      }

      const newAsset: CloudinaryAsset = {
        id: `uploaded-${Date.now()}`,
        label: file.name.replace(/\.[^/.]+$/, ""),
        category: "bouquets",
        url: data.url,
        tag: "Uploaded",
      };

      setCustomAssets((prev) => [newAsset, ...prev]);
      onSelect(data.url);
      onClose();
    } catch (err: any) {
      console.error("Cloudinary upload failed:", err);
      setUploadError(err.message || "Failed to upload to Cloudinary.");
    } finally {
      setUploading(false);
    }
  };

  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) return;
    onSelect(customUrl.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-[#D4AF37]/30 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#EFEAE2] flex items-center justify-between bg-[#FDFBF7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#722F37]/10 flex items-center justify-center text-[#722F37]">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">{title}</h3>
              <p className="text-xs text-[#8A7E72]">
                Stored directly in Cloudinary Cloud Space (res.cloudinary.com/w8fw2mbb) • Zero DB Bloat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filter Tabs */}
        <div className="p-4 border-b border-[#EFEAE2] bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All Assets" },
              { id: "bouquets", label: "Bouquets" },
              { id: "glitter", label: "Glitter Roses" },
              { id: "boxes", label: "Keepsake Boxes" },
              { id: "hampers", label: "Hampers" },
              { id: "wraps", label: "Wraps" },
              { id: "banners", label: "Banners" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-[#722F37] text-white shadow-sm"
                    : "bg-[#FDFBF7] text-[#8A7E72] hover:bg-[#F2ECE4] hover:text-[#1A1A1A]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#FDFBF7] border border-[#EFEAE2] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#722F37]"
            />
          </div>
        </div>

        {/* Main Body (Grid of Cloudinary Assets + Direct Upload Dropzone) */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FAF7F2] space-y-6">
          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#D4AF37]/50 hover:border-[#722F37] bg-white rounded-2xl p-6 text-center cursor-pointer transition group hover:shadow-md"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f);
              }}
            />
            {uploading ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#722F37]" />
                <p className="text-xs font-medium text-[#722F37]">Uploading directly to Cloudinary cloud...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F2] group-hover:bg-[#722F37]/10 flex items-center justify-center transition">
                  <UploadCloud className="w-5 h-5 text-[#8A7E72] group-hover:text-[#722F37]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#1A1A1A] group-hover:text-[#722F37]">
                    Click or Drag to Upload New Image to Cloudinary
                  </p>
                  <p className="text-[11px] text-[#8A7E72] mt-0.5">JPG, PNG, WebP up to 5MB • Saves directly to Cloudinary CDN</p>
                </div>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Asset Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A7E72]">
                Cloudinary Asset Library ({filteredAssets.length})
              </h4>
              <span className="text-[11px] text-[#8A7E72]">Click image to select</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredAssets.map((asset) => {
                const isSelected = selectedUrl === asset.url;
                return (
                  <div
                    key={asset.id}
                    onClick={() => {
                      onSelect(asset.url);
                      onClose();
                    }}
                    className={`group relative bg-white rounded-2xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${
                      isSelected
                        ? "border-[#722F37] ring-2 ring-[#722F37]/20 shadow-md"
                        : "border-[#EFEAE2] hover:border-[#D4AF37]"
                    }`}
                  >
                    <div className="relative aspect-square bg-[#F5F2EB] overflow-hidden">
                      <Image
                        src={asset.url}
                        alt={asset.label}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-[#722F37] text-white p-1 rounded-full shadow-md">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                        {asset.tag}
                      </div>
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-[#1A1A1A] truncate" title={asset.label}>
                        {asset.label}
                      </p>
                      <p className="text-[10px] text-[#8A7E72] truncate mt-0.5">Cloudinary Cloud</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredAssets.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-[#EFEAE2]">
                <ImageIcon className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-xs text-[#8A7E72]">No Cloudinary assets match your filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with External URL Input option */}
        <div className="p-4 border-t border-[#EFEAE2] bg-[#FDFBF7] flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex-1 w-full flex items-center gap-2">
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Paste custom Cloudinary / HTTPS image URL..."
              className="flex-1 px-3 py-2 bg-white border border-[#EFEAE2] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#722F37]"
            />
            <button
              onClick={handleApplyCustomUrl}
              disabled={!customUrl.trim()}
              className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#722F37] text-white text-xs font-medium rounded-xl transition disabled:opacity-40"
            >
              Apply URL
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 border border-[#EFEAE2] bg-white hover:bg-neutral-50 text-xs font-medium rounded-xl text-[#1A1A1A] transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

