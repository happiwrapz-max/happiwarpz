"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  X,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Copy,
  Check,
  Edit2,
} from "lucide-react";
import CloudinaryMediaSelectorModal from "./CloudinaryMediaSelectorModal";

interface CloudinarySingleImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  aspectRatio?: "square" | "video" | "banner";
}

export default function CloudinarySingleImageUploader({
  value,
  onChange,
  label = "Banner / Featured Image",
  description = "Image is stored in Cloudinary cloud space only. Database stores CDN URL.",
  aspectRatio = "square",
}: CloudinarySingleImageUploaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDirectUpload = async (file: File) => {
    setUploading(true);
    setError(null);
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

      onChange(data.url);
    } catch (err: any) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isWide = aspectRatio === "banner" || aspectRatio === "video";

  const previewFrameClass =
    aspectRatio === "banner"
      ? "w-full h-44 sm:h-52"
      : aspectRatio === "video"
      ? "w-full h-48 sm:h-56"
      : "w-36 h-36 shrink-0";

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFEAE2] shadow-2xs space-y-4 w-full overflow-hidden">
      {/* Header & Cloud CDN Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#EFEAE2]">
        <div>
          <label className="text-xs font-serif font-bold uppercase tracking-wider text-[#1E1E1E] block">
            {label}
          </label>
          {description && (
            <p className="text-xs text-[#666] mt-0.5">{description}</p>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] text-[10.5px] font-medium text-[#722F37] shrink-0 self-start sm:self-auto">
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
          <span>Cloudinary CDN</span>
        </span>
      </div>

      {/* Main Container: Stacked for wide banners; Side-by-side for square */}
      <div className={`flex ${isWide ? "flex-col" : "flex-col sm:flex-row"} gap-4 items-start w-full`}>
        {/* Thumbnail Preview Area */}
        <div
          className={`relative ${previewFrameClass} bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2] overflow-hidden flex items-center justify-center shadow-2xs group`}
        >
          {value ? (
            <>
              <Image
                src={value}
                alt="Selected storefront asset"
                fill
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover"
              />

              {/* Floating Action Pills on Top Right */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-3 py-1.5 bg-white/95 hover:bg-white text-[#1E1E1E] rounded-xl text-xs font-serif font-semibold transition-all shadow-md backdrop-blur-xs flex items-center gap-1.5 cursor-pointer hover:text-[#E10600]"
                  title="Change Image from Library"
                >
                  <Edit2 className="w-3 h-3 text-[#E10600]" />
                  <span>Change</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="p-1.5 bg-white/95 hover:bg-red-50 text-red-600 rounded-xl text-xs transition-all shadow-md backdrop-blur-xs cursor-pointer border border-red-200"
                  title="Remove Image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom Subtle Gradient Info Strip */}
              <div className="absolute inset-x-0 bottom-0 py-2 px-3 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-between pointer-events-none">
                <span className="text-[10px] text-white/90 font-mono tracking-wide truncate max-w-[80%]">
                  {value.split("/").pop()}
                </span>
                <span className="text-[10px] text-white/80 font-serif uppercase tracking-wider">
                  Active Asset
                </span>
              </div>
            </>
          ) : (
            <div className="text-center p-6 space-y-2">
              <ImageIcon className="w-10 h-10 text-[#CCC] mx-auto" />
              <p className="text-xs text-[#888] font-medium">No image selected for this banner</p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-1 px-4 py-1.5 bg-[#1E1E1E] text-white rounded-xl text-xs font-serif font-semibold hover:bg-black transition cursor-pointer"
              >
                Select from Cloud Library
              </button>
            </div>
          )}
        </div>

        {/* Action Controls & URL Bar */}
        <div className="flex-1 w-full space-y-3 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Open Library Modal */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#1E1E1E] hover:bg-black text-white text-xs font-serif font-semibold rounded-xl inline-flex items-center gap-2 transition shadow-xs cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-[#FFE082]" />
              <span>Select from Cloud Library</span>
            </button>

            {/* Direct File Upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-[#FAF8F5] border border-[#EFEAE2] hover:bg-[#F2ECE4] text-[#1E1E1E] text-xs font-serif font-semibold rounded-xl inline-flex items-center gap-2 transition shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E10600]" />
                  <span>Uploading to Cloud...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5 text-[#666]" />
                  <span>Upload from Device</span>
                </>
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleDirectUpload(f);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            />
          </div>

          {/* Direct URL input with Copy Button */}
          <div className="flex items-center gap-2 w-full min-w-0">
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://res.cloudinary.com/w8fw2mbb/..."
              className="flex-1 min-w-0 px-3.5 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-xs text-[#1E1E1E] font-mono focus:outline-hidden focus:border-[#E10600] focus:bg-white transition-colors"
            >
            </input>
            {value && (
              <button
                type="button"
                onClick={handleCopyUrl}
                title="Copy CDN URL"
                className="p-2 bg-[#FAF8F5] border border-[#EFEAE2] hover:bg-[#F2ECE4] text-[#666] hover:text-[#1E1E1E] rounded-xl transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>

          {error && (
            <p className="text-xs text-[#E10600] flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          {/* Storage Guarantee Note */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE2] text-[11px] text-[#666]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Cloudinary CDN:</span>
            <span className="font-mono text-[#1E1E1E] font-medium">res.cloudinary.com/w8fw2mbb</span>
          </div>
        </div>
      </div>

      {/* Cloud Library Modal */}
      <CloudinaryMediaSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(url) => onChange(url)}
        title={`Select Image for ${label}`}
        selectedUrl={value}
      />
    </div>
  );
}
