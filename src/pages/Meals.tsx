import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import { saveMealsForDate, updateMealForUser, updateGuestMeals } from '../store/mealsSlice';

// Mock users data
const users = [
    { id: '1', name: 'Shawn' },
    { id: '2', name: 'Sadi' },
    { id: '3', name: 'Masud' },
    { id: '4', name: 'Arnab' },
    { id: '5', name: 'Muzahid' },
];

interface MealData {
    [userId: string]: {
        lunch: boolean;
        dinner: boolean;
        guestMeals: number;
    };
}

export function Meals() {
    const dispatch = useDispatch();
    const mealsByDate = useSelector((state: RootState) => state.meals.mealsByDate);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [meals, setMeals] = useState<MealData>(() => {
        // Initialize with all meals off
        const initial: MealData = {};
        users.forEach(user => {
            initial[user.id] = { lunch: false, dinner: false, guestMeals: 0 };
        });
        return initial;
    });

    // Load meals for selected date from Redux
    useEffect(() => {
        const dateMeals = mealsByDate[selectedDate];
        if (dateMeals) {
            setMeals(dateMeals);
        } else {
            // Reset to empty if no data for this date
            const initial: MealData = {};
            users.forEach(user => {
                initial[user.id] = { lunch: false, dinner: false, guestMeals: 0 };
            });
            setMeals(initial);
        }
    }, [selectedDate, mealsByDate]);

    const toggleMeal = (userId: string, mealType: 'lunch' | 'dinner') => {
        const newValue = !meals[userId][mealType];
        setMeals(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [mealType]: newValue
            }
        }));
        dispatch(updateMealForUser({ date: selectedDate, userId, mealType, value: newValue }));
    };

    const updateUserGuestMeals = (userId: string, value: number) => {
        const guestMeals = Math.max(0, value);
        setMeals(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                guestMeals
            }
        }));
        dispatch(updateGuestMeals({ date: selectedDate, userId, guestMeals }));
    };

    const saveMeals = () => {
        dispatch(saveMealsForDate({ date: selectedDate, meals }));
        console.log('Saving meals for date:', selectedDate, meals);
        alert('Meals saved to Redux store!');
    };

    const copyFromYesterday = () => {
        // Mock copy functionality
        setMeals(prev => {
            const updated = { ...prev };
            users.forEach(user => {
                updated[user.id] = { lunch: true, dinner: true, guestMeals: 0 };
            });
            return updated;
        });
        alert('Copied from yesterday (mock data)');
    };

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Meals</h1>
                <p className="text-gray-500">Track daily meals for all members</p>
            </div>

            {/* Date selector and actions */}
            <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <label className="text-sm font-medium text-gray-700">Date:</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={copyFromYesterday}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                        >
                            Copy from Yesterday
                        </button>
                        <button
                            onClick={saveMeals}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            Save Meals
                        </button>
                    </div>
                </div>

                {/* Meals grid */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-900">Member</th>
                                <th className="text-center py-3 px-4 font-medium text-gray-900">Lunch</th>
                                <th className="text-center py-3 px-4 font-medium text-gray-900">Dinner</th>
                                <th className="text-center py-3 px-4 font-medium text-gray-900">Guest Meals</th>
                                <th className="text-center py-3 px-4 font-medium text-gray-900">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => {
                                const userMeals = meals[user.id] || { lunch: false, dinner: false, guestMeals: 0 };
                                const total = (userMeals.lunch ? 1 : 0) + (userMeals.dinner ? 1 : 0) + userMeals.guestMeals;

                                return (
                                    <tr key={user.id} className="border-b border-gray-100">
                                        <td className="py-4 px-4 font-medium text-gray-900">{user.name}</td>

                                        {/* Lunch toggle */}
                                        <td className="py-4 px-4 text-center">
                                            <button
                                                onClick={() => toggleMeal(user.id, 'lunch')}
                                                className={`w-16 h-8 rounded-full transition-colors ${userMeals.lunch
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-200 text-gray-500'
                                                    }`}
                                            >
                                                {userMeals.lunch ? '✓' : '✗'}
                                            </button>
                                        </td>

                                        {/* Dinner toggle */}
                                        <td className="py-4 px-4 text-center">
                                            <button
                                                onClick={() => toggleMeal(user.id, 'dinner')}
                                                className={`w-16 h-8 rounded-full transition-colors ${userMeals.dinner
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-200 text-gray-500'
                                                    }`}
                                            >
                                                {userMeals.dinner ? '✓' : '✗'}
                                            </button>
                                        </td>

                                        {/* Guest meals input */}
                                        <td className="py-4 px-4 text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={userMeals.guestMeals}
                                                onChange={(e) => updateUserGuestMeals(user.id, parseInt(e.target.value) || 0)}
                                                className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </td>

                                        {/* Total */}
                                        <td className="py-4 px-4 text-center font-medium">
                                            {total}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Daily Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Total Lunches: </span>
                            <span className="font-medium">
                                {users.reduce((sum, user) => sum + (meals[user.id].lunch ? 1 : 0), 0)}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Total Dinners: </span>
                            <span className="font-medium">
                                {users.reduce((sum, user) => sum + (meals[user.id].dinner ? 1 : 0), 0)}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Total Guests: </span>
                            <span className="font-medium">
                                {users.reduce((sum, user) => sum + meals[user.id].guestMeals, 0)}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Grand Total: </span>
                            <span className="font-medium">
                                {users.reduce((sum, user) => {
                                    const userMeals = meals[user.id];
                                    return sum + (userMeals.lunch ? 1 : 0) + (userMeals.dinner ? 1 : 0) + userMeals.guestMeals;
                                }, 0)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
