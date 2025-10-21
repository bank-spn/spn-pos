import { Minus, Plus, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import type { CartItem as CartItemType } from '../../types';
import { useStore } from '../../lib/store';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem = ({ item }: CartItemProps) => {
  const { updateCartItem, removeFromCart, language } = useStore();
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState(
    (item.price_override || item.product.price).toString()
  );

  const displayName =
    language === 'en' && item.product.name_en
      ? item.product.name_en
      : item.product.name;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity > 0) {
      updateCartItem(item.product.id, { quantity: newQuantity });
    }
  };

  const handlePriceUpdate = () => {
    const newPrice = parseFloat(priceInput);
    if (!isNaN(newPrice) && newPrice > 0) {
      updateCartItem(item.product.id, { price_override: newPrice });
    }
    setIsEditingPrice(false);
  };

  const currentPrice = item.price_override || item.product.price;

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-sm">{displayName}</h4>
          {item.notes && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {item.notes}
            </p>
          )}
        </div>
        <button
          onClick={() => removeFromCart(item.product.id)}
          className="text-red-500 hover:text-red-600 p-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuantityChange(-1)}
            className="p-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <button
            onClick={() => handleQuantityChange(1)}
            className="p-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          {isEditingPrice ? (
            <input
              type="number"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              onBlur={handlePriceUpdate}
              onKeyPress={(e) => e.key === 'Enter' && handlePriceUpdate()}
              className="w-20 px-2 py-1 text-sm border rounded dark:bg-gray-600"
              autoFocus
            />
          ) : (
            <>
              <span className="font-semibold">
                ฿{(currentPrice * item.quantity).toFixed(2)}
              </span>
              <button
                onClick={() => {
                  setIsEditingPrice(true);
                  setPriceInput(currentPrice.toString());
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

