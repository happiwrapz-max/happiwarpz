import postgres from "postgres";

export const POSTGRES_SCHEMA_SQL = `
-- 1. Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  compare_at_price INTEGER,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  stock_quantity INTEGER DEFAULT 50,
  low_stock_threshold INTEGER DEFAULT 10,
  is_made_to_order BOOLEAN DEFAULT FALSE,
  flower_type TEXT,
  ribbon_color TEXT,
  wrapping_style TEXT,
  preparation_hours INTEGER DEFAULT 3,
  tags JSONB DEFAULT '[]'::jsonb,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  customer JSONB NOT NULL DEFAULT '{}'::jsonb,
  delivery_date TEXT,
  delivery_slot TEXT,
  notes TEXT,
  internal_notes TEXT,
  subtotal INTEGER DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  coupon_code TEXT,
  delivery_fee INTEGER DEFAULT 0,
  total_amount INTEGER DEFAULT 0,
  custom_order_id TEXT,
  payment_method TEXT DEFAULT 'Zero Online Payment — WhatsApp Confirmed',
  payment_status TEXT DEFAULT 'confirmed_whatsapp',
  status_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Custom orders table
CREATE TABLE IF NOT EXISTS custom_orders (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  customer JSONB NOT NULL DEFAULT '{}'::jsonb,
  occasion TEXT NOT NULL,
  product_type TEXT NOT NULL,
  flower_preferences TEXT NOT NULL,
  stem_count INTEGER NOT NULL,
  wrapping_style TEXT NOT NULL,
  box_style TEXT,
  personalization_text TEXT NOT NULL,
  gift_message TEXT,
  budget INTEGER NOT NULL,
  desired_delivery_date TEXT NOT NULL,
  desired_delivery_slot TEXT,
  special_instructions TEXT,
  reference_images JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'new',
  assigned_admin TEXT,
  quotation JSONB,
  converted_order_id TEXT,
  status_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'percentage',
  value INTEGER NOT NULL DEFAULT 10,
  min_order_amount INTEGER DEFAULT 0,
  max_discount_amount INTEGER,
  usage_limit INTEGER DEFAULT 100,
  used_count INTEGER DEFAULT 0,
  valid_from TEXT,
  valid_until TEXT,
  active BOOLEAN DEFAULT TRUE,
  applicable_category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Website settings table
CREATE TABLE IF NOT EXISTS website_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT DEFAULT 'Happiwrapz Owner'
);

-- 6. Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Inventory movements table
CREATE TABLE IF NOT EXISTS inventory_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  change INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  reference_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
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
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'unread'
);

-- 10. Subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(reference);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_custom_orders_reference ON custom_orders(reference);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

export async function initializePostgresTables(sql: postgres.Sql): Promise<void> {
  await sql.unsafe(POSTGRES_SCHEMA_SQL);
}
