import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { addExpense } from '../../store/expensesSlice';


// Mock users data
const users = [
    { id: '1', name: 'Shawn' },
    { id: '2', name: 'Sadi' },
    { id: '3', name: 'Masud' },
    { id: '4', name: 'Arnab' },
    { id: '5', name: 'Muzahid' },
];

export function QuickEntryForms() {
    const dispatch = useDispatch();
    const today = new Date().toISOString().split('T')[0];



    // Quick Expense Entry State
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseNote, setExpenseNote] = useState('');
    const [expensePurchasedBy, setExpensePurchasedBy] = useState('');





    const handleQuickExpense = () => {
        if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
            toast.error('Please enter a valid expense amount');
            return;
        }

        if (!expensePurchasedBy) {
            toast.error('Please select who purchased the items');
            return;
        }

        const purchasedByUser = users.find(u => u.id === expensePurchasedBy);
        if (!purchasedByUser) return;

        const expense = {
            id: Date.now().toString(),
            amount: parseFloat(expenseAmount),
            note: expenseNote || 'Quick entry expense',
            date: today,
            userId: 'admin', // Quick expenses are admin entries
            paidFrom: 'pool' as const,
            purchasedBy: purchasedByUser.name,
        };

        dispatch(addExpense(expense));
        setExpenseAmount('');
        setExpenseNote('');
        setExpensePurchasedBy('');
        toast.success('💰 Expense added successfully!');
    };





    return (
        <div className="max-w-md mx-auto">
            {/* Emergency Expense Entry */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">🚨 Emergency Expense</h4>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">Additional Only</span>
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">Amount (BDT)</label>
                    <input
                        type="number"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter amount"
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">Purchased By</label>
                    <select
                        value={expensePurchasedBy}
                        onChange={(e) => setExpensePurchasedBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select who bought</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">Note (optional)</label>
                    <input
                        type="text"
                        value={expenseNote}
                        onChange={(e) => setExpenseNote(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="What was bought?"
                    />
                </div>

                <button
                    onClick={handleQuickExpense}
                    disabled={!expenseAmount || parseFloat(expenseAmount) <= 0 || !expensePurchasedBy}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Add Expense
                </button>
            </div>
        </div>
    );
}
