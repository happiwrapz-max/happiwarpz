/**
 * Authoritative Cloudinary Asset Registry for Happiwrapz Studio
 * All images are stored exclusively in Cloudinary cloud space (res.cloudinary.com/w8fw2mbb).
 * Zero image binaries are saved in the database.
 */

export interface CloudinaryAsset {
  id: string;
  label: string;
  category: "bouquets" | "glitter" | "boxes" | "hampers" | "wraps" | "banners";
  url: string;
  tag: string;
}

export const CLOUDINARY_STUDIO_ASSETS: CloudinaryAsset[] = [
  // Rose Bouquets
  {
    id: "rose-bouquet-1",
    label: "Satin Rose Bouquet — Crimson Classic",
    category: "bouquets",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg",
    tag: "Signature Bouquet",
  },
  {
    id: "rose-bouquet-2",
    label: "Satin Rose Bouquet — Sunflower Sunset",
    category: "bouquets",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881758/happiwrapz/products/rose-bouquet-2.jpg",
    tag: "Sunflower & Rose",
  },
  {
    id: "rose-bouquet-3",
    label: "Satin Rose Bouquet — Golden Sunrise Duet",
    category: "bouquets",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881759/happiwrapz/products/rose-bouquet-3.jpg",
    tag: "Golden Duet",
  },
  {
    id: "rose-bouquet-4",
    label: "Satin Rose Bouquet — Rosy Pastel Blush",
    category: "bouquets",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881761/happiwrapz/products/rose-bouquet-4.jpg",
    tag: "Pastel Blush",
  },

  // Glitter Roses
  {
    id: "glitter-rose-1",
    label: "Glitter Luxury Rose — Diamond Shimmer Edition",
    category: "glitter",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881737/happiwrapz/products/glitter-rose-1.jpg",
    tag: "Diamond Shimmer",
  },
  {
    id: "glitter-rose-2",
    label: "Glitter Luxury Rose — Royal Emerald Sparkle",
    category: "glitter",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881738/happiwrapz/products/glitter-rose-2.jpg",
    tag: "Emerald Velvet",
  },
  {
    id: "glitter-rose-3",
    label: "Glitter Luxury Rose — Ruby Twilight Spark",
    category: "glitter",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881740/happiwrapz/products/glitter-rose-3.jpg",
    tag: "Ruby Velvet",
  },
  {
    id: "glitter-rose-4",
    label: "Glitter Luxury Rose — Champagne Elegance",
    category: "glitter",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881741/happiwrapz/products/glitter-rose-4.jpg",
    tag: "Champagne Gold",
  },

  // Keepsake Boxes
  {
    id: "midnight-box-1",
    label: "Midnight Velvet Keepsake Box — Deep Onyx",
    category: "boxes",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881749/happiwrapz/products/midnight-box-1.jpg",
    tag: "Keepsake Box",
  },
  {
    id: "midnight-box-2",
    label: "Midnight Velvet Keepsake Box — Violet Royale",
    category: "boxes",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881751/happiwrapz/products/midnight-box-2.jpg",
    tag: "Royale Velvet",
  },
  {
    id: "midnight-box-3",
    label: "Midnight Velvet Keepsake Box — Ivory Romance",
    category: "boxes",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881753/happiwrapz/products/midnight-box-3.jpg",
    tag: "Ivory Keepsake",
  },
  {
    id: "midnight-box-4",
    label: "Midnight Velvet Keepsake Box — Rose Gold Pearl",
    category: "boxes",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881754/happiwrapz/products/midnight-box-4.jpg",
    tag: "Rose Gold",
  },

  // Luxury Hampers
  {
    id: "hamper-1",
    label: "Eternal Ribbon Flower Luxury Hamper — Grandeur",
    category: "hampers",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881743/happiwrapz/products/hamper-1.jpg",
    tag: "Luxury Hamper",
  },
  {
    id: "hamper-2",
    label: "Eternal Ribbon Flower Luxury Hamper — Blossom Bliss",
    category: "hampers",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881744/happiwrapz/products/hamper-2.jpg",
    tag: "Blossom Hamper",
  },
  {
    id: "hamper-3",
    label: "Eternal Ribbon Flower Luxury Hamper — Sweet Celebration",
    category: "hampers",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881745/happiwrapz/products/hamper-3.jpg",
    tag: "Celebration Hamper",
  },
  {
    id: "hamper-4",
    label: "Eternal Ribbon Flower Luxury Hamper — Velvet Truffle",
    category: "hampers",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881747/happiwrapz/products/hamper-4.jpg",
    tag: "Truffle Hamper",
  },

  // European Gift Wraps
  {
    id: "gift-wrap-1",
    label: "Artisanal European Gift Wrap — Parisian Matte Pink",
    category: "wraps",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881731/happiwrapz/products/gift-wrap-1.jpg",
    tag: "Parisian Wrap",
  },
  {
    id: "gift-wrap-2",
    label: "Artisanal European Gift Wrap — Botanical Cream",
    category: "wraps",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881733/happiwrapz/products/gift-wrap-2.jpg",
    tag: "Botanical Wrap",
  },
  {
    id: "gift-wrap-3",
    label: "Artisanal European Gift Wrap — Satin Forest Sage",
    category: "wraps",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881734/happiwrapz/products/gift-wrap-3.jpg",
    tag: "Forest Sage",
  },
  {
    id: "gift-wrap-4",
    label: "Artisanal European Gift Wrap — Midnight Gold Foil",
    category: "wraps",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881735/happiwrapz/products/gift-wrap-4.jpg",
    tag: "Midnight Gold",
  },

  // Banners & Editorial
  {
    id: "hero-desktop",
    label: "Storefront Master Desktop Hero Banner",
    category: "banners",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881723/happiwrapz/assets/hero-desktop.jpg",
    tag: "Desktop Banner",
  },
  {
    id: "hero-mobile",
    label: "Storefront Master Mobile Hero Banner",
    category: "banners",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881726/happiwrapz/assets/hero-mobile.jpg",
    tag: "Mobile Banner",
  },
  {
    id: "hero-banner",
    label: "Hero Atmosphere Banner",
    category: "banners",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881720/happiwrapz/assets/hero-banner.jpg",
    tag: "Atelier Hero",
  },
  {
    id: "collection-hero",
    label: "Catalog & Collection Cover Showcase",
    category: "banners",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881719/happiwrapz/assets/collection-hero.jpg",
    tag: "Collection Cover",
  },
  {
    id: "atelier-login-cinematic",
    label: "Cinematic Atelier Editorial Portrait",
    category: "banners",
    url: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881710/happiwrapz/assets/atelier-login-cinematic.jpg",
    tag: "Editorial",
  },
];

