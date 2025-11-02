// ERP-specific types

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
  payment_terms?: string;
  notes?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'received' | 'cancelled';
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  supplier?: Supplier;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id?: string;
  purchase_order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  received_quantity: number;
  created_at?: string;
  product?: {
    id: string;
    name: string;
    name_en?: string;
    sku?: string;
  };
}

export interface StockAdjustment {
  id?: string;
  product_id: string;
  adjustment_type: 'add' | 'remove' | 'set' | 'damage' | 'return';
  quantity_before: number;
  quantity_change: number;
  quantity_after: number;
  reason: string;
  notes?: string;
  adjusted_by?: string;
  created_at?: string;
  product?: {
    id: string;
    name: string;
    name_en?: string;
    sku?: string;
  };
}

export interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'manager' | 'cashier' | 'staff';
  pin?: string;
  status: 'active' | 'inactive';
  hire_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  todayRevenue: number;
  lowStockCount: number;
  totalProducts: number;
  totalSuppliers: number;
}

export interface SalesSummary {
  sale_date: string;
  order_count: number;
  total_subtotal: number;
  total_tax: number;
  total_discount: number;
  total_revenue: number;
}

export interface TopSellingProduct {
  id: string;
  name: string;
  name_en?: string;
  sku?: string;
  times_ordered: number;
  total_quantity_sold: number;
  total_revenue: number;
}

export interface LowStockItem {
  id: string;
  name: string;
  name_en?: string;
  sku?: string;
  stock_quantity: number;
  price: number;
  category_name?: string;
}

export interface InventoryValue {
  id: string;
  name: string;
  name_en?: string;
  sku?: string;
  stock_quantity: number;
  price: number;
  total_value: number;
  category_name?: string;
}
