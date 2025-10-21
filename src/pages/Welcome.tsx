import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package } from 'lucide-react';
import { useStore } from '../lib/store';

export const Welcome = () => {
  const navigate = useNavigate();
  const { language } = useStore();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">SPN rOS</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {language === 'th'
              ? 'ระบบจัดการร้านค้าครบวงจร'
              : 'Complete Store Management System'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* POS Card */}
          <button
            onClick={() => navigate('/pos')}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="w-12 h-12 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3">
                {language === 'th' ? 'ระบบขายหน้าร้าน' : 'Point of Sale'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'th'
                  ? 'จัดการการขายและรับชำระเงิน'
                  : 'Manage sales and payments'}
              </p>
            </div>
          </button>

          {/* ERP Card (Visual Only) */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl opacity-50 cursor-not-allowed">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold mb-3">
                {language === 'th' ? 'ระบบจัดการคลังสินค้า' : 'ERP System'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'th'
                  ? 'จัดการสินค้าคงคลังและรายงาน'
                  : 'Manage inventory and reports'}
              </p>
              <span className="mt-4 text-sm text-gray-500">
                {language === 'th' ? 'เร็วๆ นี้' : 'Coming Soon'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

