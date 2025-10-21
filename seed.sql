-- SPN POS - Sample Data (Seed)
-- Run this SQL script in Supabase SQL Editor to populate the database with sample data

-- =====================================================
-- Clear existing data (optional - comment out if you want to keep existing data)
-- =====================================================

-- TRUNCATE TABLE pos.cash_movements CASCADE;
-- TRUNCATE TABLE pos.shifts CASCADE;
-- TRUNCATE TABLE pos.payments CASCADE;
-- TRUNCATE TABLE pos.order_items CASCADE;
-- TRUNCATE TABLE pos.orders CASCADE;
-- TRUNCATE TABLE erp.inventory_items CASCADE;
-- TRUNCATE TABLE pos.categories CASCADE;

-- =====================================================
-- Insert Categories
-- =====================================================

INSERT INTO pos.categories (id, name, name_en, icon, sort_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'ทั้งหมด', 'All', '📦', 0),
  ('00000000-0000-0000-0000-000000000002', 'ฐานหลัก', 'Main Base', '🍚', 1),
  ('00000000-0000-0000-0000-000000000003', 'ของทานเล่น', 'Snacks', '🍟', 2),
  ('00000000-0000-0000-0000-000000000004', 'เครื่องดื่ม', 'Beverages', '🥤', 3),
  ('00000000-0000-0000-0000-000000000005', 'ของหวาน', 'Desserts', '🍰', 4)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Insert Inventory Items (Products)
-- =====================================================

-- Main Base (ฐานหลัก)
INSERT INTO erp.inventory_items (name, name_en, category_id, price, stock_quantity, sku, description) VALUES
  ('ข้าวผัด', 'Fried Rice', '00000000-0000-0000-0000-000000000002', 50.00, 100, 'MAIN-001', 'ข้าวผัดไข่พิเศษ'),
  ('ข้าวผัดกุ้ง', 'Shrimp Fried Rice', '00000000-0000-0000-0000-000000000002', 70.00, 80, 'MAIN-002', 'ข้าวผัดกุ้งสด'),
  ('ข้าวผัดหมู', 'Pork Fried Rice', '00000000-0000-0000-0000-000000000002', 60.00, 90, 'MAIN-003', 'ข้าวผัดหมูสับ'),
  ('ผัดกะเพรา', 'Basil Stir-fry', '00000000-0000-0000-0000-000000000002', 55.00, 95, 'MAIN-004', 'ผัดกะเพราไก่/หมู/กุ้ง'),
  ('ผัดซีอิ๊ว', 'Soy Sauce Stir-fry', '00000000-0000-0000-0000-000000000002', 55.00, 85, 'MAIN-005', 'ผัดซีอิ๊วเส้นใหญ่'),
  ('ผัดไทย', 'Pad Thai', '00000000-0000-0000-0000-000000000002', 60.00, 75, 'MAIN-006', 'ผัดไทยกุ้งสด'),
  ('ราดหน้า', 'Gravy Noodles', '00000000-0000-0000-0000-000000000002', 65.00, 70, 'MAIN-007', 'ราดหน้าหมู/ไก่'),
  ('ข้าวขาหมู', 'Braised Pork Rice', '00000000-0000-0000-0000-000000000002', 75.00, 60, 'MAIN-008', 'ข้าวขาหมูตุ๋นพิเศษ')
ON CONFLICT (sku) DO NOTHING;

-- Snacks (ของทานเล่น)
INSERT INTO erp.inventory_items (name, name_en, category_id, price, stock_quantity, sku, description) VALUES
  ('ไก่ทอด', 'Fried Chicken', '00000000-0000-0000-0000-000000000003', 45.00, 120, 'SNACK-001', 'ไก่ทอดกรอบ 3 ชิ้น'),
  ('ปีกไก่ทอด', 'Fried Chicken Wings', '00000000-0000-0000-0000-000000000003', 50.00, 100, 'SNACK-002', 'ปีกไก่ทอด 5 ชิ้น'),
  ('เฟรนช์ฟรายส์', 'French Fries', '00000000-0000-0000-0000-000000000003', 35.00, 150, 'SNACK-003', 'มันฝรั่งทอด'),
  ('ปอเปี๊ยะทอด', 'Spring Rolls', '00000000-0000-0000-0000-000000000003', 40.00, 80, 'SNACK-004', 'ปอเปี๊ยะทอด 5 ชิ้น'),
  ('ทอดมันปลา', 'Fish Cakes', '00000000-0000-0000-0000-000000000003', 45.00, 90, 'SNACK-005', 'ทอดมันปลา 6 ชิ้น'),
  ('ขนมปังกรอบ', 'Crispy Bread', '00000000-0000-0000-0000-000000000003', 30.00, 110, 'SNACK-006', 'ขนมปังกรอบเนย')
ON CONFLICT (sku) DO NOTHING;

-- Beverages (เครื่องดื่ม)
INSERT INTO erp.inventory_items (name, name_en, category_id, price, stock_quantity, sku, description) VALUES
  ('น้ำอัดลม', 'Soft Drink', '00000000-0000-0000-0000-000000000004', 20.00, 200, 'BEV-001', 'โค้ก/เป๊ปซี่/สไปรท์'),
  ('น้ำเปล่า', 'Water', '00000000-0000-0000-0000-000000000004', 10.00, 300, 'BEV-002', 'น้ำดื่มบรรจุขวด'),
  ('ชาเย็น', 'Iced Tea', '00000000-0000-0000-0000-000000000004', 25.00, 150, 'BEV-003', 'ชาเย็นหวาน'),
  ('กาแฟเย็น', 'Iced Coffee', '00000000-0000-0000-0000-000000000004', 30.00, 120, 'BEV-004', 'กาแฟเย็นหวาน'),
  ('น้ำส้ม', 'Orange Juice', '00000000-0000-0000-0000-000000000004', 35.00, 100, 'BEV-005', 'น้ำส้มคั้นสด'),
  ('น้ำแตงโม', 'Watermelon Juice', '00000000-0000-0000-0000-000000000004', 35.00, 90, 'BEV-006', 'น้ำแตงโมปั่น'),
  ('ชาเขียว', 'Green Tea', '00000000-0000-0000-0000-000000000004', 30.00, 110, 'BEV-007', 'ชาเขียวเย็น'),
  ('นมสด', 'Fresh Milk', '00000000-0000-0000-0000-000000000004', 25.00, 130, 'BEV-008', 'นมสดพาสเจอร์ไรส์')
ON CONFLICT (sku) DO NOTHING;

-- Desserts (ของหวาน)
INSERT INTO erp.inventory_items (name, name_en, category_id, price, stock_quantity, sku, description) VALUES
  ('ไอศกรีม', 'Ice Cream', '00000000-0000-0000-0000-000000000005', 40.00, 80, 'DESSERT-001', 'ไอศกรีม 2 สกู๊ป'),
  ('บราวนี่', 'Brownie', '00000000-0000-0000-0000-000000000005', 45.00, 60, 'DESSERT-002', 'บราวนี่ช็อกโกแลต'),
  ('เค้ก', 'Cake', '00000000-0000-0000-0000-000000000005', 50.00, 50, 'DESSERT-003', 'เค้กชิ้น'),
  ('ขนมปังปิ้ง', 'Toast', '00000000-0000-0000-0000-000000000005', 35.00, 90, 'DESSERT-004', 'ขนมปังปิ้งเนยนม'),
  ('วุ้น', 'Jelly', '00000000-0000-0000-0000-000000000005', 30.00, 100, 'DESSERT-005', 'วุ้นผลไม้'),
  ('ข้าวเหนียวมะม่วง', 'Mango Sticky Rice', '00000000-0000-0000-0000-000000000005', 60.00, 40, 'DESSERT-006', 'ข้าวเหนียวมะม่วงสด')
ON CONFLICT (sku) DO NOTHING;

-- =====================================================
-- Verify Data
-- =====================================================

-- Check categories
SELECT 'Categories inserted:' as info, COUNT(*) as count FROM pos.categories;

-- Check products
SELECT 'Products inserted:' as info, COUNT(*) as count FROM erp.inventory_items;

-- Show products by category
SELECT 
  c.name as category,
  COUNT(i.id) as product_count
FROM pos.categories c
LEFT JOIN erp.inventory_items i ON i.category_id = c.id
GROUP BY c.id, c.name
ORDER BY c.sort_order;

-- =====================================================
-- Sample Shift (Optional)
-- =====================================================

-- Create an open shift for testing
INSERT INTO pos.shifts (cashier_name, starting_cash, status) VALUES
  ('Admin', 1000.00, 'open')
ON CONFLICT DO NOTHING;

-- =====================================================
-- Success Message
-- =====================================================

SELECT '✅ Sample data inserted successfully!' as message;
SELECT 'Total products: ' || COUNT(*) as summary FROM erp.inventory_items;
SELECT 'Total categories: ' || COUNT(*) as summary FROM pos.categories;

