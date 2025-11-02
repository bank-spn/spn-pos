-- ERP Extension Schema for SPN POS
-- This file extends the base schema with additional ERP functionality
-- Apply this AFTER applying the base schema.sql

-- =====================================================
-- ERP Schema: Suppliers Management
-- =====================================================

CREATE TABLE IF NOT EXISTS erp.suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  payment_terms TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ERP Schema: Purchase Orders
-- =====================================================

CREATE TABLE IF NOT EXISTS erp.purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number TEXT UNIQUE NOT NULL,
  supplier_id UUID REFERENCES erp.suppliers(id),
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expected_delivery_date TIMESTAMP WITH TIME ZONE,
  actual_delivery_date TIMESTAMP WITH TIME ZONE,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'received', 'cancelled')),
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase order items
CREATE TABLE IF NOT EXISTS erp.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES erp.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES erp.inventory_items(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ERP Schema: Stock Adjustments
-- =====================================================

CREATE TABLE IF NOT EXISTS erp.stock_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES erp.inventory_items(id),
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('add', 'remove', 'set', 'damage', 'return')),
  quantity_before INTEGER NOT NULL,
  quantity_change INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT,
  adjusted_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ERP Schema: Employees
-- =====================================================

CREATE TABLE IF NOT EXISTS erp.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_code TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'cashier', 'staff')),
  pin TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  hire_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_suppliers_status ON erp.suppliers(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON erp.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON erp.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON erp.purchase_orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po ON erp.purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product ON erp.purchase_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_product ON erp.stock_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_date ON erp.stock_adjustments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employees_code ON erp.employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_status ON erp.employees(status);

-- =====================================================
-- Functions
-- =====================================================

-- Function to generate PO number
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  po_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(po_number FROM 'PO-(\d+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM erp.purchase_orders;
  
  po_number := 'PO-' || LPAD(next_number::TEXT, 6, '0');
  RETURN po_number;
END;
$$ LANGUAGE plpgsql;

-- Function to adjust stock
CREATE OR REPLACE FUNCTION adjust_stock(
  p_product_id UUID,
  p_adjustment_type TEXT,
  p_quantity_change INTEGER,
  p_reason TEXT,
  p_notes TEXT DEFAULT NULL,
  p_adjusted_by TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_quantity_before INTEGER;
  v_quantity_after INTEGER;
BEGIN
  -- Get current stock
  SELECT stock_quantity INTO v_quantity_before
  FROM erp.inventory_items
  WHERE id = p_product_id;
  
  -- Calculate new quantity based on adjustment type
  CASE p_adjustment_type
    WHEN 'add' THEN
      v_quantity_after := v_quantity_before + p_quantity_change;
    WHEN 'remove' THEN
      v_quantity_after := v_quantity_before - p_quantity_change;
    WHEN 'set' THEN
      v_quantity_after := p_quantity_change;
    WHEN 'damage' THEN
      v_quantity_after := v_quantity_before - p_quantity_change;
    WHEN 'return' THEN
      v_quantity_after := v_quantity_before + p_quantity_change;
    ELSE
      RAISE EXCEPTION 'Invalid adjustment type';
  END CASE;
  
  -- Ensure quantity doesn't go negative
  IF v_quantity_after < 0 THEN
    RAISE EXCEPTION 'Stock quantity cannot be negative';
  END IF;
  
  -- Update inventory
  UPDATE erp.inventory_items
  SET stock_quantity = v_quantity_after,
      updated_at = NOW()
  WHERE id = p_product_id;
  
  -- Record adjustment
  INSERT INTO erp.stock_adjustments (
    product_id,
    adjustment_type,
    quantity_before,
    quantity_change,
    quantity_after,
    reason,
    notes,
    adjusted_by
  ) VALUES (
    p_product_id,
    p_adjustment_type,
    v_quantity_before,
    p_quantity_change,
    v_quantity_after,
    p_reason,
    p_notes,
    p_adjusted_by
  );
END;
$$ LANGUAGE plpgsql;

-- Function to receive purchase order
CREATE OR REPLACE FUNCTION receive_purchase_order(
  p_purchase_order_id UUID,
  p_received_items JSONB
)
RETURNS VOID AS $$
DECLARE
  item JSONB;
  v_product_id UUID;
  v_received_qty INTEGER;
BEGIN
  -- Loop through received items
  FOR item IN SELECT * FROM jsonb_array_elements(p_received_items)
  LOOP
    v_product_id := (item->>'product_id')::UUID;
    v_received_qty := (item->>'received_quantity')::INTEGER;
    
    -- Update purchase order item
    UPDATE erp.purchase_order_items
    SET received_quantity = received_quantity + v_received_qty
    WHERE purchase_order_id = p_purchase_order_id
      AND product_id = v_product_id;
    
    -- Update inventory
    UPDATE erp.inventory_items
    SET stock_quantity = stock_quantity + v_received_qty,
        updated_at = NOW()
    WHERE id = v_product_id;
    
    -- Record stock adjustment
    INSERT INTO erp.stock_adjustments (
      product_id,
      adjustment_type,
      quantity_before,
      quantity_change,
      quantity_after,
      reason,
      notes
    )
    SELECT
      v_product_id,
      'add',
      stock_quantity - v_received_qty,
      v_received_qty,
      stock_quantity,
      'Purchase Order Received',
      'PO: ' || po_number
    FROM erp.inventory_items, erp.purchase_orders
    WHERE erp.inventory_items.id = v_product_id
      AND erp.purchase_orders.id = p_purchase_order_id;
  END LOOP;
  
  -- Update PO status
  UPDATE erp.purchase_orders
  SET status = 'received',
      actual_delivery_date = NOW(),
      updated_at = NOW()
  WHERE id = p_purchase_order_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Triggers for auto-updating timestamps
-- =====================================================

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON erp.suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON erp.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON erp.employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS Policies (Anonymous access for now)
-- =====================================================

ALTER TABLE erp.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp.stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous all suppliers" ON erp.suppliers FOR ALL TO anon USING (true);
CREATE POLICY "Allow anonymous all purchase_orders" ON erp.purchase_orders FOR ALL TO anon USING (true);
CREATE POLICY "Allow anonymous all purchase_order_items" ON erp.purchase_order_items FOR ALL TO anon USING (true);
CREATE POLICY "Allow anonymous read stock_adjustments" ON erp.stock_adjustments FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert stock_adjustments" ON erp.stock_adjustments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous all employees" ON erp.employees FOR ALL TO anon USING (true);

-- =====================================================
-- Sample Data
-- =====================================================

-- Insert sample suppliers
INSERT INTO erp.suppliers (name, contact_person, email, phone, payment_terms) VALUES
  ('Bangkok Food Supplies Co., Ltd.', 'Somchai Prasert', 'somchai@bkfood.com', '02-123-4567', 'Net 30'),
  ('Fresh Produce Thailand', 'Nida Wongsa', 'nida@freshproduce.th', '02-234-5678', 'Net 15'),
  ('Beverage Distributors Ltd.', 'Pong Siri', 'pong@bevdist.com', '02-345-6789', 'Net 30')
ON CONFLICT DO NOTHING;

-- Insert sample employees
INSERT INTO erp.employees (employee_code, first_name, last_name, role, pin, hire_date) VALUES
  ('EMP001', 'Admin', 'User', 'admin', '260539', CURRENT_DATE),
  ('EMP002', 'Manager', 'One', 'manager', '123456', CURRENT_DATE),
  ('EMP003', 'Cashier', 'One', 'cashier', '111111', CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Views for Reporting
-- =====================================================

-- Low stock items view
CREATE OR REPLACE VIEW erp.low_stock_items AS
SELECT 
  i.id,
  i.name,
  i.name_en,
  i.sku,
  i.stock_quantity,
  i.price,
  c.name as category_name
FROM erp.inventory_items i
LEFT JOIN pos.categories c ON i.category_id = c.id
WHERE i.stock_quantity < 10
ORDER BY i.stock_quantity ASC;

-- Sales summary view
CREATE OR REPLACE VIEW pos.sales_summary AS
SELECT 
  DATE(o.created_at) as sale_date,
  COUNT(o.id) as order_count,
  SUM(o.subtotal) as total_subtotal,
  SUM(o.tax) as total_tax,
  SUM(o.discount) as total_discount,
  SUM(o.total) as total_revenue
FROM pos.orders o
WHERE o.status = 'completed'
GROUP BY DATE(o.created_at)
ORDER BY sale_date DESC;

-- Top selling products view
CREATE OR REPLACE VIEW pos.top_selling_products AS
SELECT 
  i.id,
  i.name,
  i.name_en,
  i.sku,
  COUNT(oi.id) as times_ordered,
  SUM(oi.quantity) as total_quantity_sold,
  SUM(oi.subtotal) as total_revenue
FROM erp.inventory_items i
JOIN pos.order_items oi ON i.id = oi.product_id
JOIN pos.orders o ON oi.order_id = o.id
WHERE o.status = 'completed'
GROUP BY i.id, i.name, i.name_en, i.sku
ORDER BY total_quantity_sold DESC
LIMIT 20;

-- Inventory value view
CREATE OR REPLACE VIEW erp.inventory_value AS
SELECT 
  i.id,
  i.name,
  i.name_en,
  i.sku,
  i.stock_quantity,
  i.price,
  (i.stock_quantity * i.price) as total_value,
  c.name as category_name
FROM erp.inventory_items i
LEFT JOIN pos.categories c ON i.category_id = c.id
ORDER BY total_value DESC;
