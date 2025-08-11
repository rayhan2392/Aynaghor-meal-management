import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import type { RootState } from '../store/store';
import { saveMealsForDate } from '../store/mealsSlice';
import { generateSampleMealData } from '../utils/sampleMealData';

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

export function MealsPage() {
  const dispatch = useDispatch();
  const mealsByDate = useSelector((state: RootState) => state.meals.mealsByDate);
  const [activeTab, setActiveTab] = useState<'entry' | 'history'>('entry');

  // Meal entry state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState<MealData>(() => {
    // Initialize with all meals off
    const initial: MealData = {};
    users.forEach(user => {
      initial[user.id] = { lunch: false, dinner: false, guestMeals: 0 };
    });
    return initial;
  });
  const [isEditing, setIsEditing] = useState(false);
  const [hasDataForDate, setHasDataForDate] = useState(false);

  // Check if we have data for the selected date
  useEffect(() => {
    const existingMeals = mealsByDate[selectedDate];
    if (existingMeals) {
      setMeals(existingMeals);
      setHasDataForDate(true);
    } else {
      // Reset to empty state
      const initial: MealData = {};
      users.forEach(user => {
        initial[user.id] = { lunch: false, dinner: false, guestMeals: 0 };
      });
      setMeals(initial);
      setHasDataForDate(false);
    }
    setIsEditing(false);
  }, [selectedDate, mealsByDate]);

  const saveMeals = () => {
    dispatch(saveMealsForDate({ date: selectedDate, meals }));
    setIsEditing(false);
    setHasDataForDate(true);
    toast.success('🍽️ Meals saved successfully!');
  };

  const startAddingMeals = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    // Reset to saved state or empty state
    const existingMeals = mealsByDate[selectedDate];
    if (existingMeals) {
      setMeals(existingMeals);
    } else {
      const initial: MealData = {};
      users.forEach(user => {
        initial[user.id] = { lunch: false, dinner: false, guestMeals: 0 };
      });
      setMeals(initial);
    }
    setIsEditing(false);
  };

  const copyFromYesterday = () => {
    setMeals(prev => {
      const updated = { ...prev };
      users.forEach(user => {
        updated[user.id] = { lunch: true, dinner: true, guestMeals: 0 };
      });
      return updated;
    });
    toast.info('📋 Copied from yesterday (mock data)');
  };

  const toggleMeal = (userId: string, mealType: 'lunch' | 'dinner') => {
    setMeals(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [mealType]: !prev[userId][mealType]
      }
    }));
  };

  const updateGuestMealsCount = (userId: string, count: number) => {
    setMeals(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        guestMeals: Math.max(0, count)
      }
    }));
  };

  const loadSampleData = () => {
    const sampleData = generateSampleMealData();
    Object.entries(sampleData).forEach(([date, meals]) => {
      dispatch(saveMealsForDate({ date, meals }));
    });
    toast.success('📊 Sample meal data loaded successfully!');
  };

  // Generate date range from start of current month to yesterday (exclude today)
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

  // Calculate totals for each user
  const userTotals = useMemo(() => {
    return users.map(user => {
      let totalLunch = 0;
      let totalDinner = 0;
      let totalGuest = 0;

      dateRange.forEach(date => {
        const dayMeals = mealsByDate[date];
        if (dayMeals && dayMeals[user.id]) {
          const userMeals = dayMeals[user.id];
          if (userMeals.lunch) totalLunch++;
          if (userMeals.dinner) totalDinner++;
          totalGuest += userMeals.guestMeals;
        }
      });

      return {
        userId: user.id,
        name: user.name,
        totalLunch,
        totalDinner,
        totalGuest,
        totalMeals: totalLunch + totalDinner + totalGuest,
      };
    });
  }, [dateRange, mealsByDate]);

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

  const getMealDisplay = (userMeals: any) => {
    if (!userMeals) return { lunch: '○', dinner: '○', guest: '0' };

    return {
      lunch: userMeals.lunch ? '●' : '○',
      dinner: userMeals.dinner ? '●' : '○',
      guest: userMeals.guestMeals > 0 ? userMeals.guestMeals.toString() : '0',
    };
  };

  const renderMealEntry = () => (
    <div className="space-y-6">
      {/* Date Selection and Actions */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            {!isEditing && !hasDataForDate && (
              <>
                <button
                  onClick={startAddingMeals}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Add Meals
                </button>
                <button
                  onClick={copyFromYesterday}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Copy Yesterday
                </button>
              </>
            )}

            {!isEditing && hasDataForDate && (
              <button
                onClick={startAddingMeals}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
              >
                Edit Meals
              </button>
            )}

            {isEditing && (
              <>
                <button
                  onClick={saveMeals}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Save Meals
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Meals Grid */}
      {(isEditing || hasDataForDate) && (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">
              Meals for {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
          </div>
          <div className="p-6">
            <div className="grid gap-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900 w-24">{user.name}</div>

                  <div className="flex items-center gap-6">
                    {/* Lunch */}
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={meals[user.id]?.lunch || false}
                        onChange={() => toggleMeal(user.id, 'lunch')}
                        disabled={!isEditing}
                        className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded disabled:opacity-50"
                      />
                      <span className="text-sm font-medium text-gray-700">Lunch</span>
                    </label>

                    {/* Dinner */}
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={meals[user.id]?.dinner || false}
                        onChange={() => toggleMeal(user.id, 'dinner')}
                        disabled={!isEditing}
                        className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded disabled:opacity-50"
                      />
                      <span className="text-sm font-medium text-gray-700">Dinner</span>
                    </label>

                    {/* Guest Meals */}
                    <div className="flex items-center">
                      <label className="text-sm font-medium text-gray-700 mr-2">Guest:</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={meals[user.id]?.guestMeals || 0}
                        onChange={(e) => updateGuestMealsCount(user.id, parseInt(e.target.value) || 0)}
                        disabled={!isEditing}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Meal Summary */}
                  <div className="text-sm text-gray-500 w-20 text-right">
                    {(meals[user.id]?.lunch ? 1 : 0) +
                      (meals[user.id]?.dinner ? 1 : 0) +
                      (meals[user.id]?.guestMeals || 0)} meals
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isEditing && !hasDataForDate && (
        <div className="bg-white rounded-lg border p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No meals recorded for this date</h3>
          <p className="text-gray-500 mb-4">Click "Add Meals" to start tracking meals for {selectedDate}</p>
        </div>
      )}
    </div>
  );

  const renderMealHistory = () => (
    <div className="space-y-6">
      {/* Load Sample Data Button */}
      <div className="flex justify-end">
        <button
          onClick={loadSampleData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Load Sample Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Days Tracked</h3>
          <p className="text-2xl font-bold text-blue-600">{dateRange.length}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Meals Recorded</h3>
          <p className="text-2xl font-bold text-green-600">
            {userTotals.reduce((sum, user) => sum + user.totalMeals, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-sm font-medium text-gray-500">Average Meals/Day</h3>
          <p className="text-2xl font-bold text-orange-600">
            {dateRange.length > 0
              ? (userTotals.reduce((sum, user) => sum + user.totalMeals, 0) / dateRange.length).toFixed(1)
              : '0'
            }
          </p>
        </div>
      </div>

      {/* User Totals Summary */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Member Summary</h3>
          <p className="text-sm text-gray-500 mt-1">Total meals for each member this cycle</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {userTotals.map((userTotal) => (
              <div key={userTotal.userId} className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{userTotal.name}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lunch:</span>
                    <span className="font-medium">{userTotal.totalLunch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dinner:</span>
                    <span className="font-medium">{userTotal.totalDinner}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guest:</span>
                    <span className="font-medium">{userTotal.totalGuest}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1 mt-2">
                    <span className="text-gray-900 font-medium">Total:</span>
                    <span className="font-bold text-blue-600">{userTotal.totalMeals}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Meal History Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Daily Meal History</h3>
          <p className="text-sm text-gray-500 mt-1">
            History from cycle start to yesterday. ● = Had meal, ○ = No meal, Numbers = Guest meals
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900 sticky left-0 bg-gray-50">Date</th>
                {users.map((user) => (
                  <th key={user.id} className="text-center py-3 px-3 font-medium text-gray-900 min-w-[100px]">
                    <div>{user.name}</div>
                    <div className="text-xs text-gray-500 font-normal">L • D • G</div>
                  </th>
                ))}
                <th className="text-center py-3 px-4 font-medium text-gray-900">Day Total</th>
              </tr>
            </thead>
            <tbody>
              {dateRange.map((date, index) => {
                const dayMeals = mealsByDate[date] || {};
                const dayTotal = users.reduce((total, user) => {
                  const userMeals = dayMeals[user.id];
                  if (userMeals) {
                    return total + (userMeals.lunch ? 1 : 0) + (userMeals.dinner ? 1 : 0) + userMeals.guestMeals;
                  }
                  return total;
                }, 0);

                const isYesterday = (() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  return date === yesterday.toISOString().split('T')[0];
                })();

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
                    {users.map((user) => {
                      const meal = getMealDisplay(dayMeals[user.id]);
                      return (
                        <td key={user.id} className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center space-x-1 text-sm">
                            <span className={`${meal.lunch === '●' ? 'text-green-600' : 'text-gray-300'}`}>
                              {meal.lunch}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className={`${meal.dinner === '●' ? 'text-orange-600' : 'text-gray-300'}`}>
                              {meal.dinner}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className={`${meal.guest !== '0' ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                              {meal.guest}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                    <td className="py-3 px-4 text-center font-medium text-gray-900">
                      <span className={`${dayTotal > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                        {dayTotal}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {dateRange.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No meal data available</p>
            <p className="text-sm mt-1">Start tracking meals to see history here</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meals</h1>
        <p className="text-gray-500">Track daily meals and view meal history</p>
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
              📝 Meal Entry
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'history'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              📊 Meal History
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'entry' ? renderMealEntry() : renderMealHistory()}
        </div>
      </div>
    </div>
  );
}
