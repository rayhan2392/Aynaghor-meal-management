import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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

export function Deposits() {
    const dispatch = useDispatch();
    const deposits = useSelector((state: RootState) => state.deposits.deposits);

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
            alert('Please select a member');
            return;
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            alert('Please enter a valid amount');
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
        console.log('Added deposit:', newDeposit);

        // Reset form
        setFormData({
            date: new Date().toISOString().split('T')[0],
            userId: '',
            amount: '',
            note: ''
        });

        alert('Deposit recorded successfully!');
    };

    const handleDeleteDeposit = (id: string) => {
        if (confirm('Are you sure you want to delete this deposit?')) {
            dispatch(deleteDeposit(id));
        }
    };

    // Calculate totals
    const totalDeposits = deposits.reduce((sum, dep) => sum + dep.amount, 0);

    // Calculate per-user totals
    const userTotals = users.map(user => {
        const userDeposits = deposits.filter(dep => dep.userId === user.id);
        const total = userDeposits.reduce((sum, dep) => sum + dep.amount, 0);
        return {
            ...user,
            totalDeposited: total,
            depositsCount: userDeposits.length
        };
    });

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Deposits</h1>
                <p className="text-gray-500">Track member contributions to the meal fund</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total deposits */}
                <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-lg font-semibold mb-4">Total Deposits</h2>
                    <div className="text-3xl font-bold text-green-600">{formatBDT(totalDeposits)}</div>
                    <p className="text-sm text-gray-500 mt-1">{deposits.length} deposits recorded</p>
                </div>

                {/* Per-user summary */}
                <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-lg font-semibold mb-4">Per Member Summary</h2>
                    <div className="space-y-2">
                        {userTotals.map(user => (
                            <div key={user.id} className="flex justify-between items-center">
                                <span className="text-sm font-medium">{user.name}</span>
                                <span className="text-sm text-gray-600">
                                    {formatBDT(user.totalDeposited)} ({user.depositsCount} deposits)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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
                                placeholder="e.g., Monthly contribution"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Submit button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            Record Deposit
                        </button>
                    </div>
                </form>
            </div>

            {/* Quick deposit buttons */}
            <div className="bg-white rounded-lg border p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                    {users.map(user => (
                        <button
                            key={user.id}
                            onClick={() => setFormData(prev => ({
                                ...prev,
                                userId: user.id,
                                amount: '3000',
                                note: 'Monthly contribution'
                            }))}
                            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                        >
                            {user.name} - ৳3000
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Click to pre-fill form with common monthly amount</p>
            </div>

            {/* Deposits list */}
            <div className="bg-white rounded-lg border">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">Recent Deposits</h2>
                </div>

                <div className="p-6">
                    {deposits.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No deposits recorded yet.</p>
                            <p className="text-sm mt-1">Record your first deposit above.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2 px-3 font-medium text-gray-900">Date</th>
                                        <th className="text-left py-2 px-3 font-medium text-gray-900">Member</th>
                                        <th className="text-right py-2 px-3 font-medium text-gray-900">Amount</th>
                                        <th className="text-left py-2 px-3 font-medium text-gray-900">Note</th>
                                        <th className="text-center py-2 px-3 font-medium text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deposits.map((deposit) => (
                                        <tr key={deposit.id} className="border-b border-gray-100">
                                            <td className="py-3 px-3">
                                                {new Date(deposit.date).toLocaleDateString('en-BD')}
                                            </td>
                                            <td className="py-3 px-3 font-medium">
                                                {deposit.userName}
                                            </td>
                                            <td className="py-3 px-3 text-right font-medium text-green-600">
                                                {formatBDT(deposit.amount)}
                                            </td>
                                            <td className="py-3 px-3">
                                                {deposit.note || '-'}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <button
                                                    onClick={() => handleDeleteDeposit(deposit.id)}
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
