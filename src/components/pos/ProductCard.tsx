import { Plus } from 'lucide-react';
import type { Product } from '../../types';
import { useStore } from '../../lib/store';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const { language } = useStore();
  const displayName = language === 'en' && product.name_en ? product.name_en : product.name;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-4xl">🍽️</div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{displayName}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
            ฿{product.price.toFixed(2)}
          </span>
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock_quantity <= 0}
            className="p-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {product.stock_quantity <= 0 && (
          <p className="text-xs text-red-500 mt-1">Out of stock</p>
        )}
        {product.stock_quantity > 0 && product.stock_quantity < 10 && (
          <p className="text-xs text-orange-500 mt-1">Stock: {product.stock_quantity}</p>
        )}
      </div>
    </div>
  );
};

