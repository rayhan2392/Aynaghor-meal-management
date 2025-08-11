import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import type { RootState } from '../store/store';
import { addExpense as addExpenseAction, deleteExpense } from '../store/expensesSlice';
import { formatBDT } from '../utils/currency';

// Mock users data
const users = [
  { id: '1', name: 'Shawn' },
  { id: '2', name: 'Sadi' },
  { id: '3', name: 'Masud' },
  { id: '4', name: 'Arnab' },
  { id: '5', name: 'Muzahid' },
];

export function ExpensesPage() {
  const dispatch = useDispatch();
  const expenses = useSelector((state: RootState) => state.expenses.expenses);
  const [activeTab, setActiveTab] = useState<'entry' | 'history'>('entry');

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    paidFrom: 'pool' as 'pool' | 'personal',
    payerId: '',
    purchasedById: '',
    note: ''
  });

  // Check if expense already exists for the selected date
  const hasExpenseForDate = expenses.some(expense => expense.date === formData.date);

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if expense already exists for this date
    if (hasExpenseForDate) {
      toast.error('⚠️ Expense already recorded for this date! Use Dashboard Quick Entry for additional expenses.');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (formData.paidFrom === 'personal' && !formData.payerId) {
      toast.error('Please select who paid personally');
      return;
    }

    if (!formData.purchasedById) {
      toast.error('Please select who purchased');
      return;
    }

    const newExpense = {
      date: formData.date,
      amount: parseFloat(formData.amount),
      paidFrom: formData.paidFrom,
      payerName: formData.paidFrom === 'personal' ? users.find(u => u.id === formData.payerId)?.name : undefined,
      purchasedBy: users.find(u => u.id === formData.purchasedById)?.name || '',
      note: formData.note
    };

    dispatch(addExpenseAction(newExpense));

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      paidFrom: 'pool',
      payerId: '',
      purchasedById: '',
      note: ''
    });

    toast.success('💸 Expense added successfully!');
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      dispatch(deleteExpense(id));
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

  // Group expenses by date
  const expensesByDate = useMemo(() => {
    const grouped: Record<string, typeof expenses> = {};
    expenses.forEach(expense => {
      if (!grouped[expense.date]) {
        grouped[expense.date] = [];
      }
      grouped[expense.date].push(expense);
    });
    return grouped;
  }, [expenses]);

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

  const renderExpenseEntry = () => (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Daily Expense Entry</h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>Record your main daily expense here (one per day). For emergency or additional expenses, use the Dashboard Quick Entry.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Existing expense check */}
      {hasExpenseForDate && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Expense Already Recorded</h3>
              <div className="mt-1 text-sm text-yellow-700">
                <p>You have already recorded an expense for {new Date(formData.date).toLocaleDateString()}. Use Dashboard Quick Entry for additional expenses.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add expense form */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Add Daily Expense</h2>

        <form onSubmit={addExpense} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

            {/* Paid From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paid From</label>
              <select
                value={formData.paidFrom}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  paidFrom: e.target.value as 'pool' | 'personal',
                  payerId: e.target.value === 'pool' ? '' : prev.payerId
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pool">Pool Money</option>
                <option value="personal">Personal Payment</option>
              </select>
            </div>

            {/* Payer (only if personal) */}
            {formData.paidFrom === 'personal' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Who Paid?</label>
                <select
                  value={formData.payerId}
                  onChange={(e) => setFormData(prev => ({ ...prev, payerId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select person</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Purchased By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchased By</label>
              <select
                value={formData.purchasedById}
                onChange={(e) => setFormData(prev => ({ ...prev, purchasedById: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select person</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <input
              type="text"
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              placeholder="What was purchased (e.g., rice, vegetables, fish)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={hasExpenseForDate}
              className={`px-6 py-2 text-sm font-medium text-white rounded-md ${hasExpenseForDate
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {hasExpenseForDate ? 'Already Recorded' : 'Add Daily Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderExpenseHistory = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatBDT(expenses.reduce((sum, exp) => sum + exp.amount, 0))}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-500">Number of Expenses</h3>
          <p className="text-2xl font-bold text-blue-600">{expenses.length}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-500">Average Amount</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatBDT(expenses.length > 0 ? expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length : 0)}
          </p>
        </div>
      </div>

      {/* Expenses History Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Expense History</h3>
          <p className="text-sm text-gray-500 mt-1">Daily expense tracking from cycle start to yesterday</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900 sticky left-0 bg-gray-50">Date</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Paid From</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Purchased By</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Note</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dateRange.map((date, index) => {
                const dayExpenses = expensesByDate[date] || [];
                const isYesterday = (() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  return date === yesterday.toISOString().split('T')[0];
                })();

                if (dayExpenses.length === 0) {
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
                      <td colSpan={5} className="py-3 px-4 text-center text-gray-400 italic">
                        No expenses recorded
                      </td>
                    </tr>
                  );
                }

                return dayExpenses.map((expense, expenseIndex) => (
                  <tr key={`${date}-${expense.id}`} className={`border-b border-gray-100 ${isYesterday
                    ? 'bg-blue-50 border-blue-200'
                    : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}>
                    {expenseIndex === 0 && (
                      <td rowSpan={dayExpenses.length} className={`py-3 px-4 font-medium text-gray-900 sticky left-0 border-r ${isYesterday ? 'bg-blue-50' : 'bg-inherit'
                        }`}>
                        <div>{formatDate(date)}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                        </div>
                      </td>
                    )}
                    <td className="py-3 px-4 text-right font-medium text-red-600">
                      {formatBDT(expense.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${expense.paidFrom === 'pool'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                        }`}>
                        {expense.paidFrom === 'pool' ? 'Pool' : 'Personal'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{expense.purchasedBy}</td>
                    <td className="py-3 px-4 text-gray-600">{expense.note || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
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

        {expenses.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No expenses recorded yet</p>
            <p className="text-sm mt-1">Start adding expenses to see history here</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <p className="text-gray-500">Track and manage all expenses</p>
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
              💰 Daily Expense
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'history'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              📊 Expense History
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'entry' ? renderExpenseEntry() : renderExpenseHistory()}
        </div>
      </div>
    </div>
  );
}