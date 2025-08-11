import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import type { RootState } from '../store/store';
import { addDeposit as addDepositAction, deleteDeposit } from '../store/depositsSlice';
import { formatBDT } from '../utils/currency';

// Mock users data
const users = [
  { id: '1', name: 'Shawn' },
  { id: '2', name: 'Sadi' },
  { id: '3', name: 'Masud' },
  { id: '4', name: 'Arnab' },
  { id: '5', name: 'Muzahid' },
];

export function DepositsPage() {
  const dispatch = useDispatch();
  const deposits = useSelector((state: RootState) => state.deposits.deposits);
  const [activeTab, setActiveTab] = useState<'entry' | 'history'>('entry');

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    userId: '',
    amount: '',
    note: ''
  });

  const addDeposit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId) {
      toast.error('Please select a member');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const selectedUser = users.find(u => u.id === formData.userId);
    if (!selectedUser) return;

    const newDeposit = {
      date: formData.date,
      userId: formData.userId,
      userName: selectedUser.name,
      amount: parseFloat(formData.amount),
      note: formData.note
    };

    dispatch(addDepositAction(newDeposit));

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      userId: '',
      amount: '',
      note: ''
    });

    toast.success('💰 Deposit recorded successfully!');
  };

  const handleDeleteDeposit = (id: string) => {
    if (confirm('Are you sure you want to delete this deposit?')) {
      dispatch(deleteDeposit(id));
    }
  };

  // Generate date range for history (cycle start to yesterday)
  const dateRange = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const dates: string[] = [];

    for (let d = new Date(startOfMonth); d <= yesterday; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    return dates.reverse(); // Most recent first
  }, []);

  // Group deposits by date
  const depositsByDate = useMemo(() => {
    const grouped: Record<string, typeof deposits> = {};
    deposits.forEach(deposit => {
      if (!grouped[deposit.date]) {
        grouped[deposit.date] = [];
      }
      grouped[deposit.date].push(deposit);
    });
    return grouped;
  }, [deposits]);

  // Calculate user totals
  const userTotals = useMemo(() => {
    return users.map(user => {
      const userDeposits = deposits.filter(d => d.userId === user.id);
      const total = userDeposits.reduce((sum, d) => sum + d.amount, 0);
      return {
        userId: user.id,
        name: user.name,
        total,
        count: userDeposits.length
      };
    });
  }, [deposits]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      });
    }
  };

  const renderDepositEntry = () => (
    <div className="space-y-6">
      {/* Add deposit form */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Record New Deposit</h2>

        <form onSubmit={addDeposit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Member */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member</label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select member</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (৳)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Payment method, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Record Deposit
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderDepositHistory = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Deposits</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatBDT(deposits.reduce((sum, dep) => sum + dep.amount, 0))}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-500">Number of Deposits</h3>
          <p className="text-2xl font-bold text-blue-600">{deposits.length}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-500">Average Amount</h3>
          <p className="text-2xl font-bold text-orange-600">
            {formatBDT(deposits.length > 0 ? deposits.reduce((sum, dep) => sum + dep.amount, 0) / deposits.length : 0)}
          </p>
        </div>
      </div>

      {/* User Totals */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Member Deposit Summary</h3>
          <p className="text-sm text-gray-500 mt-1">Total deposits per member this cycle</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {userTotals.map((userTotal) => (
              <div key={userTotal.userId} className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{userTotal.name}</h4>
                <div className="space-y-1 text-sm">
                  <div className="text-2xl font-bold text-green-600">
                    {formatBDT(userTotal.total)}
                  </div>
                  <div className="text-gray-500">
                    {userTotal.count} deposits
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deposits History Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Deposit History</h3>
          <p className="text-sm text-gray-500 mt-1">Daily deposit tracking from cycle start to yesterday</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900 sticky left-0 bg-gray-50">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Member</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Note</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dateRange.map((date, index) => {
                const dayDeposits = depositsByDate[date] || [];
                const isYesterday = (() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  return date === yesterday.toISOString().split('T')[0];
                })();

                if (dayDeposits.length === 0) {
                  return (
                    <tr key={date} className={`border-b border-gray-100 ${isYesterday
                      ? 'bg-blue-50 border-blue-200'
                      : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}>
                      <td className={`py-3 px-4 font-medium text-gray-900 sticky left-0 ${isYesterday ? 'bg-blue-50' : 'bg-inherit'
                        }`}>
                        <div>{formatDate(date)}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                        </div>
                      </td>
                      <td colSpan={4} className="py-3 px-4 text-center text-gray-400 italic">
                        No deposits recorded
                      </td>
                    </tr>
                  );
                }

                return dayDeposits.map((deposit, depositIndex) => (
                  <tr key={`${date}-${deposit.id}`} className={`border-b border-gray-100 ${isYesterday
                    ? 'bg-blue-50 border-blue-200'
                    : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}>
                    {depositIndex === 0 && (
                      <td rowSpan={dayDeposits.length} className={`py-3 px-4 font-medium text-gray-900 sticky left-0 border-r ${isYesterday ? 'bg-blue-50' : 'bg-inherit'
                        }`}>
                        <div>{formatDate(date)}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                        </div>
                      </td>
                    )}
                    <td className="py-3 px-4 text-gray-900 font-medium">{deposit.userName}</td>
                    <td className="py-3 px-4 text-right font-medium text-green-600">
                      {formatBDT(deposit.amount)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{deposit.note || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteDeposit(deposit.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>

        {deposits.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No deposits recorded yet</p>
            <p className="text-sm mt-1">Start recording deposits to see history here</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Deposits</h1>
        <p className="text-gray-500">Track member deposits and contributions</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('entry')}
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'entry'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              💵 Record Deposit
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'history'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              📊 Deposit History
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'entry' ? renderDepositEntry() : renderDepositHistory()}
        </div>
      </div>
    </div>
  );
}