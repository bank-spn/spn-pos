import { useStore } from '../../lib/store';
import { translations } from '../../lib/i18n';

interface CartSummaryProps {
  subtotal: number;
  onCheckout: () => void;
}

export const CartSummary = ({ subtotal, onCheckout }: CartSummaryProps) => {
  const { cart, discount, language } = useStore();
  const t = translations[language];

  const tax = subtotal * 0.07; // 7% tax
  const total = subtotal + tax - discount;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
      {/* Summary Lines */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>{t.subtotal}:</span>
          <span>฿{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>{t.tax} (7%):</span>
          <span>฿{tax.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-red-500">
            <span>{t.discount}:</span>
            <span>-฿{discount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
        <span>{t.total}:</span>
        <span className="text-primary-600 dark:text-primary-400">
          ฿{total.toFixed(2)}
        </span>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={cart.length === 0}
        className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
      >
        {t.checkout}
      </button>
    </div>
  );
};

