import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { formatBDT } from '../utils/currency';
import { QuickEntryForms } from '../components/dashboard/QuickEntryForms';

// Mock users data
const users = [
    { id: '1', name: 'Shawn' },
    { id: '2', name: 'Sadi' },
    { id: '3', name: 'Masud' },
    { id: '4', name: 'Arnab' },
    { id: '5', name: 'Muzahid' },
];

export function Dashboard() {
    const expenses = useSelector((state: RootState) => state.expenses.expenses);
    const deposits = useSelector((state: RootState) => state.deposits.deposits);
    const mealsByDate = useSelector((state: RootState) => state.meals.mealsByDate);

    // Calculate real stats from Redux data
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalDeposits = deposits.reduce((sum, dep) => sum + dep.amount, 0);

    // Calculate total meals from all dates
    const totalMeals = Object.values(mealsByDate).reduce((total, dayMeals) => {
        return total + Object.values(dayMeals).reduce((dayTotal, userMeals) => {
            return dayTotal + (userMeals.lunch ? 1 : 0) + (userMeals.dinner ? 1 : 0) + userMeals.guestMeals;
        }, 0);
    }, 0);

    const perMealRate = totalMeals > 0 ? totalExpenses / totalMeals : 0;

    // Calculate per-user stats
    const userStats = users.map(user => {
        // User deposits
        const userDeposits = deposits.filter(dep => dep.userId === user.id);
        const deposited = userDeposits.reduce((sum, dep) => sum + dep.amount, 0);

        // User meals
        const userMeals = Object.values(mealsByDate).reduce((total, dayMeals) => {
            const userDayMeals = dayMeals[user.id];
            if (!userDayMeals) return total;
            return total + (userDayMeals.lunch ? 1 : 0) + (userDayMeals.dinner ? 1 : 0) + userDayMeals.guestMeals;
        }, 0);

        // User burn and net
        const burn = userMeals * perMealRate;
        const net = deposited - burn;

        return {
            name: user.name,
            deposited: deposited.toString(),
            meals: userMeals,
            burn: burn.toString(),
            net: net.toString(),
        };
    });

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Overview of current month's meals and expenses</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-sm font-medium text-gray-500">Total Deposits</h3>
                    <p className="text-2xl font-bold">{formatBDT(totalDeposits)}</p>
                </div>
                <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
                    <p className="text-2xl font-bold">{formatBDT(totalExpenses)}</p>
                </div>
                <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-sm font-medium text-gray-500">Total Meals</h3>
                    <p className="text-2xl font-bold">{totalMeals}</p>
                </div>
                <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-sm font-medium text-gray-500">Per Meal Rate</h3>
                    <p className="text-2xl font-bold">{formatBDT(Math.round(perMealRate))}</p>
                </div>
            </div>

            {/* User Summary Table */}
            <div className="bg-white rounded-lg border">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">User Summary (Month to Date)</h3>
                </div>
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 px-3 font-medium text-gray-900">Member</th>
                                    <th className="text-right py-2 px-3 font-medium text-gray-900">Deposited</th>
                                    <th className="text-right py-2 px-3 font-medium text-gray-900">Meals</th>
                                    <th className="text-right py-2 px-3 font-medium text-gray-900">Burn So Far</th>
                                    <th className="text-right py-2 px-3 font-medium text-gray-900">Net Position</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userStats.map((user) => (
                                    <tr key={user.name} className="border-b border-gray-100">
                                        <td className="py-3 px-3 font-medium">{user.name}</td>
                                        <td className="py-3 px-3 text-right">{formatBDT(user.deposited)}</td>
                                        <td className="py-3 px-3 text-right">{user.meals}</td>
                                        <td className="py-3 px-3 text-right">{formatBDT(user.burn)}</td>
                                        <td className="py-3 px-3 text-right">
                                            <span
                                                className={`font-medium ${parseFloat(user.net) > 0
                                                    ? 'text-green-600'
                                                    : parseFloat(user.net) < 0
                                                        ? 'text-red-600'
                                                        : 'text-gray-900'
                                                    }`}
                                            >
                                                {formatBDT(Math.round(parseFloat(user.net)))}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Today's Quick Entry */}
            <div className="bg-white rounded-lg border">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">Emergency Expense Entry</h3>
                    <p className="text-sm text-gray-500 mt-1">For additional/emergency expenses only</p>
                </div>
                <div className="p-6">
                    <QuickEntryForms />
                </div>
            </div>
        </div>
    );
}
