-- Bioplant CRM - Initial Database Schema
-- Bu SQL'i Supabase SQL Editor'de çalıştırın

-- Stocks (Stok) Tablosu
CREATE TABLE IF NOT EXISTS stocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('hammadde', 'ambalaj')),
  unit VARCHAR(20) NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 0,
  min_quantity DECIMAL(10,2) DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'TRY',
  supplier_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Index'ler
CREATE INDEX IF NOT EXISTS idx_stocks_category ON stocks(category);
CREATE INDEX IF NOT EXISTS idx_stocks_deleted ON stocks(deleted_at);
CREATE INDEX IF NOT EXISTS idx_stocks_name ON stocks(name);

-- Updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger
CREATE TRIGGER update_stocks_updated_at BEFORE UPDATE ON stocks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Customers (Cari) Tablosu (Gelecek için hazır)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('musteri', 'tedarikci', 'fason', 'diger')),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  tax_number VARCHAR(50),
  balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(type);
CREATE INDEX IF NOT EXISTS idx_customers_deleted ON customers(deleted_at);

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Recipes (Reçete) Tablosu (Gelecek için hazır)
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  name VARCHAR(255) NOT NULL,
  density DECIMAL(10,4),
  total_cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_recipes_customer ON recipes(customer_id);
CREATE INDEX IF NOT EXISTS idx_recipes_deleted ON recipes(deleted_at);

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Orders (Sipariş) Tablosu (Gelecek için hazır)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  status VARCHAR(50) DEFAULT 'beklemede' CHECK (status IN ('beklemede', 'hazirlaniyor', 'tamamlandi', 'iptal')),
  total_price DECIMAL(10,2),
  order_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_deleted ON orders(deleted_at);

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Test data (opsiyonel - isteğe bağlı)
INSERT INTO stocks (name, category, unit, quantity, min_quantity, price, currency, notes)
VALUES 
  ('Azot', 'hammadde', 'kg', 500, 100, 25.50, 'TRY', 'Test hammaddesi'),
  ('Plastik Bidon 5L', 'ambalaj', 'adet', 200, 50, 15.00, 'TRY', 'Test ambalaj')
ON CONFLICT DO NOTHING;

