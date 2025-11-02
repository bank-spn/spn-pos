import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { DollarSign, Clock, TrendingUp, TrendingDown, Plus, X, LogIn, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

interface Shift {
  id: string;
  cashierName: string;
  startingCash: number;
  endingCash: number | null;
  startedAt: string;
  endedAt: string | null;
  status: 'open' | 'closed';
}

interface CashMovement {
  id: string;
  shiftId: string;
  type: 'in' | 'out';
  amount: number;
  reason: string;
  createdAt: string;
}

export const Cashier = () => {
  const { language } = useStore();
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [showCashMovementModal, setShowCashMovementModal] = useState(false);

  // Form states
  const [cashierName, setCashierName] = useState('');
  const [startingCash, setStartingCash] = useState('');
  const [endingCash, setEndingCash] = useState('');
  const [movementType, setMovementType] = useState<'in' | 'out'>('in');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementReason, setMovementReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch current open shift
      const { data: openShifts } = await supabase
        .from('pos.shifts')
        .select('*')
        .eq('status', 'open')
        .order('started_at', { ascending: false })
        .limit(1);

      if (openShifts && openShifts.length > 0) {
        setCurrentShift(openShifts[0]);

        // Fetch cash movements for current shift
        const { data: movements } = await supabase
          .from('pos.cash_movements')
          .select('*')
          .eq('shift_id', openShifts[0].id)
          .order('created_at', { ascending: false });

        setCashMovements(movements || []);
      } else {
        setCurrentShift(null);
        setCashMovements([]);
      }

      // Fetch all shifts
      const { data: allShifts } = await supabase
        .from('pos.shifts')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      setShifts(allShifts || []);
    } catch (error) {
      console.error('Error fetching cashier data:', error);
      toast.error(language === 'th' ? 'เกิดข้อผิดพลาด' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenShift = async () => {
    if (!cashierName || !startingCash) {
      toast.error(language === 'th' ? 'กรุณากรอกข้อมูลให้ครบ' : 'Please fill in all fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pos.shifts')
        .insert([{
          cashier_name: cashierName,
          starting_cash: parseFloat(startingCash),
          status: 'open'
        }])
        .select()
        .single();

      if (error) throw error;

      setCurrentShift(data);
      setShowOpenShiftModal(false);
      setCashierName('');
      setStartingCash('');
      toast.success(language === 'th' ? 'เปิดกะสำเร็จ' : 'Shift opened successfully');
      fetchData();
    } catch (error) {
      console.error('Error opening shift:', error);
      toast.error(language === 'th' ? 'เกิดข้อผิดพลาด' : 'Failed to open shift');
    }
  };

  const handleCloseShift = async () => {
    if (!currentShift || !endingCash) {
      toast.error(language === 'th' ? 'กรุณากรอกยอดเงินสิ้นสุด' : 'Please enter ending cash amount');
      return;
    }

    try {
      const { error } = await supabase
        .from('pos.shifts')
        .update({
          ending_cash: parseFloat(endingCash),
          ended_at: new Date().toISOString(),
          status: 'closed'
        })
        .eq('id', currentShift.id);

      if (error) throw error;

      setShowCloseShiftModal(false);
      setEndingCash('');
      setCurrentShift(null);
      toast.success(language === 'th' ? 'ปิดกะสำเร็จ' : 'Shift closed successfully');
      fetchData();
    } catch (error) {
      console.error('Error closing shift:', error);
      toast.error(language === 'th' ? 'เกิดข้อผิดพลาด' : 'Failed to close shift');
    }
  };

  const handleCashMovement = async () => {
    if (!currentShift || !movementAmount || !movementReason) {
      toast.error(language === 'th' ? 'กรุณากรอกข้อมูลให้ครบ' : 'Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('pos.cash_movements')
        .insert([{
          shift_id: currentShift.id,
          type: movementType,
          amount: parseFloat(movementAmount),
          reason: movementReason
        }]);

      if (error) throw error;

      setShowCashMovementModal(false);
      setMovementAmount('');
      setMovementReason('');
      toast.success(language === 'th' ? 'บันทึกสำเร็จ' : 'Movement recorded successfully');
      fetchData();
    } catch (error) {
      console.error('Error recording cash movement:', error);
      toast.error(language === 'th' ? 'เกิดข้อผิดพลาด' : 'Failed to record movement');
    }
  };

  const calculateCurrentCash = () => {
    if (!currentShift) return 0;

    let total = currentShift.startingCash;
    cashMovements.forEach(movement => {
      if (movement.type === 'in') {
        total += movement.amount;
      } else {
        total -= movement.amount;
      }
    });

    return total;
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
            {language === 'th' ? 'แคชเชียร์' : 'Cashier'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'th' ? 'จัดการกะการทำงานและลิ้นชักเงินสด' : 'Manage shifts and cash drawer'}
          </p>
        </div>

        {!currentShift ? (
          <button
            onClick={() => setShowOpenShiftModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <LogIn className="w-5 h-5" />
            {language === 'th' ? 'เปิดกะ' : 'Open Shift'}
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setShowCashMovementModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
              {language === 'th' ? 'รายการเงินสด' : 'Cash Movement'}
            </button>
            <button
              onClick={() => setShowCloseShiftModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <LogOut className="w-5 h-5" />
              {language === 'th' ? 'ปิดกะ' : 'Close Shift'}
            </button>
          </div>
        )}
      </div>

      {/* Current Shift Info */}
      {currentShift && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {language === 'th' ? 'แคชเชียร์' : 'Cashier'}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{currentShift.cashierName}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {language === 'th' ? 'เงินสดเริ่มต้น' : 'Starting Cash'}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  ฿{currentShift.startingCash.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {language === 'th' ? 'เงินสดปัจจุบัน' : 'Current Cash'}
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  ฿{calculateCurrentCash().toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {language === 'th' ? 'เวลาเริ่มกะ' : 'Shift Started'}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {new Date(currentShift.startedAt).toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Cash Movements */}
      {currentShift && cashMovements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            {language === 'th' ? 'รายการเงินสด' : 'Cash Movements'}
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      {language === 'th' ? 'เวลา' : 'Time'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      {language === 'th' ? 'ประเภท' : 'Type'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      {language === 'th' ? 'จำนวน' : 'Amount'}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      {language === 'th' ? 'เหตุผล' : 'Reason'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {cashMovements.map((movement) => (
                    <tr key={movement.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(movement.createdAt).toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`flex items-center gap-2 text-sm font-medium ${
                          movement.type === 'in' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {movement.type === 'in' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          {movement.type === 'in'
                            ? language === 'th' ? 'เงินเข้า' : 'Cash In'
                            : language === 'th' ? 'เงินออก' : 'Cash Out'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                        ฿{movement.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {movement.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Shift History */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {language === 'th' ? 'ประวัติกะ' : 'Shift History'}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {language === 'th' ? 'แคชเชียร์' : 'Cashier'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {language === 'th' ? 'เริ่มต้น' : 'Started'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {language === 'th' ? 'สิ้นสุด' : 'Ended'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {language === 'th' ? 'เงินเริ่มต้น' : 'Starting'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {language === 'th' ? 'เงินสิ้นสุด' : 'Ending'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {language === 'th' ? 'สถานะ' : 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {shifts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      {language === 'th' ? 'ยังไม่มีกะ' : 'No shifts yet'}
                    </td>
                  </tr>
                ) : (
                  shifts.map((shift) => (
                    <tr key={shift.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {shift.cashierName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {new Date(shift.startedAt).toLocaleString(language === 'th' ? 'th-TH' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {shift.endedAt
                          ? new Date(shift.endedAt).toLocaleString(language === 'th' ? 'th-TH' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ฿{shift.startingCash.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {shift.endingCash ? `฿${shift.endingCash.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          shift.status === 'open'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {shift.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Open Shift Modal */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'th' ? 'เปิดกะใหม่' : 'Open New Shift'}
              </h3>
              <button onClick={() => setShowOpenShiftModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'ชื่อแคชเชียร์' : 'Cashier Name'}
                </label>
                <input
                  type="text"
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={language === 'th' ? 'กรอกชื่อ' : 'Enter name'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'เงินสดเริ่มต้น' : 'Starting Cash'}
                </label>
                <input
                  type="number"
                  value={startingCash}
                  onChange={(e) => setStartingCash(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleOpenShift}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  {language === 'th' ? 'เปิดกะ' : 'Open Shift'}
                </button>
                <button
                  onClick={() => setShowOpenShiftModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Shift Modal */}
      {showCloseShiftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'th' ? 'ปิดกะ' : 'Close Shift'}
              </h3>
              <button onClick={() => setShowCloseShiftModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'th' ? 'เงินสดปัจจุบัน (คำนวณ)' : 'Current Cash (Calculated)'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ฿{calculateCurrentCash().toFixed(2)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'เงินสดจริง (นับจากลิ้นชัก)' : 'Actual Cash (Counted)'}
                </label>
                <input
                  type="number"
                  value={endingCash}
                  onChange={(e) => setEndingCash(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              {endingCash && (
                <div className={`p-3 rounded-lg ${
                  parseFloat(endingCash) === calculateCurrentCash()
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                }`}>
                  <p className="text-sm font-medium">
                    {language === 'th' ? 'ส่วนต่าง:' : 'Difference:'} ฿
                    {(parseFloat(endingCash) - calculateCurrentCash()).toFixed(2)}
                  </p>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCloseShift}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  {language === 'th' ? 'ปิดกะ' : 'Close Shift'}
                </button>
                <button
                  onClick={() => setShowCloseShiftModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Movement Modal */}
      {showCashMovementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'th' ? 'รายการเงินสด' : 'Cash Movement'}
              </h3>
              <button onClick={() => setShowCashMovementModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'ประเภท' : 'Type'}
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setMovementType('in')}
                    className={`flex-1 px-4 py-2 rounded-lg transition ${
                      movementType === 'in'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {language === 'th' ? 'เงินเข้า' : 'Cash In'}
                  </button>
                  <button
                    onClick={() => setMovementType('out')}
                    className={`flex-1 px-4 py-2 rounded-lg transition ${
                      movementType === 'out'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {language === 'th' ? 'เงินออก' : 'Cash Out'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'จำนวนเงิน' : 'Amount'}
                </label>
                <input
                  type="number"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {language === 'th' ? 'เหตุผล' : 'Reason'}
                </label>
                <input
                  type="text"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder={language === 'th' ? 'ระบุเหตุผล' : 'Enter reason'}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCashMovement}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {language === 'th' ? 'บันทึก' : 'Save'}
                </button>
                <button
                  onClick={() => setShowCashMovementModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

