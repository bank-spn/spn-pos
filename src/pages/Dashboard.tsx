import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { translations } from '../lib/i18n';
import { dashboardApi, orderApi } from '../lib/api';
import { StatsCard } from '../components/common/StatsCard';
import { SimpleBarChart } from '../components/common/SimpleBarChart';
import { DataTable, Column } from '../components/common/DataTable';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Package,
  Users,
} from 'lucide-react';
import type { DashboardStats, SalesSummary } from '../types/erp';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const { language } = useStore();
  const t = translations[language];
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesSummary, setS alesSummary] = useState<SalesSummary[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, salesData, ordersData] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getSalesSummary(7),
        orderApi.getAll(),
      ]);

      setStats(statsData);
      setSalesSummary(salesData);
      setRecentOrders(ordersData.slice(0, 10));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const orderColumns: Column<any>[] = [
    {
      key: 'created_at',
      header: language === 'th' ? 'วันที่' : 'Date',
      render: (order) => new Date(order.created_at).toLocaleString(),
    },
    {
      key: 'table_number',
      header: language === 'th' ? 'โต๊ะ' : 'Table',
      render: (order) => order.table_number || '-',
    },
    {
      key: 'total',
      header: language === 'th' ? 'ยอดรวม' : 'Total',
      render: (order) => `฿${Number(order.total).toFixed(2)}`,
    },
    {
      key: 'status',
      header: language === 'th' ? 'สถานะ' : 'Status',
      render: (order) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            order.status === 'completed'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : order.status === 'cancelled'
              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
          }`}
        >
          {order.status}
        </span>
      ),
    },
  ];

  const chartData = salesSummary.map((item) => ({
    label: new Date(item.sale_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: Number(item.total_revenue),
  })).reverse();

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t.dashboard}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {language === 'th' ? 'ภาพรวมธุรกิจของคุณ' : 'Your business overview'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title={language === 'th' ? 'ยอดขายวันนี้' : "Today's Revenue"}
          value={`฿${stats?.todayRevenue.toFixed(2) || '0.00'}`}
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title={language === 'th' ? 'ออเดอร์วันนี้' : "Today's Orders"}
          value={stats?.todayOrders || 0}
          icon={ShoppingCart}
          color="blue"
        />
        <StatsCard
          title={language === 'th' ? 'สินค้าใกล้หมด' : 'Low Stock Items'}
          value={stats?.lowStockCount || 0}
          icon={AlertTriangle}
          color="red"
        />
        <StatsCard
          title={language === 'th' ? 'สินค้าทั้งหมด' : 'Total Products'}
          value={stats?.totalProducts || 0}
          icon={Package}
          color="purple"
        />
        <StatsCard
          title={language === 'th' ? 'ซัพพลายเออร์' : 'Suppliers'}
          value={stats?.totalSuppliers || 0}
          icon={Users}
          color="yellow"
        />
        <StatsCard
          title={language === 'th' ? 'ยอดขายเฉลี่ย' : 'Avg. Sale'}
          value={`฿${stats?.todayOrders ? (stats.todayRevenue / stats.todayOrders).toFixed(2) : '0.00'}`}
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Sales Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">
          {language === 'th' ? 'ยอดขาย 7 วันที่ผ่านมา' : 'Sales Last 7 Days'}
        </h2>
        <SimpleBarChart data={chartData} height={300} color="#3b82f6" />
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="text-xl font-bold mb-4">
          {language === 'th' ? 'ออเดอร์ล่าสุด' : 'Recent Orders'}
        </h2>
        <DataTable
          columns={orderColumns}
          data={recentOrders}
          emptyMessage={language === 'th' ? 'ไม่มีออเดอร์' : 'No orders yet'}
        />
      </div>
    </div>
  );
};
