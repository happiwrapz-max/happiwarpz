import fs from "fs";
import path from "path";

const dbPath = path.resolve("src/lib/server/db.ts");
let content = fs.readFileSync(dbPath, "utf-8");

const categoryInterfaces = `
export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  featured?: boolean;
  active: boolean;
  displayOrder?: number;
}

export interface OccasionRecord {
  id: string;
  name: string;
  headline: string;
  recommendedSlug: string;
  bannerImage?: string;
  badge?: string;
  active: boolean;
  displayOrder?: number;
}

export const INITIAL_CATEGORIES: CategoryRecord[] = [
  { id: "cat-1", name: "Flower Bouquet", slug: "flower-bouquet", description: "Handmade satin ribbon flower bouquets crafted to last forever", active: true, featured: true, icon: "🌹" },
  { id: "cat-2", name: "Gift Box", slug: "gift-box", description: "Luxury velvet and ribbon blossom keepsake gift boxes", active: true, featured: true, icon: "🎁" },
  { id: "cat-3", name: "Gift Hamper", slug: "gift-hamper", description: "Bespoke curated hampers with keepsake flowers, candles and sweets", active: true, featured: true, icon: "🧺" },
  { id: "cat-4", name: "Glitter Editions", slug: "glitter-editions", description: "Sparkling shimmer luxury ribbon flowers for extraordinary occasions", active: true, featured: true, icon: "✨" },
  { id: "cat-5", name: "Wedding & Keepsake", slug: "wedding-keepsake", description: "Forever wedding arrangements, bridal keepsakes, and anniversaries", active: true, featured: false, icon: "💍" },
];

export const INITIAL_OCCASIONS: OccasionRecord[] = [
  {
    id: "anniversary",
    name: "Anniversary & Romance",
    headline: "Express timeless devotion with classic red blooms",
    recommendedSlug: "red-rose-bouquet",
    bannerImage: "/images/products/rose-bouquet-1.jpg",
    badge: "Most Cherished",
    active: true,
  },
  {
    id: "birthday",
    name: "Luxury Birthdays",
    headline: "Make celebrations unforgettable with glitter luxury roses",
    recommendedSlug: "glitter-rose-luxury",
    bannerImage: "/images/products/glitter-rose-1.jpg",
    badge: "Celebration",
    active: true,
  },
  {
    id: "congratulations",
    name: "Congratulations & Milestones",
    headline: "Artisanal crimson hampers with keepsake candle and chocolates",
    recommendedSlug: "eternal-crimson-hamper",
    bannerImage: "/images/products/rose-bouquet-3.jpg",
    badge: "Milestones",
    active: true,
  },
  {
    id: "just-because",
    name: "Just For You ♡",
    headline: "Surprise moments with same-day Coimbatore delivery",
    recommendedSlug: "midnight-rose-box",
    bannerImage: "/images/products/rose-bouquet-2.jpg",
    badge: "Sweet Surprise",
    active: true,
  },
];
`;

// Insert interfaces before DatabaseSchema
if (!content.includes("export interface CategoryRecord")) {
  content = content.replace("interface DatabaseSchema {", `${categoryInterfaces}\ninterface DatabaseSchema {`);
}

// Add categories and occasions to DatabaseSchema
if (!content.includes("categories?: CategoryRecord[]")) {
  content = content.replace(
    "returns: ReturnRecord[];",
    "returns: ReturnRecord[];\n  categories?: CategoryRecord[];\n  occasions?: OccasionRecord[];"
  );
}

// Ensure in loadDatabase
if (!content.includes("inMemoryDb.categories =")) {
  content = content.replace(
    "inMemoryDb.returns = inMemoryDb.returns || [];",
    "inMemoryDb.returns = inMemoryDb.returns || [];\n        inMemoryDb.categories = inMemoryDb.categories || [...INITIAL_CATEGORIES];\n        inMemoryDb.occasions = inMemoryDb.occasions || [...INITIAL_OCCASIONS];"
  );
}

// Ensure in fresh initialization
if (!content.includes("categories: [...INITIAL_CATEGORIES],")) {
  content = content.replace(
    "returns: [],",
    "returns: [],\n    categories: [...INITIAL_CATEGORIES],\n    occasions: [...INITIAL_OCCASIONS],"
  );
}

const functionsToAppend = `
// ── Categories Management ───────────────────────────────────────────────────

export async function getCategories(): Promise<CategoryRecord[]> {
  const db = loadDatabase();
  return db.categories || [...INITIAL_CATEGORIES];
}

export async function saveCategory(category: Omit<CategoryRecord, "id">): Promise<CategoryRecord> {
  const db = loadDatabase();
  db.categories = db.categories || [...INITIAL_CATEGORIES];
  const newCat: CategoryRecord = {
    ...category,
    id: \`cat-\${Date.now()}-\${Math.random().toString(36).substring(2, 6)}\`,
    slug: category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  };
  db.categories.push(newCat);
  saveDatabase(db);
  return newCat;
}

export async function updateCategory(id: string, updates: Partial<CategoryRecord>): Promise<CategoryRecord | null> {
  const db = loadDatabase();
  db.categories = db.categories || [...INITIAL_CATEGORIES];
  const idx = db.categories.findIndex((c) => c.id === id || c.slug === id);
  if (idx === -1) return null;
  db.categories[idx] = { ...db.categories[idx], ...updates };
  saveDatabase(db);
  return db.categories[idx];
}

export async function deleteCategory(id: string): Promise<boolean> {
  const db = loadDatabase();
  db.categories = db.categories || [...INITIAL_CATEGORIES];
  const initialLen = db.categories.length;
  db.categories = db.categories.filter((c) => c.id !== id && c.slug !== id);
  if (db.categories.length !== initialLen) {
    saveDatabase(db);
    return true;
  }
  return false;
}

// ── Occasions Management ────────────────────────────────────────────────────

export async function getOccasions(): Promise<OccasionRecord[]> {
  const db = loadDatabase();
  return db.occasions || [...INITIAL_OCCASIONS];
}

export async function saveOccasion(occasion: Omit<OccasionRecord, "id">): Promise<OccasionRecord> {
  const db = loadDatabase();
  db.occasions = db.occasions || [...INITIAL_OCCASIONS];
  const newOcc: OccasionRecord = {
    ...occasion,
    id: \`occ-\${Date.now()}-\${Math.random().toString(36).substring(2, 6)}\`,
  };
  db.occasions.push(newOcc);
  saveDatabase(db);
  return newOcc;
}

export async function updateOccasion(id: string, updates: Partial<OccasionRecord>): Promise<OccasionRecord | null> {
  const db = loadDatabase();
  db.occasions = db.occasions || [...INITIAL_OCCASIONS];
  const idx = db.occasions.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  db.occasions[idx] = { ...db.occasions[idx], ...updates };
  saveDatabase(db);
  return db.occasions[idx];
}

export async function deleteOccasion(id: string): Promise<boolean> {
  const db = loadDatabase();
  db.occasions = db.occasions || [...INITIAL_OCCASIONS];
  const initialLen = db.occasions.length;
  db.occasions = db.occasions.filter((o) => o.id !== id);
  if (db.occasions.length !== initialLen) {
    saveDatabase(db);
    return true;
  }
  return false;
}
`;

if (!content.includes("export async function getCategories()")) {
  content += functionsToAppend;
}

fs.writeFileSync(dbPath, content, "utf-8");
console.log("Categories and Occasions successfully added to db.ts");

