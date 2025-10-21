export interface Product {
  id: string;
  name: string;
  name_en?: string;
  price: number;
  category_id: string;
  image_url?: string;
  stock_quantity: number;
  sku?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  name_en?: string;
  icon?: string;
  sort_order?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  price_override?: number;
  notes?: string;
}

export interface Order {
  id?: string;
  table_number?: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at?: string;
  shift_id?: string;
}

export interface OrderItem {
  id?: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
}

export interface Payment {
  id?: string;
  order_id: string;
  payment_method: 'cash' | 'card' | 'qr';
  amount: number;
  received_amount?: number;
  change_amount?: number;
  created_at?: string;
}

export interface Shift {
  id?: string;
  cashier_name?: string;
  start_time: string;
  end_time?: string;
  starting_cash: number;
  ending_cash?: number;
  status: 'open' | 'closed';
}

export interface CashMovement {
  id?: string;
  shift_id: string;
  type: 'in' | 'out';
  amount: number;
  reason: string;
  created_at?: string;
}

export type Language = 'th' | 'en';

export type ViewMode = 'grid' | 'list';

