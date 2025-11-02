import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Calendar, Clock } from 'lucide-react';

interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  todayRevenue: number;
  lowStockItems: number;
  avgOrderValue: number;
  totalProducts: number;
  completedOrders: number;
  pendingOrders: number;
}

interface TopProduct {
  name: string;
  nameTh: string;
  quantity: number;
  revenue: number;
}

interface RecentOrder {
  id: string;
  tableNumber: string;
  total: number;
  status: string;
  createdAt: string;
  itemCount: number;
}

export const Dashboard = () => {
  const { language } = useStore();
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    todayOrders: 0,
    todayRevenue: 0,
    lowStockItems: 0,
    avgOrderValue: 0,
    totalProducts: 0,
    completedOrders: 0,
    pendingOrders: 0,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch today's orders
      const { data: todayOrders } = await supabase
        .from('pos.orders')
        .select('*')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      // Fetch all orders for overall stats
      const { data: allOrders } = await supabase
        .from('pos.orders')
        .select('*');

      // Fetch all order items
      const { data: allOrderItems } = await supabase
        .from('pos.order_items')
        .select('*');

      // Fetch low stock items
      const { data: inventory } = await supabase
        .from('erp.inventory_items')
        .select('*');

      const lowStock = inventory?.filter(item => item.stock_quantity < 10).length || 0;
      const totalProducts = inventory?.length || 0;

      // Calculate today's stats
      const completedToday = todayOrders?.filter(o => o.status === 'completed') || [];
      const todayRevenue = completedToday.reduce((sum, order) => sum + parseFloat(order.total || '0'), 0);
      const todayOrderCount = completedToday.length;
      const avgOrder = todayOrderCount > 0 ? todayRevenue / todayOrderCount : 0;

      // Calculate overall order stats
      const completed = allOrders?.filter(o => o.status === 'completed').length || 0;
      const pending = allOrders?.filter(o => o.status === 'pending').length || 0;

      setStats({
        todaySales: todayOrderCount,
        todayOrders: todayOrders?.length || 0,
        todayRevenue,
        lowStockItems: lowStock,
        avgOrderValue: avgOrder,
        totalProducts,
        completedOrders: completed,
        pendingOrders: pending,
      });

      // Calculate top products
      const productSales = new Map<string, { name: string; nameTh: string; quantity: number; revenue: number }>();
      const completedOrderIds = allOrders?.filter(o => o.status === 'completed').map(o => o.id) || [];

      allOrderItems?.forEach((item: any) => {
        if (completedOrderIds.includes(item.order_id)) {
          const existing = productSales.get(item.product_id) || {
            name: item.product_name || 'Unknown',
            nameTh: item.product_name || 'ไม่ระบุ',
            quantity: 0,
            revenue: 0
          };
          productSales.set(item.product_id, {
            ...existing,
            quantity: existing.quantity + item.quantity,
            revenue: existing.revenue + (parseFloat(item.price) * item.quantity),
          });
        }
      });

      const topProds = Array.from(productSales.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      setTopProducts(topProds);

      // Get recent orders
      const { data: recent } = await supabase
        .from('pos.orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const recentFormatted = recent?.map(order => {
        const orderItems = allOrderItems?.filter((item: any) => item.order_id === order.id) || [];
        const itemCount = orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

        return {
          id: order.id,
          tableNumber: order.table_number || '-',
          total: parseFloat(order.total || '0'),
          status: order.status,
          createdAt: order.created_at,
          itemCount,
        };
      }) || [];

      setRecentOrders(recentFormatted);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center mt-2 text-sm">
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={trend >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'th' ? 'แดชบอร์ด' : 'Dashboard'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'th' ? 'สรุปภาพรวมของร้านค้า' : 'Store overview summary'}
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {language === 'th' ? 'รีเฟรช' : 'Refresh'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={language === 'th' ? 'ยอดขายวันนี้' : "Today's Sales"}
          value={`฿${stats.todayRevenue.toFixed(2)}`}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title={language === 'th' ? 'จำนวนออเดอร์วันนี้' : "Today's Orders"}
          value={stats.todaySales}
          icon={ShoppingCart}
          color="bg-blue-500"
        />
        <StatCard
          title={language === 'th' ? 'ค่าเฉลี่ยต่อออเดอร์' : 'Avg Order Value'}
          value={`฿${stats.avgOrderValue.toFixed(2)}`}
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <StatCard
          title={language === 'th' ? 'สินค้าใกล้หมด' : 'Low Stock Items'}
          value={stats.lowStockItems}
          icon={Package}
          color="bg-red-500"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Package className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {language === 'th' ? 'สินค้าทั้งหมด' : 'Total Products'}
              </p>
              <p className="text-lg font-bold">{stats.totalProducts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <ShoppingCart className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {language === 'th' ? 'ออเดอร์สำเร็จ' : 'Completed'}
              </p>
              <p className="text-lg font-bold">{stats.completedOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {language === 'th' ? 'กำลังดำเนินการ' : 'Pending'}
              </p>
              <p className="text-lg font-bold">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {language === 'th' ? 'ออเดอร์วันนี้' : "Today's Orders"}
              </p>
              <p className="text-lg font-bold">{stats.todayOrders}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            {language === 'th' ? 'สินค้าขายดี' : 'Top Products'}
          </h2>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                {language === 'th' ? 'ไม่มีข้อมูล' : 'No data available'}
              </p>
            ) : (
              topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {language === 'th' ? product.nameTh : product.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'th' ? 'ขาย' : 'Sold'} {product.quantity} {language === 'th' ? 'ชิ้น' : 'items'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">฿{product.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            {language === 'th' ? 'ออเดอร์ล่าสุด' : 'Recent Orders'}
          </h2>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                {language === 'th' ? 'ไม่มีข้อมูล' : 'No orders yet'}
              </p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {language === 'th' ? 'โต๊ะ' : 'Table'} {order.tableNumber}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.itemCount} {language === 'th' ? 'รายการ' : 'items'} • {new Date(order.createdAt).toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">฿{order.total.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

