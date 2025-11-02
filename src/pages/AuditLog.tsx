import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { Search, Filter, Download, Eye, X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderWithItems {
  id: string;
  tableNumber: string;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  status: string;
  createdAt: string;
  items: {
    productName: string;
    quantity: number;
    price: number;
    notes: string | null;
  }[];
  payments: {
    method: string;
    amount: number;
  }[];
}

export const AuditLog = () => {
  const { language } = useStore();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchTerm, statusFilter, dateFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: ordersData } = await supabase
        .from('pos.orders')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: orderItems } = await supabase
        .from('pos.order_items')
        .select('*');

      const { data: payments } = await supabase
        .from('pos.payments')
        .select('*');

      const formatted = ordersData?.map(order => ({
        id: order.id,
        tableNumber: order.table_number || '-',
        total: parseFloat(order.total || '0'),
        subtotal: parseFloat(order.subtotal || '0'),
        tax: parseFloat(order.tax || '0'),
        discount: parseFloat(order.discount || '0'),
        status: order.status,
        createdAt: order.created_at,
        items: orderItems?.filter((item: any) => item.order_id === order.id).map((item: any) => ({
          productName: item.product_name,
          quantity: item.quantity,
          price: parseFloat(item.price),
          notes: item.notes
        })) || [],
        payments: payments?.filter((payment: any) => payment.order_id === order.id).map((payment: any) => ({
          method: payment.payment_method,
          amount: parseFloat(payment.amount)
        })) || []
      })) || [];

      setOrders(formatted);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(language === 'th' ? 'เกิดข้อผิดพลาด' : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.tableNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);

        switch (dateFilter) {
          case 'today':
            return orderDate >= today;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredOrders(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Table', 'Status', 'Items', 'Total', 'Date'];
    const rows = filteredOrders.map(order => [
      order.id,
      order.tableNumber,
      order.status,
      order.items.length,
      order.total.toFixed(2),
      new Date(order.createdAt).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success(language === 'th' ? 'ส่งออกสำเร็จ' : 'Export successful');
  };

  const viewOrderDetails = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, { th: string; en: string }> = {
      cash: { th: 'เงินสด', en: 'Cash' },
      card: { th: 'บัตร', en: 'Card' },
      qr: { th: 'QR Code', en: 'QR Code' }
    };
    return labels[method]?.[language] || method;
  };

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
            {language === 'th' ? 'บันทึกการตรวจสอบ' : 'Audit Log'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'th' ? 'ประวัติการทำรายการทั้งหมด' : 'All transaction history'}
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Download className="w-5 h-5" />
          {language === 'th' ? 'ส่งออก CSV' : 'Export CSV'}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'th' ? 'ค้นหาด้วย Order ID หรือโต๊ะ...' : 'Search by Order ID or table...'}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white appearance-none"
          >
            <option value="all">{language === 'th' ? 'สถานะทั้งหมด' : 'All Status'}</option>
            <option value="completed">{language === 'th' ? 'สำเร็จ' : 'Completed'}</option>
            <option value="pending">{language === 'th' ? 'รอดำเนินการ' : 'Pending'}</option>
            <option value="cancelled">{language === 'th' ? 'ยกเลิก' : 'Cancelled'}</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white appearance-none"
          >
            <option value="all">{language === 'th' ? 'ช่วงเวลาทั้งหมด' : 'All Time'}</option>
            <option value="today">{language === 'th' ? 'วันนี้' : 'Today'}</option>
            <option value="week">{language === 'th' ? '7 วันที่แล้ว' : 'Last 7 Days'}</option>
            <option value="month">{language === 'th' ? '30 วันที่แล้ว' : 'Last 30 Days'}</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'th' ? 'ออเดอร์ทั้งหมด' : 'Total Orders'}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredOrders.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'th' ? 'ยอดรวม' : 'Total Revenue'}
          </p>
          <p className="text-2xl font-bold text-green-600">
            ฿{filteredOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'th' ? 'สำเร็จ' : 'Completed'}
          </p>
          <p className="text-2xl font-bold text-green-600">
            {filteredOrders.filter(o => o.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'th' ? 'ค่าเฉลี่ย' : 'Average Order'}
          </p>
          <p className="text-2xl font-bold text-blue-600">
            ฿{filteredOrders.length > 0
              ? (filteredOrders.reduce((sum, order) => sum + order.total, 0) / filteredOrders.length).toFixed(2)
              : '0.00'
            }
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  {language === 'th' ? 'โต๊ะ' : 'Table'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  {language === 'th' ? 'รายการ' : 'Items'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  {language === 'th' ? 'ยอดรวม' : 'Total'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  {language === 'th' ? 'สถานะ' : 'Status'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  {language === 'th' ? 'วันที่' : 'Date'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                  {language === 'th' ? 'จัดการ' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {language === 'th' ? 'ไม่พบข้อมูล' : 'No orders found'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {order.tableNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} {language === 'th' ? 'รายการ' : 'items'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                      ฿{order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleString(language === 'th' ? 'th-TH' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        {language === 'th' ? 'ดู' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'th' ? 'รายละเอียดออเดอร์' : 'Order Details'}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Order Info */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">Order ID</p>
                <p className="font-mono text-sm text-gray-900 dark:text-white">{selectedOrder.id}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {language === 'th' ? 'โต๊ะ' : 'Table'}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedOrder.tableNumber}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {language === 'th' ? 'สถานะ' : 'Status'}
                </p>
                <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {language === 'th' ? 'วันที่' : 'Date'}
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(selectedOrder.createdAt).toLocaleString(language === 'th' ? 'th-TH' : 'en-US')}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="mb-6">
              <h4 className="font-bold mb-3 text-gray-900 dark:text-white">
                {language === 'th' ? 'รายการสินค้า' : 'Items'}
              </h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{item.productName}</p>
                      {item.notes && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {language === 'th' ? 'หมายเหตุ:' : 'Note:'} {item.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.quantity} x ฿{item.price.toFixed(2)}
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        ฿{(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {language === 'th' ? 'ยอดรวม' : 'Subtotal'}
                  </span>
                  <span className="text-gray-900 dark:text-white">฿{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {language === 'th' ? 'ภาษี (7%)' : 'Tax (7%)'}
                  </span>
                  <span className="text-gray-900 dark:text-white">฿{selectedOrder.tax.toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {language === 'th' ? 'ส่วนลด' : 'Discount'}
                    </span>
                    <span className="text-red-600">-฿{selectedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
                  <span className="text-gray-900 dark:text-white">
                    {language === 'th' ? 'รวมทั้งสิ้น' : 'Total'}
                  </span>
                  <span className="text-gray-900 dark:text-white">฿{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              {selectedOrder.payments.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold mb-2 text-gray-900 dark:text-white">
                    {language === 'th' ? 'การชำระเงิน' : 'Payment Methods'}
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.payments.map((payment, index) => (
                      <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-gray-600 dark:text-gray-400">
                          {getPaymentMethodLabel(payment.method)}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          ฿{payment.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                {language === 'th' ? 'ปิด' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

