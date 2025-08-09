import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateMealForUser } from '../../store/mealsSlice';
import { addExpense } from '../../store/expensesSlice';
import { addDeposit } from '../../store/depositsSlice';
import type { RootState } from '../../store/store';

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

    // Get today's meal data from Redux
    const mealsByDate = useSelector((state: RootState) => state.meals.mealsByDate);
    const todayMeals = mealsByDate[today] || {};

    // Quick Meal Entry State
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [mealType, setMealType] = useState<'lunch' | 'dinner'>('lunch');

    // Quick Expense Entry State
    const [expenseAmount, setExpenseAmount] = useState('');
    const [expenseNote, setExpenseNote] = useState('');
    const [expensePurchasedBy, setExpensePurchasedBy] = useState('');

    // Quick Deposit Entry State
    const [depositUser, setDepositUser] = useState('');
    const [depositAmount, setDepositAmount] = useState('');
    const [depositNote, setDepositNote] = useState('');

    // Helper function to check if user can still add meals today
    const canUserAddMeal = (userId: string, mealType: 'lunch' | 'dinner') => {
        const userMeals = todayMeals[userId];
        if (!userMeals) return true; // No meals yet, can add

        // Check if this specific meal type is already taken
        return !userMeals[mealType];
    };

    // Helper function to check if user has both lunch and dinner
    const isUserDayComplete = (userId: string) => {
        const userMeals = todayMeals[userId];
        if (!userMeals) return false;
        return userMeals.lunch && userMeals.dinner;
    };

    const handleQuickMealEntry = () => {
        if (selectedUsers.length === 0) {
            alert('Please select at least one user for the meal');
            return;
        }

        // Check if any selected users already have this meal type
        const usersWithMeal = selectedUsers.filter(userId => !canUserAddMeal(userId, mealType));
        if (usersWithMeal.length > 0) {
            const userNames = usersWithMeal.map(id => users.find(u => u.id === id)?.name).join(', ');
            alert(`${userNames} already have ${mealType} for today!`);
            return;
        }

        // Add meals for valid users
        selectedUsers.forEach(userId => {
            dispatch(updateMealForUser({
                date: today,
                userId,
                mealType: mealType,
                value: true
            }));
        });

        setSelectedUsers([]);
        alert(`${mealType.charAt(0).toUpperCase() + mealType.slice(1)} marked for ${selectedUsers.length} users!`);
    };

    const handleQuickExpense = () => {
        if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
            alert('Please enter a valid expense amount');
            return;
        }

        if (!expensePurchasedBy) {
            alert('Please select who purchased the items');
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
        alert('Expense added successfully!');
    };

    const handleQuickDeposit = () => {
        if (!depositUser || !depositAmount || parseFloat(depositAmount) <= 0) {
            alert('Please select a user and enter a valid deposit amount');
            return;
        }

        const selectedUser = users.find(u => u.id === depositUser);
        if (!selectedUser) return;

        const deposit = {
            id: Date.now().toString(),
            userId: depositUser,
            userName: selectedUser.name, // Include user name
            amount: parseFloat(depositAmount),
            note: depositNote || 'Quick entry deposit',
            date: today,
        };

        dispatch(addDeposit(deposit));
        setDepositUser('');
        setDepositAmount('');
        setDepositNote('');
        alert('Deposit added successfully!');
    };

    const toggleUserSelection = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Meal Entry */}
            <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Quick Meal Entry</h4>

                {/* Meal Type Selection */}
                <div className="flex space-x-2">
                    <button
                        onClick={() => setMealType('lunch')}
                        className={`px-3 py-2 rounded text-sm font-medium ${mealType === 'lunch'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Lunch
                    </button>
                    <button
                        onClick={() => setMealType('dinner')}
                        className={`px-3 py-2 rounded text-sm font-medium ${mealType === 'dinner'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Dinner
                    </button>
                </div>

                {/* User Selection */}
                <div className="space-y-2">
                    <p className="text-sm text-gray-600">Select users for {mealType}:</p>
                    <p className="text-xs text-gray-500">💡 Can add lunch once + dinner once per day</p>
                    <div className="text-xs text-gray-500 mb-2">
                        Status: <span className="text-blue-600">L</span>=Lunch, <span className="text-orange-600">D</span>=Dinner, <span className="text-green-600">✓</span>=Complete
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {users.map(user => {
                            const canAdd = canUserAddMeal(user.id, mealType);
                            const isDayComplete = isUserDayComplete(user.id);
                            const userMeals = todayMeals[user.id];
                            const hasLunch = userMeals?.lunch || false;
                            const hasDinner = userMeals?.dinner || false;

                            return (
                                <button
                                    key={user.id}
                                    onClick={() => canAdd ? toggleUserSelection(user.id) : null}
                                    disabled={!canAdd}
                                    className={`px-3 py-2 rounded text-sm font-medium text-left relative ${!canAdd
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : selectedUsers.includes(user.id)
                                                ? 'bg-green-100 text-green-800 border border-green-300'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{user.name}</span>
                                        <div className="flex space-x-1 text-xs">
                                            {hasLunch && <span className="text-blue-600">L</span>}
                                            {hasDinner && <span className="text-orange-600">D</span>}
                                            {isDayComplete && <span className="text-green-600">✓</span>}
                                        </div>
                                    </div>
                                    {!canAdd && (
                                        <div className="text-xs text-gray-400 mt-1">
                                            {mealType} already taken
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button
                    onClick={handleQuickMealEntry}
                    disabled={selectedUsers.length === 0}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Add {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                </button>
            </div>

            {/* Quick Expense Entry */}
            <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Quick Expense Entry</h4>

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

            {/* Quick Deposit Entry */}
            <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Quick Deposit Entry</h4>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">User</label>
                    <select
                        value={depositUser}
                        onChange={(e) => setDepositUser(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select user</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">Amount (BDT)</label>
                    <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter amount"
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-600 mb-1">Note (optional)</label>
                    <input
                        type="text"
                        value={depositNote}
                        onChange={(e) => setDepositNote(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Payment method, etc."
                    />
                </div>

                <button
                    onClick={handleQuickDeposit}
                    disabled={!depositUser || !depositAmount || parseFloat(depositAmount) <= 0}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Add Deposit
                </button>
            </div>
        </div>
    );
}
