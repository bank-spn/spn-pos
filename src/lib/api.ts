// API service layer for all database operations
import { supabase } from './supabase';
import type { Product } from '../types';
import type {
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  StockAdjustment,
  Employee,
  DashboardStats,
  SalesSummary,
  TopSellingProduct,
  LowStockItem,
  InventoryValue,
} from '../types/erp';

// =====================================================
// Products / Inventory
// =====================================================

export const productApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('erp.inventory_items')
      .select('*, category:pos.categories(id, name, name_en)')
      .order('name');
    if (error) throw error;
    return data as Product[];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('erp.inventory_items')
      .select('*, category:pos.categories(id, name, name_en)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Product;
  },

  create: async (product: Partial<Product>) => {
    const { data, error } = await supabase
      .from('erp.inventory_items')
      .insert(product)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },

  update: async (id: string, product: Partial<Product>) => {
    const { data, error } = await supabase
      .from('erp.inventory_items')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('erp.inventory_items')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  getLowStock: async () => {
    const { data, error } = await supabase
      .from('erp.low_stock_items')
      .select('*');
    if (error) throw error;
    return data as LowStockItem[];
  },

  getInventoryValue: async () => {
    const { data, error } = await supabase
      .from('erp.inventory_value')
      .select('*');
    if (error) throw error;
    return data as InventoryValue[];
  },
};

// =====================================================
// Suppliers
// =====================================================

export const supplierApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('erp.suppliers')
      .select('*')
      .order('name');
    if (error) throw error;
    return data as Supplier[];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('erp.suppliers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Supplier;
  },

  create: async (supplier: Partial<Supplier>) => {
    const { data, error } = await supabase
      .from('erp.suppliers')
      .insert(supplier)
      .select()
      .single();
    if (error) throw error;
    return data as Supplier;
  },

  update: async (id: string, supplier: Partial<Supplier>) => {
    const { data, error } = await supabase
      .from('erp.suppliers')
      .update(supplier)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Supplier;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('erp.suppliers')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// =====================================================
// Purchase Orders
// =====================================================

export const purchaseOrderApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('erp.purchase_orders')
      .select(`
        *,
        supplier:erp.suppliers(id, name),
        items:erp.purchase_order_items(
          *,
          product:erp.inventory_items(id, name, name_en, sku)
        )
      `)
      .order('order_date', { ascending: false });
    if (error) throw error;
    return data as PurchaseOrder[];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('erp.purchase_orders')
      .select(`
        *,
        supplier:erp.suppliers(*),
        items:erp.purchase_order_items(
          *,
          product:erp.inventory_items(id, name, name_en, sku, price)
        )
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as PurchaseOrder;
  },

  create: async (po: Partial<PurchaseOrder>, items: Partial<PurchaseOrderItem>[]) => {
    // Generate PO number
    const { data: poNumberData, error: poNumberError } = await supabase
      .rpc('generate_po_number');
    if (poNumberError) throw poNumberError;

    // Create PO
    const { data: poData, error: poError } = await supabase
      .from('erp.purchase_orders')
      .insert({ ...po, po_number: poNumberData })
      .select()
      .single();
    if (poError) throw poError;

    // Create PO items
    const itemsWithPoId = items.map(item => ({
      ...item,
      purchase_order_id: poData.id,
    }));

    const { error: itemsError } = await supabase
      .from('erp.purchase_order_items')
      .insert(itemsWithPoId);
    if (itemsError) throw itemsError;

    return poData as PurchaseOrder;
  },

  update: async (id: string, po: Partial<PurchaseOrder>) => {
    const { data, error } = await supabase
      .from('erp.purchase_orders')
      .update(po)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as PurchaseOrder;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('erp.purchase_orders')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  receive: async (id: string, receivedItems: { product_id: string; received_quantity: number }[]) => {
    const { error } = await supabase
      .rpc('receive_purchase_order', {
        p_purchase_order_id: id,
        p_received_items: receivedItems,
      });
    if (error) throw error;
  },
};

// =====================================================
// Stock Adjustments
// =====================================================

export const stockAdjustmentApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('erp.stock_adjustments')
      .select(`
        *,
        product:erp.inventory_items(id, name, name_en, sku)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as StockAdjustment[];
  },

  getByProduct: async (productId: string) => {
    const { data, error } = await supabase
      .from('erp.stock_adjustments')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as StockAdjustment[];
  },

  create: async (adjustment: {
    product_id: string;
    adjustment_type: 'add' | 'remove' | 'set' | 'damage' | 'return';
    quantity_change: number;
    reason: string;
    notes?: string;
    adjusted_by?: string;
  }) => {
    const { error } = await supabase.rpc('adjust_stock', {
      p_product_id: adjustment.product_id,
      p_adjustment_type: adjustment.adjustment_type,
      p_quantity_change: adjustment.quantity_change,
      p_reason: adjustment.reason,
      p_notes: adjustment.notes,
      p_adjusted_by: adjustment.adjusted_by,
    });
    if (error) throw error;
  },
};

// =====================================================
// Employees
// =====================================================

export const employeeApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('erp.employees')
      .select('*')
      .order('employee_code');
    if (error) throw error;
    return data as Employee[];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('erp.employees')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Employee;
  },

  create: async (employee: Partial<Employee>) => {
    const { data, error } = await supabase
      .from('erp.employees')
      .insert(employee)
      .select()
      .single();
    if (error) throw error;
    return data as Employee;
  },

  update: async (id: string, employee: Partial<Employee>) => {
    const { data, error } = await supabase
      .from('erp.employees')
      .update(employee)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Employee;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('erp.employees')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};

// =====================================================
// Dashboard & Reports
// =====================================================

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const today = new Date().toISOString().split('T')[0];

    // Today's orders
    const { data: todayOrders, error: ordersError } = await supabase
      .from('pos.orders')
      .select('id, total, status')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)
      .eq('status', 'completed');
    if (ordersError) throw ordersError;

    // Low stock items
    const { data: lowStock, error: lowStockError } = await supabase
      .from('erp.low_stock_items')
      .select('id');
    if (lowStockError) throw lowStockError;

    // Total products
    const { count: productsCount, error: productsError } = await supabase
      .from('erp.inventory_items')
      .select('*', { count: 'exact', head: true });
    if (productsError) throw productsError;

    // Total suppliers
    const { count: suppliersCount, error: suppliersError } = await supabase
      .from('erp.suppliers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    if (suppliersError) throw suppliersError;

    const todayRevenue = todayOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

    return {
      todaySales: todayOrders?.length || 0,
      todayOrders: todayOrders?.length || 0,
      todayRevenue,
      lowStockCount: lowStock?.length || 0,
      totalProducts: productsCount || 0,
      totalSuppliers: suppliersCount || 0,
    };
  },

  getSalesSummary: async (days: number = 30) => {
    const { data, error } = await supabase
      .from('pos.sales_summary')
      .select('*')
      .limit(days);
    if (error) throw error;
    return data as SalesSummary[];
  },

  getTopSellingProducts: async (limit: number = 10) => {
    const { data, error } = await supabase
      .from('pos.top_selling_products')
      .select('*')
      .limit(limit);
    if (error) throw error;
    return data as TopSellingProduct[];
  },
};

// =====================================================
// Orders (for reports)
// =====================================================

export const orderApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('pos.orders')
      .select(`
        *,
        items:pos.order_items(
          *,
          product:erp.inventory_items(id, name, name_en, sku)
        ),
        payments:pos.payments(*)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  getByDateRange: async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from('pos.orders')
      .select(`
        *,
        items:pos.order_items(
          *,
          product:erp.inventory_items(id, name, name_en, sku)
        ),
        payments:pos.payments(*)
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
};

// =====================================================
// Categories
// =====================================================

export const categoryApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('pos.categories')
      .select('*')
      .order('sort_order');
    if (error) throw error;
    return data;
  },
};
