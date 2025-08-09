import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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

export function Expenses() {
    const dispatch = useDispatch();
    const expenses = useSelector((state: RootState) => state.expenses.expenses);

    // Form state
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        paidFrom: 'pool' as 'pool' | 'personal',
        payerId: '',
        purchasedById: '',
        note: ''
    });

    const addExpense = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (formData.paidFrom === 'personal' && !formData.payerId) {
            alert('Please select who paid personally');
            return;
        }

        if (!formData.purchasedById) {
            alert('Please select who purchased');
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
        console.log('Added expense:', newExpense);

        // Reset form
        setFormData({
            date: new Date().toISOString().split('T')[0],
            amount: '',
            paidFrom: 'pool',
            payerId: '',
            purchasedById: '',
            note: ''
        });

        alert('Expense added successfully!');
    };

    const handleDeleteExpense = (id: string) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            dispatch(deleteExpense(id));
        }
    };

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
                <p className="text-gray-500">Manage daily meal expenses</p>
            </div>

            {/* Add expense form */}
            <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Add New Expense</h2>

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
                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            Add Expense
                        </button>
                    </div>
                </form>
            </div>

            {/* Expenses list */}
            <div className="bg-white rounded-lg border">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Recent Expenses</h2>
                        <div className="text-sm text-gray-500">
                            Total: <span className="font-medium text-green-600">{formatBDT(totalExpenses)}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {expenses.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No expenses recorded yet.</p>
                            <p className="text-sm mt-1">Add your first expense above.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 px-3 font-medium text-gray-900">Date</th>
                                        <th className="text-right py-2 px-3 font-medium text-gray-900">Amount</th>
                                        <th className="text-center py-2 px-3 font-medium text-gray-900">Paid From</th>
                                        <th className="text-center py-2 px-3 font-medium text-gray-900">Payer</th>
                                        <th className="text-center py-2 px-3 font-medium text-gray-900">Purchased By</th>
                                        <th className="text-left py-2 px-3 font-medium text-gray-900">Note</th>
                                        <th className="text-center py-2 px-3 font-medium text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.map((expense) => (
                                        <tr key={expense.id} className="border-b border-gray-100">
                                            <td className="py-3 px-3">
                                                {new Date(expense.date).toLocaleDateString('en-BD')}
                                            </td>
                                            <td className="py-3 px-3 text-right font-medium">
                                                {formatBDT(expense.amount)}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full ${expense.paidFrom === 'pool'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-orange-100 text-orange-800'
                                                        }`}
                                                >
                                                    {expense.paidFrom === 'pool' ? 'Pool' : 'Personal'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                {expense.payerName || '-'}
                                            </td>
                                            <td className="py-3 px-3 text-center font-medium">
                                                {expense.purchasedBy}
                                            </td>
                                            <td className="py-3 px-3">
                                                {expense.note || '-'}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <button
                                                    onClick={() => handleDeleteExpense(expense.id)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
