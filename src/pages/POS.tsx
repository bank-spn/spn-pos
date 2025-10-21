import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { translations } from '../lib/i18n';
import type { Product, Category, ViewMode } from '../types';
import { ProductCard } from '../components/pos/ProductCard';
import { CategoryFilter } from '../components/pos/CategoryFilter';
import { SearchBar } from '../components/pos/SearchBar';
import { ViewToggle } from '../components/pos/ViewToggle';
import { CartSidebar } from '../components/cart/CartSidebar';
import { CheckoutModal } from '../components/checkout/CheckoutModal';
import toast from 'react-hot-toast';

export const POS = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);

  const { addToCart, cart, clearCart, tableNumber, discount, language } = useStore();
  const t = translations[language];

  // Fetch products and categories
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('pos.categories')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('erp.inventory_items')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      !selectedCategory || product.category_id === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name_en?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product: Product) => {
    addToCart({ product, quantity: 1 });
    toast.success(`${product.name} added to cart`);
  };

  const handleCheckout = async (
    paymentMethod: 'cash' | 'card' | 'qr',
    receivedAmount?: number
  ) => {
    try {
      const subtotal = cart.reduce(
        (sum, item) =>
          sum + (item.price_override || item.product.price) * item.quantity,
        0
      );
      const tax = subtotal * 0.07;
      const total = subtotal + tax - discount;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('pos.orders')
        .insert({
          table_number: tableNumber || null,
          subtotal,
          tax,
          discount,
          total,
          status: 'completed',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.price_override || item.product.price,
        subtotal:
          (item.price_override || item.product.price) * item.quantity,
        notes: item.notes,
      }));

      const { error: itemsError } = await supabase
        .from('pos.order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create payment
      const { error: paymentError } = await supabase
        .from('pos.payments')
        .insert({
          order_id: order.id,
          payment_method: paymentMethod,
          amount: total,
          received_amount: receivedAmount,
          change_amount: receivedAmount ? receivedAmount - total : 0,
        });

      if (paymentError) throw paymentError;

      // Update inventory (deduct stock)
      for (const item of cart) {
        const { error: inventoryError } = await supabase.rpc(
          'deduct_inventory',
          {
            product_id: item.product.id,
            quantity: item.quantity,
          }
        );

        if (inventoryError) {
          console.error('Error updating inventory:', inventoryError);
        }
      }

      toast.success(t.orderCompleted);
      clearCart();
      setShowCheckout(false);
      fetchProducts(); // Refresh products to show updated stock
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(t.orderFailed);
    }
  };

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + (item.price_override || item.product.price) * item.quantity,
    0
  );
  const tax = subtotal * 0.07;
  const total = subtotal + tax - discount;

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <h1 className="text-2xl font-bold mb-1">{t.posSystem}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t.posSubtitle}
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <div className="flex gap-4 items-center">
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            <div className="flex-1">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">Loading...</div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">No products found</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar onCheckout={() => setShowCheckout(true)} />

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          subtotal={subtotal}
          tax={tax}
          discount={discount}
          total={total}
          onClose={() => setShowCheckout(false)}
          onConfirm={handleCheckout}
        />
      )}
    </div>
  );
};

