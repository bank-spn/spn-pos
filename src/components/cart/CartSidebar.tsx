import { X, ShoppingCart as CartIcon } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../lib/store';
import { translations } from '../../lib/i18n';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';

interface CartSidebarProps {
  onCheckout: () => void;
}

export const CartSidebar = ({ onCheckout }: CartSidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const { cart, tableNumber, setTableNumber, language } = useStore();
  const t = translations[language];

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.price_override || item.product.price) * item.quantity,
    0
  );

  return (
    <>
      {/* Toggle Button (when collapsed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-4 top-4 bg-primary-500 text-white p-3 rounded-full shadow-lg hover:bg-primary-600 transition-colors z-40"
        >
          <CartIcon className="w-6 h-6" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'w-96' : 'w-0'
        } bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">{t.orderList}</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table Number Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium mb-2">{t.tableNumber}</label>
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder={t.tableNumberPlaceholder}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
          />
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <CartIcon className="w-16 h-16 mb-4" />
              <p>{t.emptyCart}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <CartSummary subtotal={subtotal} onCheckout={onCheckout} />
      </aside>
    </>
  );
};

