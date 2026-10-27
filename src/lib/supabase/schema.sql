-- ====================================================================
-- HAPPIWRAPZ SUPABASE POSTGRES FULL PRODUCTION SCHEMA
-- Artisanal Satin Ribbon Flower Atelier
-- Zero Online Payments — WhatsApp Confirmation Model
-- Brand Palette: #2A2A2A (Charcoal), #C0C0C0 (Moonlit Silver), #E10600 (Signal Red)
-- Note: Product images are stored as path arrays (e.g. '["/images/products/..."]'), NOT binary blobs.
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Products Catalog Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL, -- in INR (e.g. 1499)
  images JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of image paths (e.g. ["/images/products/rose-bouquet-1.jpg"])
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  stock_quantity INTEGER NOT NULL DEFAULT 50,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  sku TEXT,
  care_instructions TEXT,
  lead_time_days INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Order Requests Table (NO ONLINE PAYMENT DETAILS)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL, -- e.g. 'HW-A3K7P9'
  status TEXT NOT NULL DEFAULT 'pending',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  customer JSONB NOT NULL DEFAULT '{}'::jsonb,
  delivery_date TEXT,
  delivery_slot TEXT,
  notes TEXT,
  subtotal INTEGER NOT NULL DEFAULT 0,
  discount_amount INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'Zero Online Payment — WhatsApp Confirmed',
  payment_status TEXT DEFAULT 'confirmed_whatsapp',
  status_history JSONB DEFAULT '[]'::jsonb,
  internal_notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Custom Bespoke Order Inquiries Table
CREATE TABLE IF NOT EXISTS public.custom_orders (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL, -- e.g. 'HW-CUS-789'
  status TEXT NOT NULL DEFAULT 'inquiry',
  occasion TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  color_palette TEXT NOT NULL,
  preferred_flowers JSONB DEFAULT '[]'::jsonb,
  reference_images JSONB DEFAULT '[]'::jsonb,
  special_instructions TEXT,
  required_date TEXT,
  delivery_city TEXT,
  customer JSONB NOT NULL DEFAULT '{}'::jsonb,
  quotation JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Quotations Table
CREATE TABLE IF NOT EXISTS public.quotations (
  id TEXT PRIMARY KEY,
  custom_order_id TEXT NOT NULL,
  custom_order_reference TEXT NOT NULL,
  amount INTEGER NOT NULL,
  breakdown JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  valid_until TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Inventory Movements Audit Table
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'sale', 'restock', 'adjustment', 'damage'
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Coupons & Discounts Table
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL, -- 'percentage' | 'fixed'
  discount_value INTEGER NOT NULL,
  min_order_amount INTEGER NOT NULL DEFAULT 0,
  max_discount_amount INTEGER,
  start_date TEXT,
  end_date TEXT,
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Admin Notifications Table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  link TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 9. Website Dynamic Settings Table
CREATE TABLE IF NOT EXISTS public.website_settings (
  id TEXT PRIMARY KEY,
  announcement_bar JSONB NOT NULL DEFAULT '{}'::jsonb,
  business_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  hero_slides JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  whatsapp_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  currency TEXT DEFAULT 'INR',
  delivery_slots JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  phone TEXT,
  avatar TEXT,
  addresses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. Immutable Order Audit Log Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  reference TEXT,
  action TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  note TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread'
);

-- 13. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- ── Indexes for high-speed queries ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON public.orders(reference);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_custom_orders_reference ON public.custom_orders(reference);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ── Row Level Security (RLS) Policies ────────────────────────────────────────
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public read website settings" ON public.website_settings FOR SELECT USING (true);
CREATE POLICY "Allow public submit orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read orders by reference" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public submit custom orders" ON public.custom_orders FOR INSERT WITH CHECK (true);
