-- SPN POS Database Schema
-- This file should be applied to your Supabase database ONCE before deploying the app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS pos;
CREATE SCHEMA IF NOT EXISTS erp;

-- =====================================================
-- ERP Schema: Inventory Management
-- =====================================================

-- Categories table
CREATE TABLE IF NOT EXISTS pos.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_en TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory items (products)
CREATE TABLE IF NOT EXISTS erp.inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_en TEXT,
  sku TEXT UNIQUE,
  category_id UUID REFERENCES pos.categories(id),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- POS Schema: Point of Sale Operations
-- =====================================================

-- Orders table
CREATE TABLE IF NOT EXISTS pos.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_number TEXT,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  shift_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS pos.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES pos.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES erp.inventory_items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS pos.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES pos.orders(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'qr')),
  amount DECIMAL(10, 2) NOT NULL,
  received_amount DECIMAL(10, 2),
  change_amount DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shifts table (for cashier management)
CREATE TABLE IF NOT EXISTS pos.shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cashier_name TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  starting_cash DECIMAL(10, 2) NOT NULL DEFAULT 0,
  ending_cash DECIMAL(10, 2),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cash movements table
CREATE TABLE IF NOT EXISTS pos.cash_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID NOT NULL REFERENCES pos.shifts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('in', 'out')),
  amount DECIMAL(10, 2) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON erp.inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON erp.inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_orders_status ON pos.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON pos.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON pos.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON pos.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON pos.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON pos.shifts(status);
CREATE INDEX IF NOT EXISTS idx_cash_movements_shift_id ON pos.cash_movements(shift_id);

-- =====================================================
-- Functions
-- =====================================================

-- Function to deduct inventory
CREATE OR REPLACE FUNCTION deduct_inventory(product_id UUID, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE erp.inventory_items
  SET stock_quantity = stock_quantity - quantity,
      updated_at = NOW()
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Triggers for auto-updating timestamps
-- =====================================================

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON pos.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON erp.inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON pos.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS Policies (Anonymous access for now)
-- =====================================================

-- Enable RLS
ALTER TABLE pos.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos.cash_movements ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access (since app runs without authentication)
CREATE POLICY "Allow anonymous read categories" ON pos.categories FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous read inventory" ON erp.inventory_items FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous update inventory" ON erp.inventory_items FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anonymous insert orders" ON pos.orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous read orders" ON pos.orders FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert order_items" ON pos.order_items FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous read order_items" ON pos.order_items FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert payments" ON pos.payments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous read payments" ON pos.payments FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous all shifts" ON pos.shifts FOR ALL TO anon USING (true);
CREATE POLICY "Allow anonymous all cash_movements" ON pos.cash_movements FOR ALL TO anon USING (true);

-- =====================================================
-- Sample Data (Optional)
-- =====================================================

-- Insert sample categories
INSERT INTO pos.categories (name, name_en, sort_order) VALUES
  ('ทั้งหมด', 'All', 0),
  ('ฐานหลัก', 'Main Base', 1),
  ('ของทานเล่น', 'Snacks', 2),
  ('เครื่องดื่ม', 'Beverages', 3),
  ('ของหวาน', 'Desserts', 4)
ON CONFLICT DO NOTHING;

-- Insert sample products (you can add more)
INSERT INTO erp.inventory_items (name, name_en, category_id, price, stock_quantity, sku) 
SELECT 
  'ข้าวผัด', 'Fried Rice', 
  (SELECT id FROM pos.categories WHERE name_en = 'Main Base' LIMIT 1),
  50.00, 100, 'FOOD-001'
WHERE NOT EXISTS (SELECT 1 FROM erp.inventory_items WHERE sku = 'FOOD-001');

INSERT INTO erp.inventory_items (name, name_en, category_id, price, stock_quantity, sku) 
SELECT 
  'น้ำอัดลม', 'Soft Drink', 
  (SELECT id FROM pos.categories WHERE name_en = 'Beverages' LIMIT 1),
  20.00, 200, 'BEV-001'
WHERE NOT EXISTS (SELECT 1 FROM erp.inventory_items WHERE sku = 'BEV-001');

-- =====================================================
-- Realtime Setup (Optional - for broadcast triggers)
-- =====================================================

-- Note: Realtime triggers should be set up in Supabase Dashboard
-- or using the Supabase CLI. The following is for reference:

/*
-- Example trigger function for broadcasting order changes
CREATE OR REPLACE FUNCTION notify_order_changes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM realtime.send(
    'pos_orders:changes',
    TG_OP,
    jsonb_build_object('id', NEW.id, 'status', NEW.status, 'total', NEW.total)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER orders_realtime_trigger
  AFTER INSERT OR UPDATE ON pos.orders
  FOR EACH ROW EXECUTE FUNCTION notify_order_changes();

-- Example trigger function for broadcasting inventory changes
CREATE OR REPLACE FUNCTION notify_inventory_changes()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM realtime.send(
    'erp_inventory_items:changes',
    TG_OP,
    jsonb_build_object('id', NEW.id, 'stock_quantity', NEW.stock_quantity)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER inventory_realtime_trigger
  AFTER UPDATE ON erp.inventory_items
  FOR EACH ROW EXECUTE FUNCTION notify_inventory_changes();
*/

