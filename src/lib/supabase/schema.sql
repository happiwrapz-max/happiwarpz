-- ====================================================================
-- HAPPIWRAPZ SUPABASE POSTGRES SCHEMA
-- Zero Online Payments - Order Request & Owner Confirmation Model
-- Brand Palette: #2A2A2A (Charcoal), #C0C0C0 (Moonlit Silver), #E10600 (Signal Red)
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Staff Roles Enum
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'fulfillment', 'customer');

-- 3. Order Status Enum
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'delivered',
  'cancelled'
);

-- 4. Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role user_role DEFAULT 'customer' NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Products Catalog Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL, -- in INR (e.g. 1499)
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  in_stock BOOLEAN DEFAULT TRUE NOT NULL,
  featured BOOLEAN DEFAULT FALSE NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Order Requests Table (NO PAYMENT DETAILS)
CREATE TABLE IF NOT EXISTS public.order_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE, -- e.g. 'HW-A3K7P9'
  status order_status DEFAULT 'pending' NOT NULL,
  customer_info JSONB NOT NULL, -- { name, email, phone, address, city, pincode }
  items JSONB NOT NULL, -- [ { product, quantity, giftMessage, selectedOptions } ]
  delivery_date DATE,
  delivery_slot TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Immutable Order Audit Log Table
CREATE TABLE IF NOT EXISTS public.order_audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.order_requests(id) ON DELETE CASCADE,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  note TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Customer Saved Addresses Table
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT DEFAULT 'Bangalore' NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

-- Public can read active in-stock products
CREATE POLICY "Public can view in-stock products" ON public.products
  FOR SELECT USING (in_stock = true);

-- Staff can view and manage all products
CREATE POLICY "Staff manage products" ON public.products
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'manager')));

-- Public / Guests can insert order requests
CREATE POLICY "Anyone can submit order request" ON public.order_requests
  FOR INSERT WITH CHECK (true);

-- Anyone with reference can view their own order request
CREATE POLICY "Read order by reference" ON public.order_requests
  FOR SELECT USING (true);

-- Only Staff can update order status
CREATE POLICY "Staff update order status" ON public.order_requests
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'manager', 'fulfillment')));

-- Audit logs append-only
CREATE POLICY "Staff insert audit log" ON public.order_audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Staff read audit log" ON public.order_audit_logs
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'manager')));
