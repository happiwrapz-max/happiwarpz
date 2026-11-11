import fs from "fs";
import path from "path";
import { CATALOG } from "@/lib/data/catalog";
import {
  Product,
  OrderRequest,
  BagItem,
  CustomerInfo,
  StatusChange,
  User,
  DEMO_ACCOUNTS,
  CustomOrderRequest,
  Quotation,
  InventoryMovement,
  Coupon,
  AdminNotification,
  WebsiteSettings,
  ProductReview,
  FlowerCountTier,
} from "@/lib/store/types";
import { INITIAL_PRODUCT_REVIEWS } from "@/lib/data/seedReviews";
import { OrderStatus, generateOrderReference } from "@/lib/utils";
import { isPostgresConfigured } from "./postgres";
import { hashPassword } from "./security";
import {
  ensurePostgresReady,
  pgGetProducts,
  pgSaveProduct,
  pgDeleteProduct,
  pgGetOrders,
  pgSaveOrder,
  pgGetCustomOrders,
  pgSaveCustomOrder,
  pgGetCoupons,
  pgSaveCoupon,
  pgGetWebsiteSettings,
  pgSaveWebsiteSettings,
  pgGetUsers,
  pgSaveUser,
  pgSaveContact,
  pgSaveSubscriber,
  pgSavePayment,
  pgSaveReturn,
  PaymentRecord,
  ReturnRecord,
} from "./postgresAdapter";

export interface AuditLogEntry {
  id: string;
  orderId?: string;
  reference?: string;
  action: string;
  fromStatus?: string;
  toStatus?: string;
  actorName: string;
  actorRole: string;
  note?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt: string;
  status: "unread" | "read" | "replied";
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  active: boolean;
}


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
    bannerImage: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg",
    badge: "Most Cherished",
    active: true,
  },
  {
    id: "birthday",
    name: "Luxury Birthdays",
    headline: "Make celebrations unforgettable with glitter luxury roses",
    recommendedSlug: "glitter-rose-luxury",
    bannerImage: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881737/happiwrapz/products/glitter-rose-1.jpg",
    badge: "Celebration",
    active: true,
  },
  {
    id: "congratulations",
    name: "Congratulations & Milestones",
    headline: "Artisanal crimson hampers with keepsake candle and chocolates",
    recommendedSlug: "eternal-crimson-hamper",
    bannerImage: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881759/happiwrapz/products/rose-bouquet-3.jpg",
    badge: "Milestones",
    active: true,
  },
  {
    id: "just-because",
    name: "Just For You ♡",
    headline: "Surprise moments with same-day Coimbatore delivery",
    recommendedSlug: "midnight-rose-box",
    bannerImage: "https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881758/happiwrapz/products/rose-bouquet-2.jpg",
    badge: "Sweet Surprise",
    active: true,
  },
];

interface DatabaseSchema {
  products: Product[];
  orders: OrderRequest[];
  customOrders: CustomOrderRequest[];
  quotations: Quotation[];
  inventoryMovements: InventoryMovement[];
  coupons: Coupon[];
  notifications: AdminNotification[];
  websiteSettings: WebsiteSettings;
  users: User[];
  auditLogs: AuditLogEntry[];
  contacts: ContactMessage[];
  subscribers: Subscriber[];
  payments: PaymentRecord[];
  returns: ReturnRecord[];
  categories?: CategoryRecord[];
  occasions?: OccasionRecord[];
  reviews?: ProductReview[];
}

const BUNDLE_DB_FILE = path.join(process.cwd(), ".data", "db.json");
const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", ".data")
  : path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

if (process.env.VERCEL && !isPostgresConfigured) {
  console.warn(
    "[Storage Warning] Running on Vercel without POSTGRES_URL. /tmp storage is ephemeral. Please configure POSTGRES_URL for persistent orders."
  );
}

// -- Initial Seed Data imported from ./seedData ------------------------------
import {
  INITIAL_SEED_ORDERS,
  INITIAL_CUSTOM_ORDERS,
  INITIAL_COUPONS,
  INITIAL_INVENTORY_MOVEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_WEBSITE_SETTINGS,
} from "./seedData";
// ── Global In-Memory Cache with Disk Sync ────────────────────────────────────

let inMemoryDb: DatabaseSchema | null = null;

function loadDatabase(): DatabaseSchema {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  try {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch {
      // Ignore directory creation failure on read-only environments
    }

    const targetFile = fs.existsSync(DB_FILE)
      ? DB_FILE
      : fs.existsSync(BUNDLE_DB_FILE)
      ? BUNDLE_DB_FILE
      : null;

    if (targetFile) {
      const raw = fs.readFileSync(targetFile, "utf-8");
      inMemoryDb = JSON.parse(raw);
      if (inMemoryDb && inMemoryDb.products && inMemoryDb.orders) {
        // Ensure new array keys exist if migrating from old schema
        for (let i = 0; i < inMemoryDb.products.length; i++) {
          const prod = inMemoryDb.products[i];
          if (prod.stockQuantity === undefined) {
            prod.stockQuantity = prod.inStock ? 25 + (i % 3) * 15 : 0;
            prod.lowStockThreshold = prod.lowStockThreshold ?? 8;
            prod.preparationHours = prod.preparationHours ?? 3;
            prod.isMadeToOrder = prod.isMadeToOrder ?? false;
          }
        }
        inMemoryDb.customOrders = inMemoryDb.customOrders || [...INITIAL_CUSTOM_ORDERS];
        inMemoryDb.quotations = inMemoryDb.quotations || [];
        inMemoryDb.inventoryMovements = inMemoryDb.inventoryMovements || [...INITIAL_INVENTORY_MOVEMENTS];
        inMemoryDb.coupons = inMemoryDb.coupons || [...INITIAL_COUPONS];
        inMemoryDb.websiteSettings = inMemoryDb.websiteSettings || { ...INITIAL_WEBSITE_SETTINGS };
        inMemoryDb.auditLogs = inMemoryDb.auditLogs || [];
        inMemoryDb.payments = inMemoryDb.payments || [];
        inMemoryDb.returns = inMemoryDb.returns || [];
        inMemoryDb.categories = inMemoryDb.categories || [...INITIAL_CATEGORIES];
        inMemoryDb.occasions = inMemoryDb.occasions || [...INITIAL_OCCASIONS];
        inMemoryDb.reviews = inMemoryDb.reviews || [...INITIAL_PRODUCT_REVIEWS];
        if (isPostgresConfigured) {
          ensurePostgresReady({
            products: inMemoryDb.products,
            coupons: inMemoryDb.coupons,
            websiteSettings: inMemoryDb.websiteSettings,
            users: inMemoryDb.users,
            orders: inMemoryDb.orders,
            customOrders: inMemoryDb.customOrders,
          }).catch((err) => console.warn("[Postgres] Database initialization warning:", err));
        }
        return inMemoryDb;
      }
    }
  } catch (err) {
    console.warn("Could not read db.json, falling back to seed data:", err);
  }

  // Initialize fresh schema with complete seed state
  inMemoryDb = {
    products: CATALOG.map((p, idx) => ({
      ...p,
      stockQuantity: 25 + (idx % 3) * 15,
      lowStockThreshold: 8,
      isMadeToOrder: false,
      preparationHours: 3,
    })),
    orders: [...INITIAL_SEED_ORDERS],
    customOrders: [...INITIAL_CUSTOM_ORDERS],
    quotations: [INITIAL_CUSTOM_ORDERS[0].quotation!],
    inventoryMovements: [...INITIAL_INVENTORY_MOVEMENTS],
    coupons: [...INITIAL_COUPONS],
    notifications: [...INITIAL_NOTIFICATIONS],
    websiteSettings: { ...INITIAL_WEBSITE_SETTINGS },
    users: [...DEMO_ACCOUNTS],
    auditLogs: [],
    contacts: [],
    payments: [],
    returns: [],
    categories: [...INITIAL_CATEGORIES],
    occasions: [...INITIAL_OCCASIONS],
    subscribers: [
      {
        id: "sub-1",
        email: "concierge@happiwrapz.in",
        subscribedAt: new Date().toISOString(),
        active: true,
      },
    ],
  };

  saveDatabase(inMemoryDb);
  if (isPostgresConfigured) {
    ensurePostgresReady({
      products: inMemoryDb.products,
      coupons: inMemoryDb.coupons,
      websiteSettings: inMemoryDb.websiteSettings,
      users: inMemoryDb.users,
      orders: inMemoryDb.orders,
      customOrders: inMemoryDb.customOrders,
    }).catch((err) => console.warn("[Postgres] Database initialization warning:", err));
  }
  return inMemoryDb;
}

let saveDiskTimer: NodeJS.Timeout | null = null;

function saveDatabase(db: DatabaseSchema) {
  // 1. Immediately update the in-memory singleton
  inMemoryDb = db;

  // 2. Debounced async atomic flush to disk to avoid blocking the Node.js event loop
  if (saveDiskTimer) clearTimeout(saveDiskTimer);
  saveDiskTimer = setTimeout(async () => {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        await fs.promises.mkdir(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      await fs.promises.writeFile(tmpFile, JSON.stringify(db, null, 2), "utf-8");
      await fs.promises.rename(tmpFile, DB_FILE);
    } catch (err) {
      console.warn("Failed to write db.json to disk:", err);
    }
  }, 50);
}

// ── Products API ─────────────────────────────────────────────────────────────

export async function getProducts(filters?: {
  category?: string;
  search?: string;
  inStock?: boolean;
  featured?: boolean;
}): Promise<Product[]> {
  if (isPostgresConfigured) {
    try {
      const pgList = await pgGetProducts();
      if (pgList && pgList.length > 0) {
        let list = pgList.filter((p) => !p.archived);

        if (filters?.category && filters.category !== "all") {
          const cat = filters.category.toLowerCase();
          list = list.filter((p) => p.category.toLowerCase() === cat);
        }

        if (filters?.inStock !== undefined) {
          list = list.filter((p) => p.inStock === filters.inStock);
        }

        if (filters?.featured !== undefined) {
          list = list.filter((p) => p.featured === filters.featured);
        }

        if (filters?.search) {
          const q = filters.search.toLowerCase().trim();
          list = list.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.description.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q)
          );
        }

        return list;
      }
    } catch (err) {
      console.warn("[Postgres] getProducts fallback:", err);
    }
  }

  const db = loadDatabase();
  let list = db.products.filter((p) => !p.archived);

  if (filters?.category && filters.category !== "all") {
    const cat = filters.category.toLowerCase();
    list = list.filter((p) => p.category.toLowerCase() === cat);
  }

  if (filters?.inStock !== undefined) {
    list = list.filter((p) => p.inStock === filters.inStock);
  }

  if (filters?.featured !== undefined) {
    list = list.filter((p) => p.featured === filters.featured);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  return list;
}

export async function getProductById(idOrSlug: string): Promise<Product | null> {
  if (isPostgresConfigured) {
    try {
      const pgList = await pgGetProducts();
      if (pgList && pgList.length > 0) {
        const found = pgList.find(
          (p) => (p.id === idOrSlug || p.slug === idOrSlug) && !p.archived
        );
        if (found) return found;
      }
    } catch (err) {
      console.warn("[Postgres] getProductById fallback:", err);
    }
  }

  const db = loadDatabase();
  const found = db.products.find(
    (p) => (p.id === idOrSlug || p.slug === idOrSlug) && !p.archived
  );
  return found || null;
}

export async function createProduct(
  data: Omit<Product, "id"> & { id?: string }
): Promise<Product> {
  const db = loadDatabase();
  const id = data.id || `prod-${Date.now()}`;
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const newProduct: Product = {
    ...data,
    id,
    slug,
    images: data.images?.length ? data.images : ["https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg"],
    inStock: data.inStock !== undefined ? data.inStock : true,
    featured: data.featured || false,
    options: data.options || [],
    stockQuantity: data.stockQuantity !== undefined ? data.stockQuantity : 25,
    lowStockThreshold: data.lowStockThreshold || 8,
    isMadeToOrder: data.isMadeToOrder || false,
    preparationHours: data.preparationHours || 3,
  };

  db.products.push(newProduct);

  // Record initial stock movement
  if (newProduct.stockQuantity && newProduct.stockQuantity > 0) {
    db.inventoryMovements.unshift({
      id: `inv-${Date.now()}`,
      productId: newProduct.id,
      productName: newProduct.name,
      change: newProduct.stockQuantity,
      previousStock: 0,
      newStock: newProduct.stockQuantity,
      reason: "restock",
      actorName: "Happiwrapz Owner",
      actorRole: "owner",
      referenceId: "INITIAL_CREATION",
      timestamp: new Date().toISOString(),
    });
  }

  logAudit({
    action: "PRODUCT_CREATED",
    actorName: "Happiwrapz Owner",
    actorRole: "owner",
    note: `Created product "${newProduct.name}" (₹${newProduct.price}, ${newProduct.stockQuantity} in stock)`,
  });

  saveDatabase(db);
  if (isPostgresConfigured) {
    pgSaveProduct(newProduct).catch((e) => console.warn("[Postgres] save product error:", e));
  }
  return newProduct;
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product | null> {
  const db = loadDatabase();
  const index = db.products.findIndex((p) => p.id === id || p.slug === id);
  if (index === -1) return null;

  const current = db.products[index];
  const oldStock = current.stockQuantity || 0;
  const updated: Product = { ...current, ...updates, id: current.id };

  // If stock quantity was explicitly updated
  if (updates.stockQuantity !== undefined && updates.stockQuantity !== oldStock) {
    const diff = updates.stockQuantity - oldStock;
    db.inventoryMovements.unshift({
      id: `inv-${Date.now()}`,
      productId: current.id,
      productName: current.name,
      change: diff,
      previousStock: oldStock,
      newStock: updates.stockQuantity,
      reason: "audit_correction",
      actorName: "Store Manager",
      actorRole: "manager",
      timestamp: new Date().toISOString(),
    });
  }

  db.products[index] = updated;

  logAudit({
    action: "PRODUCT_UPDATED",
    actorName: "Happiwrapz Admin",
    actorRole: "owner",
    note: `Updated product "${updated.name}" fields: ${Object.keys(updates).join(", ")}`,
  });

  saveDatabase(db);
  if (isPostgresConfigured) {
    pgSaveProduct(updated).catch((e) => console.warn("[Postgres] update product error:", e));
  }
  return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = loadDatabase();
  const target = db.products.find((p) => p.id === id);
  if (!target) return false;

  // Soft archive so historical orders never break!
  target.archived = true;
  target.inStock = false;

  logAudit({
    action: "PRODUCT_ARCHIVED",
    actorName: "Happiwrapz Admin",
    actorRole: "owner",
    note: `Archived product "${target.name}" (${id})`,
  });

  saveDatabase(db);
  if (isPostgresConfigured) {
    pgDeleteProduct(id).catch((e) => console.warn("[Postgres] delete product error:", e));
  }
  return true;
}

// ── Orders API ───────────────────────────────────────────────────────────────

export async function getOrders(filters?: {
  status?: string;
  email?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<OrderRequest[]> {
  let list: OrderRequest[] = [];
  if (isPostgresConfigured) {
    try {
      const pgOrders = await pgGetOrders();
      if (pgOrders && pgOrders.length > 0) {
        list = pgOrders;
      }
    } catch (e) {
      console.warn("[Postgres] getOrders fallback:", e);
    }
  }

  if (!list.length) {
    const db = loadDatabase();
    list = db.orders;
  }

  if (filters?.status && filters.status !== "all") {
    list = list.filter((o) => o.status === filters.status);
  }

  if (filters?.email) {
    const email = filters.email.toLowerCase().trim();
    list = list.filter((o) => o.customer.email.toLowerCase() === email);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (o) =>
        o.reference.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q)
    );
  }

  if (filters?.startDate) {
    const start = new Date(filters.startDate).getTime();
    list = list.filter((o) => new Date(o.createdAt).getTime() >= start);
  }

  if (filters?.endDate) {
    const end = new Date(filters.endDate).getTime();
    list = list.filter((o) => new Date(o.createdAt).getTime() <= end);
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getOrderByReference(reference: string): Promise<OrderRequest | null> {
  const cleanRef = reference.trim().toUpperCase();
  if (isPostgresConfigured) {
    try {
      const pgOrders = await pgGetOrders();
      if (pgOrders && pgOrders.length > 0) {
        const found = pgOrders.find(
          (o) => o.reference.toUpperCase() === cleanRef || o.id === reference
        );
        if (found) return found;
      }
    } catch (e) {
      console.warn("[Postgres] getOrderByReference fallback:", e);
    }
  }

  const db = loadDatabase();
  const found = db.orders.find(
    (o) => o.reference.toUpperCase() === cleanRef || o.id === reference
  );
  return found || null;
}

export async function createOrder(data: {
  items: BagItem[];
  customer: CustomerInfo;
  deliveryDate?: string;
  deliverySlot?: string;
  notes?: string;
  couponCode?: string;
  discountAmount?: number;
  customOrderId?: string;
}): Promise<OrderRequest> {
  const db = loadDatabase();
  const reference = generateOrderReference();
  const id = `order-${Date.now()}`;
  const now = new Date().toISOString();

  // Calculate Subtotal & Total
  const subtotal = data.items.reduce(
    (sum, item) => sum + (item.product.price || 0) * (item.quantity || 1),
    0
  );
  const discount = data.discountAmount || 0;
  const totalAmount = Math.max(0, subtotal - discount);

  const newOrder: OrderRequest = {
    id,
    reference,
    status: "pending",
    items: data.items,
    customer: data.customer,
    deliveryDate: data.deliveryDate,
    deliverySlot: data.deliverySlot || "Morning (9:00 AM - 12:00 PM)",
    notes: data.notes,
    subtotal,
    discountAmount: discount,
    couponCode: data.couponCode,
    totalAmount,
    customOrderId: data.customOrderId,
    paymentMethod: "Zero Online Payment — WhatsApp Confirmed",
    paymentStatus: "pending",
    createdAt: now,
    updatedAt: now,
    statusHistory: [],
  };

  db.orders.unshift(newOrder);

  // Automatically update stock levels and log inventory movements
  for (const item of data.items) {
    const prod = db.products.find((p) => p.id === item.product.id);
    if (prod && prod.stockQuantity !== undefined) {
      const prevStock = prod.stockQuantity;
      prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
      prod.inStock = prod.stockQuantity > 0;
      if (isPostgresConfigured) {
        pgSaveProduct(prod).catch((e) => console.warn("[Postgres] stock sync error:", e));
      }
      db.inventoryMovements.unshift({
        id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        productId: prod.id,
        productName: prod.name,
        change: -item.quantity,
        previousStock: prevStock,
        newStock: prod.stockQuantity,
        reason: "order_fulfillment",
        actorName: "Customer Checkout",
        actorRole: "customer",
        referenceId: reference,
        timestamp: now,
      });

      // Low stock warning notification
      if (prod.stockQuantity <= (prod.lowStockThreshold || 5)) {
        createNotification({
          title: `Low Stock Alert: ${prod.name}`,
          message: `Only ${prod.stockQuantity} blooms remaining in studio inventory.`,
          type: "low_stock",
          referenceId: prod.id,
          link: "/admin/inventory",
        });
      }
    }
  }

  // Create Admin Notification
  createNotification({
    title: `New Order Received (${reference})`,
    message: `${data.customer.name} ordered ${data.items.length} gift items for ₹${totalAmount}.`,
    type: "order",
    referenceId: id,
    link: `/admin/orders/${id}`,
  });

  logAudit({
    orderId: id,
    reference,
    action: "ORDER_CREATED",
    toStatus: "pending",
    actorName: data.customer.name,
    actorRole: "customer",
    note: `New request created for ${data.items.length} items. Total: ₹${totalAmount}`,
  });

  saveDatabase(db);
  if (isPostgresConfigured) {
    pgSaveOrder(newOrder).catch((e) => console.warn("[Postgres] pgSaveOrder error:", e));
  }
  return newOrder;
}

export async function updateOrderStatus(
  referenceOrId: string,
  newStatus: OrderStatus,
  actorName: string = "Happiwrapz Owner",
  actorRole: string = "owner",
  note?: string
): Promise<OrderRequest | null> {
  const db = loadDatabase();
  const cleanRef = referenceOrId.trim().toUpperCase();
  const order = db.orders.find(
    (o) => o.reference.toUpperCase() === cleanRef || o.id === referenceOrId
  );

  if (!order) return null;

  const prevStatus = order.status;
  const now = new Date().toISOString();

  order.status = newStatus;
  order.updatedAt = now;

  if (newStatus === "delivered") {
    order.paymentStatus = "paid";
  } else if (newStatus === "cancelled") {
    order.paymentStatus = "refunded";
  }

  const historyEntry: StatusChange = {
    from: prevStatus,
    to: newStatus,
    timestamp: now,
    by: actorName,
    note: note || `Order advanced to ${newStatus}`,
  };

  if (!order.statusHistory) {
    order.statusHistory = [];
  }
  order.statusHistory.push(historyEntry);

  logAudit({
    orderId: order.id,
    reference: order.reference,
    action: "STATUS_TRANSITION",
    fromStatus: prevStatus,
    toStatus: newStatus,
    actorName,
    actorRole,
    note: note || `Status advanced from ${prevStatus} to ${newStatus}`,
  });

  saveDatabase(db);
  if (isPostgresConfigured) {
    pgSaveOrder(order).catch((e) => console.warn("[Postgres] pgSaveOrder error:", e));
  }
  return order;
}

export async function addOrderInternalNote(
  orderId: string,
  note: string,
  actorName: string
): Promise<OrderRequest | null> {
  const db = loadDatabase();
  const order = db.orders.find((o) => o.id === orderId || o.reference === orderId);
  if (!order) return null;

  const now = new Date().toISOString();
  order.internalNotes = order.internalNotes
    ? `${order.internalNotes}\n[${new Date().toLocaleTimeString()} ${actorName}]: ${note}`
    : `[${new Date().toLocaleTimeString()} ${actorName}]: ${note}`;
  order.updatedAt = now;

  logAudit({
    orderId: order.id,
    reference: order.reference,
    action: "INTERNAL_NOTE_ADDED",
    actorName,
    actorRole: "admin",
    note: `Added internal note: ${note.substring(0, 50)}...`,
  });

  saveDatabase(db);
  if (isPostgresConfigured) {
    pgSaveOrder(order).catch((e) => console.warn("[Postgres] pgSaveOrder error:", e));
  }
  return order;
}

export async function updateOrderTracking(
  referenceOrId: string,
  tracking: {
    trackingUrl?: string;
    trackingNumber?: string;
    courierName?: string;
  },
  actorName: string = "Happiwrapz Owner"
): Promise<OrderRequest | null> {
  const db = loadDatabase();
  const cleanRef = referenceOrId.trim().toUpperCase();
  const order = db.orders.find(
    (o) => o.reference.toUpperCase() === cleanRef || o.id === referenceOrId
  );
  if (!order) return null;

  const now = new Date().toISOString();
  order.trackingUrl = tracking.trackingUrl?.trim() || undefined;
  order.trackingNumber = tracking.trackingNumber?.trim() || undefined;
  order.courierName = tracking.courierName?.trim() || undefined;
  order.updatedAt = now;

  logAudit({
    orderId: order.id,
    reference: order.reference,
    action: "TRACKING_UPDATED",
    actorName,
    actorRole: "admin",
    note: `Updated tracking: Courier=${order.courierName || "N/A"}, ID=${order.trackingNumber || "N/A"}`,
  });

  saveDatabase(db);
  if (isPostgresConfigured) {
    pgSaveOrder(order).catch((e) => console.warn("[Postgres] pgSaveOrder error:", e));
  }
  return order;
}

// ── Advanced Custom Orders & Quotations API (Phase 6) ────────────────────────

export async function getCustomOrders(filters?: {
  status?: string;
  search?: string;
}): Promise<CustomOrderRequest[]> {
  let list: CustomOrderRequest[] = [];
  if (isPostgresConfigured) {
    try {
      const pgCustom = await pgGetCustomOrders();
      if (pgCustom && pgCustom.length > 0) {
        list = pgCustom;
      }
    } catch (e) {
      console.warn("[Postgres] getCustomOrders fallback:", e);
    }
  }

  if (!list.length) {
    const db = loadDatabase();
    list = db.customOrders;
  }

  if (filters?.status && filters.status !== "all") {
    list = list.filter((c) => c.status === filters.status);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (c) =>
        c.reference.toLowerCase().includes(q) ||
        c.customer.name.toLowerCase().includes(q) ||
        c.customer.phone.toLowerCase().includes(q) ||
        c.occasion.toLowerCase().includes(q) ||
        c.productType.toLowerCase().includes(q)
    );
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getCustomOrderById(idOrRef: string): Promise<CustomOrderRequest | null> {
  const clean = idOrRef.trim().toUpperCase();
  if (isPostgresConfigured) {
    try {
      const pgCustom = await pgGetCustomOrders();
      if (pgCustom && pgCustom.length > 0) {
        const found = pgCustom.find(
          (c) => c.id === idOrRef || c.reference.toUpperCase() === clean
        );
        if (found) return found;
      }
    } catch (e) {
      console.warn("[Postgres] getCustomOrderById fallback:", e);
    }
  }

  const db = loadDatabase();
  const found = db.customOrders.find(
    (c) => c.id === idOrRef || c.reference.toUpperCase() === clean
  );
  return found || null;
}

export async function createCustomOrder(data: {
  customer: CustomerInfo;
  occasion: string;
  productType: string;
  flowerPreferences: string;
  stemCount: number;
  wrappingStyle: string;
  boxStyle?: string;
  personalizationText: string;
  giftMessage?: string;
  budget: number;
  desiredDeliveryDate: string;
  desiredDeliverySlot?: string;
  specialInstructions?: string;
}): Promise<CustomOrderRequest> {
  const db = loadDatabase();
  const id = `cust-${Date.now()}`;
  const reference = `CUST-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  const now = new Date().toISOString();

  const newCustom: CustomOrderRequest = {
    ...data,
    id,
    reference,
    status: "new",
    assignedAdmin: "Happiwrapz Owner",
    quotation: null,
    convertedOrderId: null,
    createdAt: now,
    updatedAt: now,
    statusHistory: [],
  };

  db.customOrders.unshift(newCustom);

  createNotification({
    title: `New Custom Commission Request (${reference})`,
    message: `${data.customer.name} commissioned ${data.stemCount} stems for ${data.occasion}. Budget: ₹${data.budget}`,
    type: "custom_order",
    referenceId: id,
    link: `/admin/custom-orders/${id}`,
  });

  logAudit({
    action: "CUSTOM_ORDER_CREATED",
    actorName: data.customer.name,
    actorRole: "customer",
    note: `Created custom commission request ${reference} (${data.occasion})`,
  });

  saveDatabase(db);
  if (isPostgresConfigured) {
    pgSaveCustomOrder(newCustom).catch((e) => console.warn("[Postgres] save custom order error:", e));
  }
  return newCustom;
}

export async function updateCustomOrderStatus(
  id: string,
  newStatus: CustomOrderRequest["status"],
  actorName: string,
  actorRole: string,
  note?: string
): Promise<CustomOrderRequest | null> {
  const db = loadDatabase();
  const custom = db.customOrders.find((c) => c.id === id || c.reference === id);
  if (!custom) return null;

  const prev = custom.status;
  const now = new Date().toISOString();

  custom.status = newStatus;
  custom.updatedAt = now;
  custom.statusHistory.push({
    from: prev,
    to: newStatus,
    timestamp: now,
    by: actorName,
    note: note || `Custom status changed to ${newStatus}`,
  });

  logAudit({
    action: "CUSTOM_ORDER_STATUS_CHANGED",
    actorName,
    actorRole,
    note: `Custom order ${custom.reference} status changed from ${prev} to ${newStatus}`,
  });

  saveDatabase(db);
  if (isPostgresConfigured) {
    pgSaveCustomOrder(custom).catch((e) => console.warn("[Postgres] update custom order error:", e));
  }
  return custom;
}

export async function saveQuotation(
  customOrderId: string,
  quoteData: Omit<Quotation, "id" | "customOrderId" | "createdAt" | "updatedAt">
): Promise<Quotation | null> {
  const db = loadDatabase();
  const custom = db.customOrders.find((c) => c.id === customOrderId);
  if (!custom) return null;

  const now = new Date().toISOString();
  const quoteId = custom.quotation?.id || `quote-${Date.now()}`;

  const quotation: Quotation = {
    ...quoteData,
    id: quoteId,
    customOrderId,
    createdAt: custom.quotation?.createdAt || now,
    updatedAt: now,
  };

  custom.quotation = quotation;
  custom.status = quoteData.status === "sent" ? "quote_sent" : "quote_draft";
  custom.updatedAt = now;

  // Track in quotations list
  const existingQuoteIdx = db.quotations.findIndex((q) => q.id === quoteId);
  if (existingQuoteIdx >= 0) {
    db.quotations[existingQuoteIdx] = quotation;
  } else {
    db.quotations.push(quotation);
  }

  logAudit({
    action: "QUOTATION_SAVED",
    actorName: "Happiwrapz Owner",
    actorRole: "owner",
    note: `Saved quotation ${quoteId} for custom order ${custom.reference}. Total: ₹${quotation.total}`,
  });

  saveDatabase(db);
  if (isPostgresConfigured) {
    pgSaveCustomOrder(custom).catch((e) => console.warn("[Postgres] save quotation error:", e));
  }
  return quotation;
}

export async function convertCustomOrderToStandardOrder(
  customOrderId: string,
  actorName: string,
  actorRole: string
): Promise<{ success: boolean; order?: OrderRequest; error?: string }> {
  const db = loadDatabase();
  const custom = db.customOrders.find((c) => c.id === customOrderId);

  if (!custom) {
    return { success: false, error: "Custom order not found" };
  }

  if (custom.convertedOrderId) {
    return {
      success: false,
      error: `Custom request already converted into order ${custom.convertedOrderId}`,
    };
  }

  if (!custom.quotation) {
    return { success: false, error: "Cannot convert to order without an agreed quotation." };
  }

  // Construct standard order atomic transaction
  const reference = generateOrderReference();
  const orderId = `order-${Date.now()}`;
  const now = new Date().toISOString();

  // Create virtual product representation for this custom build
  const customProduct: Product = {
    id: `prod-custom-${custom.id}`,
    slug: `bespoke-${custom.reference.toLowerCase()}`,
    name: `Bespoke Floral Commission (${custom.stemCount} Blooms — ${custom.occasion})`,
    category: "Custom Order",
    description: `${custom.flowerPreferences} in ${custom.wrappingStyle}. Custom Ribbon: "${custom.personalizationText}".`,
    price: custom.quotation.total,
    images: ["https://res.cloudinary.com/w8fw2mbb/image/upload/v1793881756/happiwrapz/products/rose-bouquet-1.jpg"],
    inStock: true,
    featured: false,
    options: [],
    isMadeToOrder: true,
  };

  const newOrder: OrderRequest = {
    id: orderId,
    reference,
    status: "confirmed",
    items: [
      {
        product: customProduct,
        quantity: 1,
        selectedOptions: {},
        giftMessage: custom.giftMessage,
      },
    ],
    customer: custom.customer,
    deliveryDate: custom.desiredDeliveryDate,
    deliverySlot: custom.desiredDeliverySlot || "Morning (9:00 AM - 12:00 PM)",
    notes: `Converted from Custom Request ${custom.reference}. Instructions: ${custom.specialInstructions || "None"}`,
    subtotal: custom.quotation.total,
    discountAmount: custom.quotation.discount,
    totalAmount: custom.quotation.total,
    customOrderId: custom.id,
    paymentMethod: "Zero Online Charge — WhatsApp Confirmed",
    paymentStatus: "confirmed_whatsapp",
    createdAt: now,
    updatedAt: now,
    statusHistory: [
      {
        from: "pending",
        to: "confirmed",
        timestamp: now,
        by: actorName,
        note: `Direct conversion from accepted quotation for ${custom.reference}`,
      },
    ],
  };

  // Atomic state commit
  custom.convertedOrderId = orderId;
  custom.status = "in_production";
  if (custom.quotation) {
    custom.quotation.status = "accepted";
  }

  db.orders.unshift(newOrder);

  createNotification({
    title: `Custom Request Converted (${reference})`,
    message: `Commission ${custom.reference} converted into confirmed Order ${reference} (₹${newOrder.totalAmount}).`,
    type: "quote_accepted",
    referenceId: orderId,
    link: `/admin/orders/${orderId}`,
  });

  logAudit({
    orderId,
    reference,
    action: "CUSTOM_ORDER_CONVERTED",
    actorName,
    actorRole,
    note: `Converted custom commission ${custom.reference} into standard order ${reference}`,
  });

  saveDatabase(db);
  return { success: true, order: newOrder };
}

// ── Inventory Management API (Phase 8) ──────────────────────────────────────

export async function getInventoryStatus(): Promise<{
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  healthyItems: number;
  products: Product[];
}> {
  const db = loadDatabase();
  const products = db.products.filter((p) => !p.archived);

  let lowStock = 0;
  let outOfStock = 0;
  let healthy = 0;

  for (const p of products) {
    const qty = p.stockQuantity ?? 0;
    const threshold = p.lowStockThreshold ?? 8;
    if (qty <= 0) {
      outOfStock++;
    } else if (qty <= threshold) {
      lowStock++;
    } else {
      healthy++;
    }
  }

  return {
    totalItems: products.length,
    lowStockItems: lowStock,
    outOfStockItems: outOfStock,
    healthyItems: healthy,
    products,
  };
}

export async function adjustStock(data: {
  productId: string;
  change: number;
  reason: InventoryMovement["reason"];
  actorName: string;
  actorRole: string;
  referenceId?: string;
}): Promise<Product | null> {
  const db = loadDatabase();
  const prod = db.products.find((p) => p.id === data.productId);
  if (!prod) return null;

  const previousStock = prod.stockQuantity || 0;
  const newStock = Math.max(0, previousStock + data.change);
  prod.stockQuantity = newStock;
  prod.inStock = newStock > 0;

  const movement: InventoryMovement = {
    id: `inv-${Date.now()}`,
    productId: prod.id,
    productName: prod.name,
    change: data.change,
    previousStock,
    newStock,
    reason: data.reason,
    actorName: data.actorName,
    actorRole: data.actorRole,
    referenceId: data.referenceId,
    timestamp: new Date().toISOString(),
  };

  db.inventoryMovements.unshift(movement);

  logAudit({
    action: "INVENTORY_ADJUSTED",
    actorName: data.actorName,
    actorRole: data.actorRole,
    note: `Adjusted "${prod.name}" by ${data.change > 0 ? "+" : ""}${data.change} (Reason: ${data.reason}). New stock: ${newStock}`,
  });

  saveDatabase(db);
  if (isPostgresConfigured) {
    pgSaveProduct(prod).catch((e) => console.warn("[Postgres] stock sync error:", e));
  }
  return prod;
}

export async function getInventoryMovements(productId?: string): Promise<InventoryMovement[]> {
  const db = loadDatabase();
  if (productId) {
    return db.inventoryMovements.filter((m) => m.productId === productId);
  }
  return db.inventoryMovements;
}

// ── Discounts and Coupons API (Phase 10) ────────────────────────────────────

export async function getCoupons(activeOnly: boolean = false): Promise<Coupon[]> {
  if (isPostgresConfigured) {
    try {
      const pgCoups = await pgGetCoupons();
      if (pgCoups && pgCoups.length > 0) {
        if (activeOnly) {
          const now = new Date().toISOString();
          return pgCoups.filter((c: any) => c.active && (!c.validUntil || c.validUntil >= now));
        }
        return pgCoups;
      }
    } catch (e) {
      console.warn("[Postgres] getCoupons fallback:", e);
    }
  }

  const db = loadDatabase();
  if (activeOnly) {
    const now = new Date().toISOString();
    return db.coupons.filter(
      (c) => c.active && c.validFrom <= now && c.validUntil >= now && c.usedCount < c.usageLimit
    );
  }
  return db.coupons;
}

export async function createCoupon(data: Omit<Coupon, "id" | "usedCount" | "createdAt">): Promise<Coupon> {
  const db = loadDatabase();
  const cleanCode = data.code.trim().toUpperCase();

  const existing = db.coupons.find((c) => c.code === cleanCode);
  if (existing) {
    throw new Error(`Coupon code "${cleanCode}" already exists.`);
  }

  const newCoupon: Coupon = {
    ...data,
    code: cleanCode,
    id: `coup-${Date.now()}`,
    usedCount: 0,
    createdAt: new Date().toISOString(),
  };

  db.coupons.unshift(newCoupon);

  logAudit({
    action: "COUPON_CREATED",
    actorName: "Happiwrapz Admin",
    actorRole: "owner",
    note: `Created coupon ${cleanCode} (${data.type === "percentage" ? `${data.value}%` : `₹${data.value}`})`,
  });

  saveDatabase(db);
  if (isPostgresConfigured) {
    pgSaveCoupon(newCoupon).catch((e) => console.warn("[Postgres] save coupon error:", e));
  }
  return newCoupon;
}

export async function updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon | null> {
  const db = loadDatabase();
  const idx = db.coupons.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  db.coupons[idx] = { ...db.coupons[idx], ...updates, id };
  saveDatabase(db);
  if (isPostgresConfigured) {
    pgSaveCoupon(db.coupons[idx]).catch((e) => console.warn("[Postgres] update coupon error:", e));
  }
  return db.coupons[idx];
}

export async function deleteCoupon(id: string): Promise<boolean> {
  const db = loadDatabase();
  const initial = db.coupons.length;
  db.coupons = db.coupons.filter((c) => c.id !== id);
  if (db.coupons.length < initial) {
    saveDatabase(db);
    return true;
  }
  return false;
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{ valid: boolean; discount: number; message: string; coupon?: Coupon }> {
  const db = loadDatabase();
  const clean = code.trim().toUpperCase();
  const coupon = db.coupons.find((c) => c.code === clean);

  if (!coupon) {
    return { valid: false, discount: 0, message: "Invalid coupon code." };
  }

  if (!coupon.active) {
    return { valid: false, discount: 0, message: "This coupon is currently inactive." };
  }

  const now = new Date().toISOString();
  if (coupon.validFrom > now || coupon.validUntil < now) {
    return { valid: false, discount: 0, message: "This coupon has expired." };
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, discount: 0, message: "Coupon usage limit reached." };
  }

  if (subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon.`,
    };
  }

  let discount =
    coupon.type === "percentage"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;

  if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
    discount = coupon.maxDiscountAmount;
  }

  return {
    valid: true,
    discount,
    message: `Coupon "${clean}" applied successfully! (₹${discount} savings)`,
    coupon,
  };
}

// ── Notifications API (Phase 13) ────────────────────────────────────────────

export async function getNotifications(unreadOnly: boolean = false): Promise<AdminNotification[]> {
  const db = loadDatabase();
  if (unreadOnly) {
    return db.notifications.filter((n) => !n.isRead);
  }
  return db.notifications;
}

export function createNotification(
  data: Omit<AdminNotification, "id" | "isRead" | "createdAt">
): AdminNotification {
  const db = loadDatabase();
  const notif: AdminNotification = {
    ...data,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  db.notifications.unshift(notif);
  // Keep last 100 notifications
  if (db.notifications.length > 100) {
    db.notifications = db.notifications.slice(0, 100);
  }

  saveDatabase(db);
  return notif;
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  const db = loadDatabase();
  const notif = db.notifications.find((n) => n.id === id);
  if (notif) {
    notif.isRead = true;
    saveDatabase(db);
    return true;
  }
  return false;
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
  const db = loadDatabase();
  db.notifications.forEach((n) => {
    n.isRead = true;
  });
  saveDatabase(db);
  return true;
}

// ── Website Content Customization (Phase 11) ────────────────────────────────

export async function getWebsiteSettings(): Promise<WebsiteSettings> {
  if (isPostgresConfigured) {
    try {
      const pgSettings = await pgGetWebsiteSettings();
      if (pgSettings) return pgSettings;
    } catch (e) {
      console.warn("[Postgres] getWebsiteSettings fallback:", e);
    }
  }

  const db = loadDatabase();
  return db.websiteSettings;
}

export async function updateWebsiteSettings(
  updates: Partial<WebsiteSettings>,
  actorName: string
): Promise<WebsiteSettings> {
  const db = loadDatabase();
  db.websiteSettings = {
    ...db.websiteSettings,
    ...updates,
    publishedAt: new Date().toISOString(),
    updatedBy: actorName,
  };

  logAudit({
    action: "WEBSITE_SETTINGS_PUBLISHED",
    actorName,
    actorRole: "owner",
    note: `Updated storefront settings (${Object.keys(updates).join(", ")})`,
  });

  saveDatabase(db);
  if (isPostgresConfigured) {
    pgSaveWebsiteSettings(db.websiteSettings).catch((e) => console.warn("[Postgres] save website settings error:", e));
  }
  return db.websiteSettings;
}

// ── Business Analytics & Dashboard Aggregation (Phase 4 & 12) ────────────────

export async function getDashboardAnalytics(period: string = "30d"): Promise<{
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
    bestSeller: { name: string; units: number; revenue: number };
  };
  revenueOverTime: Array<{ date: string; revenue: number; orders: number }>;
  ordersByStatus: Array<{ status: string; count: number; percentage: number }>;
  revenueByCategory: Array<{ category: string; revenue: number }>;
  customOrderFunnel: {
    totalRequests: number;
    quotesSent: number;
    accepted: number;
    conversionRate: number;
  };
  lowStockItems: Product[];
  recentOrders: OrderRequest[];
}> {
  const db = loadDatabase();
  const now = Date.now();

  let days = 30;
  if (period === "today") days = 1;
  else if (period === "yesterday") days = 2;
  else if (period === "7d") days = 7;
  else if (period === "this_month") days = 30;
  else if (period === "this_year") days = 365;

  const cutoff = now - days * 24 * 60 * 60 * 1000;

  // Filter orders by period
  const scopedOrders = db.orders.filter(
    (o) => new Date(o.createdAt).getTime() >= cutoff
  );

  // Exclude cancelled orders from recognized revenue
  const nonCancelled = scopedOrders.filter((o) => o.status !== "cancelled");
  const completed = scopedOrders.filter((o) => o.status === "delivered");
  const pending = scopedOrders.filter((o) => o.status === "pending");
  const cancelled = scopedOrders.filter((o) => o.status === "cancelled");

  const totalRevenue = nonCancelled.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrders = scopedOrders.length;
  const averageOrderValue = nonCancelled.length > 0 ? Math.round(totalRevenue / nonCancelled.length) : 0;

  // Unique customers
  const customerSet = new Set<string>();
  db.orders.forEach((o) => customerSet.add(o.customer.email.toLowerCase()));
  const totalCustomers = customerSet.size;

  // Product sales calculation for best seller and revenue by category
  const productSalesMap = new Map<string, { name: string; units: number; revenue: number; category: string }>();
  const categoryRevenueMap = new Map<string, number>();

  for (const o of nonCancelled) {
    for (const item of o.items) {
      const pid = item.product.id;
      const pname = item.product.name;
      const cat = item.product.category || "Bouquets";
      const lineRev = item.product.price * item.quantity;

      // Product sales
      const existingProd = productSalesMap.get(pid) || {
        name: pname,
        units: 0,
        revenue: 0,
        category: cat,
      };
      existingProd.units += item.quantity;
      existingProd.revenue += lineRev;
      productSalesMap.set(pid, existingProd);

      // Category sales
      categoryRevenueMap.set(cat, (categoryRevenueMap.get(cat) || 0) + lineRev);
    }
  }

  let bestSeller = { name: "Handcrafted Ribbon Rose Bouquet", units: 0, revenue: 0 };
  for (const p of productSalesMap.values()) {
    if (p.units > bestSeller.units) {
      bestSeller = { name: p.name, units: p.units, revenue: p.revenue };
    }
  }

  // Revenue over time (daily buckets)
  const dateMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = Math.min(days, 14) - 1; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    dateMap.set(key, { revenue: 0, orders: 0 });
  }

  for (const o of scopedOrders) {
    const d = o.createdAt.split("T")[0];
    if (dateMap.has(d)) {
      const cur = dateMap.get(d)!;
      cur.orders += 1;
      if (o.status !== "cancelled") {
        cur.revenue += o.totalAmount || 0;
      }
    }
  }

  const revenueOverTime = Array.from(dateMap.entries()).map(([date, val]) => ({
    date,
    revenue: val.revenue,
    orders: val.orders,
  }));

  // Orders by Status
  const statusCounts = new Map<string, number>();
  for (const o of scopedOrders) {
    statusCounts.set(o.status, (statusCounts.get(o.status) || 0) + 1);
  }
  const ordersByStatus = Array.from(statusCounts.entries()).map(([status, count]) => ({
    status,
    count,
    percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
  }));

  // Revenue by Category
  const revenueByCategory = Array.from(categoryRevenueMap.entries()).map(
    ([category, revenue]) => ({ category, revenue })
  );

  // Custom order conversion funnel
  const totalCustomRequests = db.customOrders.length;
  const quotesSent = db.customOrders.filter((c) => c.quotation !== null).length;
  const acceptedCustom = db.customOrders.filter(
    (c) => c.status === "accepted" || c.status === "in_production" || c.status === "ready" || c.status === "delivered" || c.convertedOrderId !== null
  ).length;

  const customOrderFunnel = {
    totalRequests: totalCustomRequests,
    quotesSent,
    accepted: acceptedCustom,
    conversionRate: totalCustomRequests > 0 ? Math.round((acceptedCustom / totalCustomRequests) * 100) : 0,
  };

  // Low stock products
  const lowStockItems = db.products.filter(
    (p) => !p.archived && (p.stockQuantity ?? 0) <= (p.lowStockThreshold ?? 8)
  );

  return {
    kpis: {
      totalRevenue,
      totalOrders,
      pendingOrders: pending.length,
      completedOrders: completed.length,
      cancelledOrders: cancelled.length,
      totalCustomers,
      averageOrderValue,
      bestSeller,
    },
    revenueOverTime,
    ordersByStatus,
    revenueByCategory,
    customOrderFunnel,
    lowStockItems,
    recentOrders: db.orders.slice(0, 5),
  };
}

// ── Audit Logs API ───────────────────────────────────────────────────────────

export function logAudit(entry: Omit<AuditLogEntry, "id" | "timestamp">) {
  const db = loadDatabase();
  const audit: AuditLogEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(audit);
}

export async function getAuditLogs(orderId?: string): Promise<AuditLogEntry[]> {
  const db = loadDatabase();
  if (orderId) {
    return db.auditLogs.filter(
      (a) => a.orderId === orderId || a.reference === orderId
    );
  }
  return db.auditLogs;
}

// ── Contact Inquiries API ────────────────────────────────────────────────────

export async function createContactMessage(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<ContactMessage> {
  const db = loadDatabase();
  const newMsg: ContactMessage = {
    id: `msg-${Date.now()}`,
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone?.trim(),
    subject: data.subject?.trim() || "General Inquiry",
    message: data.message.trim(),
    createdAt: new Date().toISOString(),
    status: "unread",
  };

  db.contacts.unshift(newMsg);
  createNotification({
    title: `New Message from ${newMsg.name}`,
    message: newMsg.message.substring(0, 80) + "...",
    type: "contact",
    referenceId: newMsg.id,
    link: `/admin`,
  });

  logAudit({
    action: "CONTACT_MESSAGE_RECEIVED",
    actorName: data.name,
    actorRole: "customer",
    note: `New message from ${data.email} regarding "${newMsg.subject}"`,
  });

  saveDatabase(db);
  if (isPostgresConfigured) {
    pgSaveContact(newMsg).catch((e) => console.warn("[Postgres] save contact error:", e));
  }
  return newMsg;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const db = loadDatabase();
  return db.contacts;
}

// ── Newsletter Subscribers API ───────────────────────────────────────────────

export async function addSubscriber(email: string): Promise<{ success: boolean; message: string }> {
  const db = loadDatabase();
  const cleanEmail = email.trim().toLowerCase();

  const existing = db.subscribers.find((s) => s.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: true, message: "You are already subscribed to the Happiwrapz floral circle!" };
  }

  const newSub = {
    id: `sub-${Date.now()}`,
    email: cleanEmail,
    subscribedAt: new Date().toISOString(),
    active: true,
  };

  db.subscribers.push(newSub);

  saveDatabase(db);
  if (isPostgresConfigured) {
    pgSaveSubscriber(newSub).catch((e) => console.warn("[Postgres] save subscriber error:", e));
  }
  return { success: true, message: "Welcome to the Happiwrapz floral circle!" };
}

export async function getSubscribers(): Promise<Subscriber[]> {
  const db = loadDatabase();
  return db.subscribers;
}

// ── Users / Auth API ─────────────────────────────────────────────────────────

export async function getUserByEmail(email: string): Promise<User | null> {
  const clean = email.trim().toLowerCase();
  if (isPostgresConfigured) {
    try {
      const pgUsers = await pgGetUsers();
      if (pgUsers && pgUsers.length > 0) {
        const found = pgUsers.find((u) => u.email.toLowerCase() === clean);
        if (found) return found;
      }
    } catch (e) {
      console.warn("[Postgres] getUserByEmail fallback:", e);
    }
  }

  const db = loadDatabase();
  const found = db.users.find((u) => u.email.toLowerCase() === clean);
  return found || null;
}

export function sanitizeUser(user: User): User {
  const { passwordHash, ...safe } = user;
  return {
    ...safe,
    hasPassword: !!passwordHash,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const db = loadDatabase();
  const found = db.users.find((u) => u.id === id);
  return found || null;
}

export async function getUsers(): Promise<User[]> {
  if (isPostgresConfigured) {
    try {
      const pgUsers = await pgGetUsers();
      if (pgUsers && pgUsers.length > 0) return pgUsers.map(sanitizeUser);
    } catch (e) {
      console.warn("[Postgres] getUsers fallback:", e);
    }
  }

  const db = loadDatabase();
  return db.users.map(sanitizeUser);
}

export async function updateUserRole(userId: string, newRole: User["role"]): Promise<User | null> {
  const db = loadDatabase();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;

  user.role = newRole;
  logAudit({
    action: "USER_ROLE_CHANGED",
    actorName: "Happiwrapz Owner",
    actorRole: "owner",
    note: `Changed ${user.name} role to ${newRole}`,
  });

  saveDatabase(db);
  if (isPostgresConfigured) {
    pgSaveUser(user).catch((e) => console.warn("[Postgres] update user error:", e));
  }
  return sanitizeUser(user);
}

export async function updateUserPassword(
  userId: string,
  newPassword: string,
  actorName: string
): Promise<User | null> {
  const db = loadDatabase();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;

  user.passwordHash = hashPassword(newPassword);
  user.hasPassword = true;
  user.passwordUpdatedAt = new Date().toISOString();
  user.passwordSetBy = actorName;

  logAudit({
    action: "USER_PASSWORD_RESET_BY_ADMIN",
    actorName,
    actorRole: "owner",
    note: `Admin ${actorName} set/reset security password for staff ${user.email} (${user.name})`,
  });

  saveDatabase(db);
  if (isPostgresConfigured) {
    pgSaveUser(user).catch((e) => console.warn("[Postgres] update user password error:", e));
  }
  return sanitizeUser(user);
}

export async function createUser(data: {
  email: string;
  name: string;
  role?: User["role"];
  password?: string;
  actorName?: string;
}): Promise<User> {
  const db = loadDatabase();
  const clean = data.email.trim().toLowerCase();

  const existing = db.users.find((u) => u.email.toLowerCase() === clean);
  if (existing) {
    if (data.password) {
      existing.passwordHash = hashPassword(data.password);
      existing.hasPassword = true;
      existing.passwordUpdatedAt = new Date().toISOString();
      existing.passwordSetBy = data.actorName || "admin";
      saveDatabase(db);
    }
    return sanitizeUser(existing);
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    email: clean,
    name: data.name.trim(),
    role: data.role || "customer",
    createdAt: new Date().toISOString(),
  };

  if (data.password) {
    newUser.passwordHash = hashPassword(data.password);
    newUser.hasPassword = true;
    newUser.passwordUpdatedAt = new Date().toISOString();
    newUser.passwordSetBy = data.actorName || "admin";
  }

  db.users.push(newUser);
  saveDatabase(db);
  if (isPostgresConfigured) {
    pgSaveUser(newUser).catch((e) => console.warn("[Postgres] save user error:", e));
  }
  return sanitizeUser(newUser);
}

export async function deleteUser(userId: string): Promise<boolean> {
  const db = loadDatabase();
  const initialLength = db.users.length;
  db.users = db.users.filter((u) => u.id !== userId);
  if (db.users.length !== initialLength) {
    logAudit({
      action: "USER_DELETED",
      actorName: "Happiwrapz Owner",
      actorRole: "owner",
      note: `Removed user id ${userId} from team access`,
    });
    saveDatabase(db);
    return true;
  }
  return false;
}


// ── Payments & Transactions ──────────────────────────────────────────────────

export async function recordPayment(payment: Omit<PaymentRecord, "id" | "createdAt" | "updatedAt">): Promise<PaymentRecord> {
  const db = loadDatabase();
  const now = new Date().toISOString();
  const newPayment: PaymentRecord = {
    ...payment,
    id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };

  db.payments = db.payments || [];
  db.payments.push(newPayment);
  saveDatabase(db);

  if (isPostgresConfigured) {
    pgSavePayment(newPayment).catch((e) => console.warn("[Postgres] save payment error:", e));
  }
  return newPayment;
}

export async function getPayments(orderId?: string): Promise<PaymentRecord[]> {
  const db = loadDatabase();
  db.payments = db.payments || [];
  if (orderId) {
    return db.payments.filter((p) => p.orderId === orderId || p.orderReference === orderId);
  }
  return db.payments;
}

// ── Returns & Refunds ────────────────────────────────────────────────────────

export async function recordReturn(ret: Omit<ReturnRecord, "id" | "createdAt" | "updatedAt">): Promise<ReturnRecord> {
  const db = loadDatabase();
  const now = new Date().toISOString();
  const newReturn: ReturnRecord = {
    ...ret,
    id: `ret-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  };

  db.returns = db.returns || [];
  db.returns.push(newReturn);
  saveDatabase(db);

  if (isPostgresConfigured) {
    pgSaveReturn(newReturn).catch((e) => console.warn("[Postgres] save return error:", e));
  }
  return newReturn;
}

export async function getReturns(orderId?: string): Promise<ReturnRecord[]> {
  const db = loadDatabase();
  db.returns = db.returns || [];
  if (orderId) {
    return db.returns.filter((r) => r.orderId === orderId || r.orderReference === orderId);
  }
  return db.returns;
}

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
    id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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
    id: `occ-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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

// ── Reviews Engine ─────────────────────────────────────────────────────────

export async function getProductReviews(productIdOrSlug: string): Promise<ProductReview[]> {
  const db = loadDatabase();
  db.reviews = db.reviews || [...INITIAL_PRODUCT_REVIEWS];

  const product = db.products.find((p) => p.id === productIdOrSlug || p.slug === productIdOrSlug);
  const targetIds = new Set<string>([productIdOrSlug]);
  if (product) {
    targetIds.add(product.id);
    targetIds.add(product.slug);
  }

  const matches = db.reviews.filter((r) => targetIds.has(r.productId));
  return matches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addProductReview(reviewData: {
  productId: string;
  authorName: string;
  authorEmail?: string;
  rating: number;
  title: string;
  comment: string;
  flowerCount?: number;
  colorChosen?: string;
  verifiedBuyer?: boolean;
}): Promise<ProductReview> {
  const db = loadDatabase();
  db.reviews = db.reviews || [...INITIAL_PRODUCT_REVIEWS];

  const newReview: ProductReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    productId: reviewData.productId,
    authorName: reviewData.authorName.trim(),
    authorEmail: reviewData.authorEmail?.trim() || undefined,
    rating: Math.min(5, Math.max(1, Math.round(reviewData.rating))),
    title: reviewData.title.trim(),
    comment: reviewData.comment.trim(),
    flowerCount: reviewData.flowerCount,
    colorChosen: reviewData.colorChosen,
    verifiedBuyer: reviewData.verifiedBuyer ?? true,
    createdAt: new Date().toISOString(),
    helpfulCount: 0,
  };

  db.reviews.unshift(newReview);

  // Recalculate average rating & review count for the product
  const product = db.products.find((p) => p.id === reviewData.productId || p.slug === reviewData.productId);
  if (product) {
    const allProdReviews = db.reviews.filter((r) => r.productId === product.id || r.productId === product.slug);
    const avg = allProdReviews.reduce((sum, r) => sum + r.rating, 0) / allProdReviews.length;
    product.rating = Math.round(avg * 10) / 10;
    product.reviewsCount = allProdReviews.length;
  }

  saveDatabase(db);
  return newReview;
}

export async function voteReviewHelpful(reviewId: string): Promise<{ helpfulCount: number } | null> {
  const db = loadDatabase();
  db.reviews = db.reviews || [...INITIAL_PRODUCT_REVIEWS];
  const review = db.reviews.find((r) => r.id === reviewId);
  if (!review) return null;
  review.helpfulCount = (review.helpfulCount || 0) + 1;
  saveDatabase(db);
  return { helpfulCount: review.helpfulCount };
}
