"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  X,
  Star,
  Check,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  ExternalLink,
  Plus,
  FolderOpen,
} from "lucide-react";
import CloudinaryMediaSelectorModal from "./CloudinaryMediaSelectorModal";

interface CloudinaryImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

const STUDIO_PRESETS = [
  { label: "Rose Bouquet — Crimson Classic", url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg" },
  { label: "Rose Bouquet — Sunflower Sunset", url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881758/happiwrapz/products/rose-bouquet-2.jpg" },
  { label: "Rose Bouquet — Golden Duet", url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881759/happiwrapz/products/rose-bouquet-3.jpg" },
  { label: "Rose Bouquet — Rosy Blush", url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881761/happiwrapz/products/rose-bouquet-4.jpg" },
  { label: "Glitter Luxury Rose — Diamond Edition", url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881737/happiwrapz/products/glitter-rose-1.jpg" },
  { label: "Midnight Velvet Keepsake Box", url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881749/happiwrapz/products/midnight-box-1.jpg" },
  { label: "Eternal Ribbon Flower Luxury Hamper", url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881743/happiwrapz/products/hamper-1.jpg" },
  { label: "Artisanal European Gift Wrap", url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881731/happiwrapz/products/gift-wrap-1.jpg" },
];

export default function CloudinaryImageUploader({
  images,
  onChange,
  maxImages = 6,
}: CloudinaryImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [showPresets, setShowPresets] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length >= maxImages) {
      setUploadError(`Maximum of ${maxImages} images allowed per product.`);
      return;
    }

    const file = files[0];
    await uploadFileToCloudinary(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadFileToCloudinary = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    setSuccessNotice(null);

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

      // Append new Cloudinary URL to images array
      const newImages = [...images, data.url];
      onChange(newImages);
      setSuccessNotice("Image saved to Cloudinary cloud storage!");
      setTimeout(() => setSuccessNotice(null), 3500);
    } catch (err: any) {
      console.error("Cloudinary upload failed:", err);
      setUploadError(err.message || "Failed to upload to Cloudinary.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (images.length >= maxImages) {
      setUploadError(`Maximum of ${maxImages} images allowed.`);
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadFileToCloudinary(file);
    }
  };

  const setPrimary = (index: number) => {
    if (index === 0) return;
    const item = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    onChange([item, ...rest]);
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const addManualUrl = () => {
    const trimmed = manualUrl.trim();
    if (!trimmed) return;
    if (images.includes(trimmed)) {
      setUploadError("Image already in gallery.");
      return;
    }
    onChange([...images, trimmed]);
    setManualUrl("");
    setUploadError(null);
  };

  const addPreset = (url: string) => {
    if (images.includes(url)) return;
    onChange([...images, url]);
    setShowPresets(false);
  };

  return (
    <div className="space-y-4">
      {/* Cloud Storage Notice */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#777] bg-[#FAF8F5] p-3 rounded-2xl border border-[#EFEAE2]">
        <div className="flex items-center gap-2 min-w-0">
          <UploadCloud className="w-4 h-4 text-[#E10600] shrink-0" />
          <span className="font-serif text-[11px] sm:text-xs truncate">
            Cloud Storage: <strong>Cloudinary CDN</strong>
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#888] shrink-0">
          {images.length} / {maxImages} Images
        </span>
      </div>

      {/* Error / Success Feedback */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Gallery Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, idx) => (
            <div
              key={`${img}-${idx}`}
              className={`relative aspect-square rounded-2xl overflow-hidden border bg-[#FAF8F5] group transition-all ${
                idx === 0 ? "border-[#E10600] ring-2 ring-[#E10600]/20" : "border-[#EFEAE2]"
              }`}
            >
              <Image src={img} alt={`Product image ${idx + 1}`} fill className="object-cover" />

              {/* Primary Image Badge */}
              {idx === 0 && (
                <span className="absolute top-2 left-2 bg-[#E10600] text-white text-[9.5px] font-serif font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span>Primary</span>
                </span>
              )}

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => setPrimary(idx)}
                    className="p-1.5 bg-white text-[#1E1E1E] rounded-lg text-xs hover:bg-[#FAF8F5] shadow-xs"
                    title="Set as Primary Image"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                )}
                <a
                  href={img}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 bg-white text-[#1E1E1E] rounded-lg text-xs hover:bg-[#FAF8F5] shadow-xs"
                  title="View High-Res in New Tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="p-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 shadow-xs"
                  title="Remove Image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cloudinary Drag & Drop Zone */}
      {images.length < maxImages && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#DDD] hover:border-[#E10600] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] space-y-2"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
          />

          {uploading ? (
            <div className="py-2 flex flex-col items-center justify-center gap-2 text-xs text-[#E10600]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-serif">Uploading to Cloudinary Cloud Space...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-white border border-[#EFEAE2] flex items-center justify-center mx-auto text-[#E10600] shadow-2xs">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-serif font-bold text-[#1E1E1E]">
                  Click or drag image to upload to Cloudinary
                </p>
                <p className="text-[11px] text-[#888] mt-0.5">
                  Supports JPG, PNG, WEBP (Max 10MB). Stored exclusively in cloud storage.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Manual URL Input or Preset Selector */}
      <div className="space-y-2.5 pt-2 border-t border-[#F2ECE4]">
        {/* Row 1: URL input + Add button */}
        <div className="flex gap-2 w-full min-w-0">
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="Paste Cloudinary / image URL..."
            className="flex-1 min-w-0 text-xs px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600] focus:bg-white"
          />
          <button
            type="button"
            onClick={addManualUrl}
            disabled={!manualUrl.trim()}
            className="px-3.5 py-2 bg-[#1E1E1E] text-white text-xs font-serif font-semibold rounded-xl hover:bg-black transition-colors disabled:opacity-40 cursor-pointer shrink-0"
          >
            Add URL
          </button>
        </div>

        {/* Row 2: Cloud Library and Presets buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCloudModal(true)}
            className="flex-1 min-w-[130px] px-3.5 py-2 bg-[#722F37] hover:bg-[#5B252C] text-white text-xs font-serif font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            title="Browse all Cloudinary Cloud assets"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Cloud Library</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="px-3 py-2 bg-white border border-[#EFEAE2] text-[#666] hover:text-[#1E1E1E] text-xs font-serif rounded-xl transition-colors cursor-pointer"
            title="Browse Studio Presets"
          >
            Presets
          </button>
        </div>

        {/* Studio Presets Drawer */}
        {showPresets && (
          <div className="p-3 bg-white rounded-2xl border border-[#EFEAE2] shadow-xs space-y-2">
            <span className="text-[10px] uppercase font-bold text-[#888] tracking-wider block">
              Curated Happiwrapz Photography
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STUDIO_PRESETS.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => addPreset(preset.url)}
                  className="p-1.5 rounded-xl border border-[#EFEAE2] hover:border-[#E10600] text-left transition-colors flex items-center gap-2 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden relative border border-[#EFEAE2] shrink-0">
                    <Image src={preset.url} alt={preset.label} fill className="object-cover" />
                  </div>
                  <span className="text-[10px] font-serif text-[#1E1E1E] group-hover:text-[#E10600] truncate block">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cloudinary Media Selector Modal */}
      <CloudinaryMediaSelectorModal
        isOpen={showCloudModal}
        onClose={() => setShowCloudModal(false)}
        onSelect={(url) => {
          if (images.length < maxImages) {
            onChange([...images, url]);
            setSuccessNotice("Asset added from Cloudinary Cloud Library!");
            setTimeout(() => setSuccessNotice(null), 3500);
          } else {
            setUploadError(`Maximum of ${maxImages} images allowed per product.`);
          }
        }}
        title="Select Product Image from Cloudinary Library"
      />
    </div>
  );
}

