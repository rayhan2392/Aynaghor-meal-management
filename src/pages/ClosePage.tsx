import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { computeFinalSettlement } from '../utils/settlement';
import { formatBDT } from '../utils/currency';

// Mock users data - all 5 are regular members participating in meals
const users = [
  { _id: '1', name: 'Shawn', role: 'member' as const, active: true, createdAt: new Date().toISOString() },
  { _id: '2', name: 'Sadi', role: 'member' as const, active: true, createdAt: new Date().toISOString() },
  { _id: '3', name: 'Masud', role: 'member' as const, active: true, createdAt: new Date().toISOString() },
  { _id: '4', name: 'Arnab', role: 'member' as const, active: true, createdAt: new Date().toISOString() },
  { _id: '5', name: 'Muzahid', role: 'member' as const, active: true, createdAt: new Date().toISOString() },
];

// Manager is separate admin role (not participating in meals)
const MANAGER_NAME = 'Admin/Manager';

export function ClosePage() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get data from Redux store
  const expenses = useSelector((state: RootState) => state.expenses.expenses);
  const deposits = useSelector((state: RootState) => state.deposits.deposits);
  const mealsByDate = useSelector((state: RootState) => state.meals.mealsByDate);

  // Convert meals data to the format expected by settlement calculation
  const meals = Object.entries(mealsByDate).flatMap(([date, dayMeals]) =>
    Object.entries(dayMeals).map(([userId, userMeals]) => ({
      _id: `${date}-${userId}`,
      cycleId: 'current', // Mock cycle ID
      date,
      userId,
      lunch: userMeals.lunch ? 1 : 0,
      dinner: userMeals.dinner ? 1 : 0,
      guestMeals: userMeals.guestMeals,
      createdAt: new Date().toISOString(),
    }))
  );

  // Calculate settlement
  const settlement = computeFinalSettlement(users, deposits, expenses, meals);

  const handleCloseMonth = async () => {
    setIsProcessing(true);
    try {
      // TODO: Here you would:
      // 1. Save the settlement result to the database
      // 2. Mark the current cycle as closed
      // 3. Create a new cycle for next month

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert('Month closed successfully! Settlement recorded.');
      setShowConfirmation(false);
    } catch (error) {
      alert('Error closing month. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Close Month</h1>
        <p className="text-gray-500">Calculate final settlement and close the monthly cycle</p>
      </div>

      {/* Settlement Summary */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Final Settlement Summary</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-xl font-bold">{formatBDT(settlement.totalCost)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Deposits</p>
              <p className="text-xl font-bold">{formatBDT(settlement.totalDeposits)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Total Meals</p>
              <p className="text-xl font-bold">{settlement.totalMeals}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Per Meal Rate</p>
              <p className="text-xl font-bold">{formatBDT(settlement.perMealRate)}</p>
            </div>
          </div>

          {/* User Settlement Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Member</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Meals</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Share</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Deposited</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Net</th>
                </tr>
              </thead>
              <tbody>
                {settlement.perUser.map((user) => (
                  <tr key={user.userId} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">
                      {user.name}
                    </td>
                    <td className="py-3 px-4 text-right">{user.meals}</td>
                    <td className="py-3 px-4 text-right">{formatBDT(user.share)}</td>
                    <td className="py-3 px-4 text-right">{formatBDT(user.deposited)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-medium ${parseFloat(user.net) > 0 ? 'text-green-600' :
                        parseFloat(user.net) < 0 ? 'text-red-600' : 'text-gray-900'
                        }`}>
                        {formatBDT(user.net)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manager Transactions */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Settlement Instructions</h3>
          <p className="text-sm text-gray-500 mt-1">
            All transactions go through {MANAGER_NAME}
          </p>
        </div>
        <div className="p-6">
          {settlement.managerTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>✅ All accounts are balanced! No transactions needed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {settlement.managerTransactions.map((transaction, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${transaction.type === 'owes' ? 'bg-red-50 border-red-400' : 'bg-green-50 border-green-400'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {transaction.type === 'owes'
                          ? `${transaction.userName} gives ${formatBDT(transaction.amount)} to ${MANAGER_NAME}`
                          : `${transaction.userName} will get ${formatBDT(transaction.amount)} from ${MANAGER_NAME}`
                        }
                      </p>
                    </div>
                    <span className={`text-lg font-bold ${transaction.type === 'owes' ? 'text-red-600' : 'text-green-600'
                      }`}>
                      {formatBDT(transaction.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Close Month Action */}
      <div className="bg-white rounded-lg border">
        <div className="p-6">
          {!showConfirmation ? (
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Close Month?</h3>
              <p className="text-gray-500 mb-4">
                This will finalize the settlement and prevent further changes to this month's data.
              </p>
              <button
                onClick={() => setShowConfirmation(true)}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Close Month & Finalize Settlement
              </button>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-lg font-medium text-red-900 mb-2">⚠️ Confirm Month Close</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to close this month? This action cannot be undone.
              </p>
              <div className="space-x-4">
                <button
                  onClick={handleCloseMonth}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Yes, Close Month'}
                </button>
                <button
                  onClick={() => setShowConfirmation(false)}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
