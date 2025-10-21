# วิธีการเพิ่มข้อมูลตัวอย่าง (Seed Data)

## 📋 ข้อมูลที่จะถูกเพิ่ม

ไฟล์ `seed.sql` จะเพิ่มข้อมูลตัวอย่างดังนี้:

### 1. หมวดหมู่สินค้า (5 หมวด)
- ทั้งหมด (All)
- ฐานหลัก (Main Base) - อาหารจานหลัก
- ของทานเล่น (Snacks) - อาหารว่าง
- เครื่องดื่ม (Beverages) - เครื่องดื่มทุกประเภท
- ของหวาน (Desserts) - ของหวานและขนม

### 2. สินค้า (28 รายการ)

#### ฐานหลัก (8 รายการ)
- ข้าวผัด - 50 บาท
- ข้าวผัดกุ้ง - 70 บาท
- ข้าวผัดหมู - 60 บาท
- ผัดกะเพรา - 55 บาท
- ผัดซีอิ๊ว - 55 บาท
- ผัดไทย - 60 บาท
- ราดหน้า - 65 บาท
- ข้าวขาหมู - 75 บาท

#### ของทานเล่น (6 รายการ)
- ไก่ทอด - 45 บาท
- ปีกไก่ทอด - 50 บาท
- เฟรนช์ฟรายส์ - 35 บาท
- ปอเปี๊ยะทอด - 40 บาท
- ทอดมันปลา - 45 บาท
- ขนมปังกรอบ - 30 บาท

#### เครื่องดื่ม (8 รายการ)
- น้ำอัดลม - 20 บาท
- น้ำเปล่า - 10 บาท
- ชาเย็น - 25 บาท
- กาแฟเย็น - 30 บาท
- น้ำส้ม - 35 บาท
- น้ำแตงโม - 35 บาท
- ชาเขียว - 30 บาท
- นมสด - 25 บาท

#### ของหวาน (6 รายการ)
- ไอศกรีม - 40 บาท
- บราวนี่ - 45 บาท
- เค้ก - 50 บาท
- ขนมปังปิ้ง - 35 บาท
- วุ้น - 30 บาท
- ข้าวเหนียวมะม่วง - 60 บาท

---

## 🚀 วิธีการรัน Seed Data

### ขั้นตอนที่ 1: เปิด Supabase Dashboard

1. ไปที่ https://supabase.com/dashboard
2. เลือกโปรเจกต์ของคุณ
3. คลิก **SQL Editor** ที่เมนูด้านซ้าย

### ขั้นตอนที่ 2: รัน Schema (ถ้ายังไม่ได้รัน)

1. เปิดไฟล์ `schema.sql` จาก repository
2. Copy เนื้อหาทั้งหมด
3. Paste ลงใน SQL Editor
4. คลิก **Run** (หรือกด Ctrl+Enter)
5. รอจนกว่าจะเสร็จ (ประมาณ 5-10 วินาที)

### ขั้นตอนที่ 3: รัน Seed Data

1. เปิดไฟล์ `seed.sql` จาก repository
2. Copy เนื้อหาทั้งหมด
3. Paste ลงใน SQL Editor
4. คลิก **Run** (หรือกด Ctrl+Enter)
5. รอจนกว่าจะเสร็จ

### ขั้นตอนที่ 4: ตรวจสอบข้อมูล

คุณจะเห็นผลลัพธ์ดังนี้:

```
✅ Sample data inserted successfully!
Total products: 28
Total categories: 5
```

---

## ✅ ตรวจสอบว่าข้อมูลถูกเพิ่มแล้ว

### วิธีที่ 1: ผ่าน Table Editor

1. ไปที่ **Table Editor** ใน Supabase Dashboard
2. เลือก schema `pos` หรือ `erp`
3. เลือกตาราง:
   - `pos.categories` - ควรมี 5 แถว
   - `erp.inventory_items` - ควรมี 28 แถว

### วิธีที่ 2: ผ่าน SQL Query

รัน query นี้ใน SQL Editor:

```sql
-- ตรวจสอบจำนวนหมวดหมู่
SELECT COUNT(*) as total_categories FROM pos.categories;

-- ตรวจสอบจำนวนสินค้า
SELECT COUNT(*) as total_products FROM erp.inventory_items;

-- ดูสินค้าทั้งหมด
SELECT 
  i.name,
  i.name_en,
  c.name as category,
  i.price,
  i.stock_quantity
FROM erp.inventory_items i
LEFT JOIN pos.categories c ON i.category_id = c.id
ORDER BY c.sort_order, i.name;
```

---

## 🔄 การเพิ่มข้อมูลใหม่

หากต้องการเพิ่มสินค้าใหม่:

```sql
-- เพิ่มสินค้าใหม่
INSERT INTO erp.inventory_items (name, name_en, category_id, price, stock_quantity, sku) 
VALUES (
  'ชื่อสินค้า',
  'Product Name',
  '00000000-0000-0000-0000-000000000002',  -- ID ของหมวดหมู่
  99.00,  -- ราคา
  50,     -- จำนวนในสต็อก
  'SKU-001'  -- รหัสสินค้า (ต้องไม่ซ้ำ)
);
```

---

## 🗑️ การลบข้อมูลทั้งหมด

หากต้องการลบข้อมูลและเริ่มใหม่:

```sql
-- ลบข้อมูลทั้งหมด (ระวัง! จะลบข้อมูลทั้งหมด)
TRUNCATE TABLE pos.cash_movements CASCADE;
TRUNCATE TABLE pos.shifts CASCADE;
TRUNCATE TABLE pos.payments CASCADE;
TRUNCATE TABLE pos.order_items CASCADE;
TRUNCATE TABLE pos.orders CASCADE;
TRUNCATE TABLE erp.inventory_items CASCADE;
TRUNCATE TABLE pos.categories CASCADE;

-- จากนั้นรัน seed.sql ใหม่อีกครั้ง
```

---

## 🎯 หลังจากรัน Seed แล้ว

1. **Refresh หน้าเว็บ POS**: https://spn-pos.vercel.app/pos
2. **ตรวจสอบว่า**:
   - เห็นหมวดหมู่สินค้า 5 หมวด
   - เห็นสินค้าทั้งหมด 28 รายการ
   - สามารถกรองตามหมวดหมู่ได้
   - สามารถค้นหาสินค้าได้
   - สามารถเพิ่มสินค้าลงตะกร้าได้

---

## 📝 หมายเหตุ

- ข้อมูล UUID ของหมวดหมู่ถูกกำหนดไว้แล้ว เพื่อให้ง่ายต่อการอ้างอิง
- SKU (Stock Keeping Unit) ของแต่ละสินค้าต้องไม่ซ้ำกัน
- Stock quantity เป็นจำนวนเริ่มต้น สามารถแก้ไขได้ภายหลัง
- ราคาทั้งหมดเป็นบาท (THB)

---

## 🆘 แก้ไขปัญหา

### ปัญหา: "duplicate key value violates unique constraint"

**สาเหตุ**: ข้อมูลถูกเพิ่มไปแล้ว

**วิธีแก้**:
1. ลบข้อมูลเดิมก่อน (ดูส่วน "การลบข้อมูลทั้งหมด")
2. หรือ comment บรรทัด `ON CONFLICT (id) DO NOTHING` ออก

### ปัญหา: "relation does not exist"

**สาเหตุ**: ยังไม่ได้รัน `schema.sql`

**วิธีแก้**: รัน `schema.sql` ก่อน แล้วค่อยรัน `seed.sql`

### ปัญหา: สินค้าไม่แสดงในหน้าเว็บ

**วิธีแก้**:
1. ตรวจสอบว่ารัน seed.sql เรียบร้อยแล้ว
2. ตรวจสอบ Console ใน browser (F12) ว่ามี error หรือไม่
3. Hard refresh หน้าเว็บ (Ctrl+Shift+R หรือ Cmd+Shift+R)
4. ตรวจสอบว่า environment variables ใน Vercel ถูกต้อง

---

**เมื่อรัน seed.sql เรียบร้อยแล้ว ระบบ POS จะพร้อมใช้งานทันที!** 🎉

