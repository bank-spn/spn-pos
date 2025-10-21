import { useState } from 'react';
import { X, Banknote, CreditCard, QrCode } from 'lucide-react';
import { useStore } from '../../lib/store';
import { translations } from '../../lib/i18n';

interface CheckoutModalProps {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  onClose: () => void;
  onConfirm: (paymentMethod: 'cash' | 'card' | 'qr', receivedAmount?: number) => void;
}

export const CheckoutModal = ({
  subtotal,
  tax,
  discount,
  total,
  onClose,
  onConfirm,
}: CheckoutModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qr'>('cash');
  const [receivedAmount, setReceivedAmount] = useState(total.toString());
  const { language } = useStore();
  const t = translations[language];

  const change = paymentMethod === 'cash' ? parseFloat(receivedAmount) - total : 0;

  const handleConfirm = () => {
    if (paymentMethod === 'cash') {
      const received = parseFloat(receivedAmount);
      if (received >= total) {
        onConfirm(paymentMethod, received);
      }
    } else {
      onConfirm(paymentMethod);
    }
  };

  const paymentMethods = [
    { id: 'cash', icon: Banknote, label: t.cash },
    { id: 'card', icon: CreditCard, label: t.card },
    { id: 'qr', icon: QrCode, label: t.qr },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{t.checkout}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 space-y-2 text-sm">
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
          <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-600">
            <span>{t.total}:</span>
            <span className="text-primary-600 dark:text-primary-400">
              ฿{total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-3">
            {t.selectPaymentMethod}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === method.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <method.icon className="w-8 h-8" />
                <span className="text-sm font-medium">{method.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cash Payment Details */}
        {paymentMethod === 'cash' && (
          <div className="mb-6 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t.receivedAmount}
              </label>
              <input
                type="number"
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
                step="0.01"
              />
            </div>
            {change >= 0 && (
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>{t.change}:</span>
                <span className="text-green-600 dark:text-green-400">
                  ฿{change.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={paymentMethod === 'cash' && parseFloat(receivedAmount) < total}
            className="flex-1 px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {t.confirmPayment}
          </button>
        </div>
      </div>
    </div>
  );
};

