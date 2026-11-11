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

-- 11. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'order',
  reference_id TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Payments table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_reference TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending',
  gateway TEXT NOT NULL DEFAULT 'whatsapp_cod',
  transaction_id TEXT UNIQUE,
  payer_email TEXT,
  payer_phone TEXT,
  idempotency_key TEXT UNIQUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Returns and Refunds table
CREATE TABLE IF NOT EXISTS returns (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_reference TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  refund_amount INTEGER NOT NULL DEFAULT 0,
  refund_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(reference);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_custom_orders_reference ON custom_orders(reference);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(order_reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns(order_id);

-- =========================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- Protects multi-tenant data isolation and prevents unauthorized table scans
-- =========================================================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- 1. Public catalog read policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'products_public_read') THEN
    CREATE POLICY products_public_read ON products FOR SELECT USING (true);
  END IF;

  -- 2. Customer orders isolation policy (users only access their own records)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'orders_customer_isolation') THEN
    CREATE POLICY orders_customer_isolation ON orders FOR ALL
    USING (
      current_setting('request.jwt.claim.role', true) IN ('owner', 'admin', 'service_role') OR
      (customer->>'email' = current_setting('request.jwt.claim.email', true))
    );
  END IF;

  -- 3. Custom orders isolation policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_orders' AND policyname = 'custom_orders_isolation') THEN
    CREATE POLICY custom_orders_isolation ON custom_orders FOR ALL
    USING (
      current_setting('request.jwt.claim.role', true) IN ('owner', 'admin', 'service_role') OR
      (customer->>'email' = current_setting('request.jwt.claim.email', true))
    );
  END IF;

  -- 4. Audit logs protected policy (admin and service role only)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'audit_logs_admin_only') THEN
    CREATE POLICY audit_logs_admin_only ON audit_logs FOR ALL
    USING (current_setting('request.jwt.claim.role', true) IN ('owner', 'admin', 'service_role'));
  END IF;

  -- 5. Notifications protected policy (admin only)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'notifications_admin_only') THEN
    CREATE POLICY notifications_admin_only ON notifications FOR ALL
    USING (current_setting('request.jwt.claim.role', true) IN ('owner', 'admin', 'service_role'));
  END IF;

  -- 6. Payments customer and admin isolation policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'payments_isolation') THEN
    CREATE POLICY payments_isolation ON payments FOR ALL
    USING (
      current_setting('request.jwt.claim.role', true) IN ('owner', 'admin', 'service_role') OR
      (payer_email = current_setting('request.jwt.claim.email', true))
    );
  END IF;

  -- 7. Returns customer and admin isolation policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'returns' AND policyname = 'returns_isolation') THEN
    CREATE POLICY returns_isolation ON returns FOR ALL
    USING (
      current_setting('request.jwt.claim.role', true) IN ('owner', 'admin', 'service_role') OR
      (customer_email = current_setting('request.jwt.claim.email', true))
    );
  END IF;
END $$;
`;

export async function initializePostgresTables(sql: postgres.Sql): Promise<void> {
  await sql.unsafe(POSTGRES_SCHEMA_SQL);
}
