-- Supabase / Postgres schema for Valente Conecta migration
-- Run on your Supabase database (psql or supabase SQL editor)

-- Enable pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text,
  description text,
  price numeric(12,2) DEFAULT 0,
  image_url text,
  category text,
  metadata jsonb DEFAULT '{}'::jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin (to_tsvector('portuguese', coalesce(name,'')));

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text,
  phone text,
  whatsapp text,
  email text,
  address text,
  city text,
  state text,
  lat numeric,
  lng numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_company ON suppliers(company_name);

-- Join table: product offered by supplier (allows multiple suppliers per product)
CREATE TABLE IF NOT EXISTS product_suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  supplier_sku text,
  supplier_price numeric(12,2),
  available boolean DEFAULT true,
  stock integer DEFAULT 0,
  image_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (product_id, supplier_id, supplier_sku)
);

CREATE INDEX IF NOT EXISTS idx_product_suppliers_price ON product_suppliers (supplier_price);

-- Appointments / Bookings (agendamentos)
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  product_supplier_id uuid REFERENCES product_suppliers(id) ON DELETE SET NULL,
  customer_name text,
  customer_phone text,
  scheduled_date date,
  scheduled_time time,
  status text DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (scheduled_date);

-- Demands / Solicitações (captação)
CREATE TABLE IF NOT EXISTS demands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text,
  requester_name text,
  requester_phone text,
  description text,
  source text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Admin notifications
CREATE TABLE IF NOT EXISTS admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Optional: simple view to see product + supplier offers
CREATE OR REPLACE VIEW product_offers AS
SELECT
  p.id as product_id,
  p.name as product_name,
  ps.id as offer_id,
  ps.supplier_price,
  ps.image_url as offer_image,
  s.id as supplier_id,
  s.company_name as supplier_name,
  s.phone as supplier_phone,
  s.address as supplier_address
FROM product_suppliers ps
JOIN products p ON p.id = ps.product_id
JOIN suppliers s ON s.id = ps.supplier_id;

-- Notes: after creating tables you can INSERT data from localStorage export
-- Example insertion (replace ids accordingly):
-- INSERT INTO products (id, name, description, price) VALUES ('uuid','Retroescavadeira X','Descrição',350.00);
