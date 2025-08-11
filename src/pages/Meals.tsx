import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import type { RootState } from '../store/store';
import { saveMealsForDate } from '../store/mealsSlice';

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

    // New state for tracking editing mode
    const [isEditing, setIsEditing] = useState(false);
    const [hasDataForDate, setHasDataForDate] = useState(false);

    // Load meals for selected date from Redux
    useEffect(() => {
        const dateMeals = mealsByDate[selectedDate];
        if (dateMeals && Object.keys(dateMeals).length > 0) {
            // Data exists for this date
            setMeals(dateMeals);
            setHasDataForDate(true);
            setIsEditing(false); // Not editing when loading existing data
        } else {
            // No data for this date
            const initial: MealData = {};
            users.forEach(user => {
                initial[user.id] = { lunch: false, dinner: false, guestMeals: 0 };
            });
            setMeals(initial);
            setHasDataForDate(false);
            setIsEditing(false);
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
        // Don't dispatch to Redux immediately - only save when user clicks "Save Meals"
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
        // Don't dispatch to Redux immediately - only save when user clicks "Save Meals"
    };

    const saveMeals = () => {
        dispatch(saveMealsForDate({ date: selectedDate, meals }));
        setIsEditing(false);
        setHasDataForDate(true);
        console.log('Saving meals for date:', selectedDate, meals);
        toast.success('🍽️ Meals saved successfully!');
    };

    const startAddingMeals = () => {
        setIsEditing(true);
    };

    const startUpdatingMeals = () => {
        setIsEditing(true);
    };

    const cancelEditing = () => {
        // Reload data from Redux to cancel changes
        const dateMeals = mealsByDate[selectedDate];
        if (dateMeals) {
            setMeals(dateMeals);
        }
        setIsEditing(false);
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
        toast.info('📋 Copied from yesterday (mock data)');
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

                    {/* Dynamic action buttons */}
                    <div className="flex space-x-3">
                        {!isEditing && !hasDataForDate && (
                            <button
                                onClick={startAddingMeals}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                            >
                                Add Today's Meals
                            </button>
                        )}

                        {!isEditing && hasDataForDate && (
                            <button
                                onClick={startUpdatingMeals}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                Update Meals
                            </button>
                        )}

                        {isEditing && (
                            <>
                                <button
                                    onClick={copyFromYesterday}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                >
                                    Copy from Yesterday
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveMeals}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    Save Meals
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Status message when not editing and no data */}
                {!isEditing && !hasDataForDate && (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-lg">No meals recorded for {new Date(selectedDate).toLocaleDateString()}</p>
                        <p className="text-sm mt-2">Click "Add Today's Meals" to start recording meals for this date.</p>
                    </div>
                )}

                {/* Display existing data when not editing */}
                {!isEditing && hasDataForDate && (
                    <div className="text-center py-8 text-gray-700">
                        <p className="text-lg">✅ Meals recorded for {new Date(selectedDate).toLocaleDateString()}</p>
                        <p className="text-sm mt-2">Click "Update Meals" to make changes.</p>

                        {/* Show summary of recorded meals */}
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-2">Quick Summary:</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Total Lunches: </span>
                                    <span className="font-medium">
                                        {users.reduce((sum, user) => sum + (meals[user.id]?.lunch ? 1 : 0), 0)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Total Dinners: </span>
                                    <span className="font-medium">
                                        {users.reduce((sum, user) => sum + (meals[user.id]?.dinner ? 1 : 0), 0)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Total Guests: </span>
                                    <span className="font-medium">
                                        {users.reduce((sum, user) => sum + (meals[user.id]?.guestMeals || 0), 0)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Grand Total: </span>
                                    <span className="font-medium">
                                        {users.reduce((sum, user) => {
                                            const userMeals = meals[user.id];
                                            if (!userMeals) return sum;
                                            return sum + (userMeals.lunch ? 1 : 0) + (userMeals.dinner ? 1 : 0) + userMeals.guestMeals;
                                        }, 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Meals grid - only show when editing */}
                {isEditing && (
                    <div>
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
                                        {users.reduce((sum, user) => sum + (meals[user.id]?.lunch ? 1 : 0), 0)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Total Dinners: </span>
                                    <span className="font-medium">
                                        {users.reduce((sum, user) => sum + (meals[user.id]?.dinner ? 1 : 0), 0)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Total Guests: </span>
                                    <span className="font-medium">
                                        {users.reduce((sum, user) => sum + (meals[user.id]?.guestMeals || 0), 0)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Grand Total: </span>
                                    <span className="font-medium">
                                        {users.reduce((sum, user) => {
                                            const userMeals = meals[user.id];
                                            if (!userMeals) return sum;
                                            return sum + (userMeals.lunch ? 1 : 0) + (userMeals.dinner ? 1 : 0) + userMeals.guestMeals;
                                        }, 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Meals History Table */}
                <div className="bg-white rounded-lg border">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold">Meals History</h3>
                        <p className="text-sm text-gray-500 mt-1">View meals taken by users across different dates</p>
                    </div>

                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-900">Member</th>
                                        <th className="text-center py-3 px-4 font-medium text-gray-900">Lunch</th>
                                        <th className="text-center py-3 px-4 font-medium text-gray-900">Dinner</th>
                                        <th className="text-center py-3 px-4 font-medium text-gray-900">Guest Meals</th>
                                        <th className="text-center py-3 px-4 font-medium text-gray-900">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(mealsByDate)
                                        .sort(([dateA], [dateB]) => dateB.localeCompare(dateA)) // Sort by date desc
                                        .map(([date, dateMeals]) =>
                                            users.map((user) => {
                                                const userMeals = dateMeals[user.id] || { lunch: false, dinner: false, guestMeals: 0 };
                                                const total = (userMeals.lunch ? 1 : 0) + (userMeals.dinner ? 1 : 0) + userMeals.guestMeals;

                                                // Only show rows where user has taken some meals
                                                if (total === 0) return null;

                                                return (
                                                    <tr key={`${date}-${user.id}`} className="border-b border-gray-100">
                                                        <td className="py-3 px-4 text-sm text-gray-900">
                                                            {new Date(date).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-3 px-4 font-medium text-gray-900">{user.name}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {userMeals.lunch ? (
                                                                <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                                    ✓
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-400 rounded-full text-xs">
                                                                    -
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            {userMeals.dinner ? (
                                                                <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                                    ✓
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-400 rounded-full text-xs">
                                                                    -
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 text-center text-sm text-gray-900">
                                                            {userMeals.guestMeals || 0}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className="inline-flex items-center justify-center w-8 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                                {total}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )
                                        .flat()
                                        .filter(Boolean) // Remove null entries
                                    }

                                    {Object.keys(mealsByDate).length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-gray-500">
                                                <div className="flex flex-col items-center space-y-2">
                                                    <div className="text-4xl">🍽️</div>
                                                    <p className="text-lg font-medium">No meals recorded yet</p>
                                                    <p className="text-sm">Start recording meals to see history here</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
