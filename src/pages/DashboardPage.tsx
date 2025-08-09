import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/features/store';
import { 
  selectDashboardStats, 
  selectDashboardLoading, 
  selectCurrentCycleId 
} from '@/features/dashboard/dashboard.selectors';
import { fetchDeposits } from '@/features/deposits/deposits.slice';
import { fetchExpenses } from '@/features/expenses/expenses.slice';
import { fetchMealEntries } from '@/features/meals/meals.slice';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { UserTotalsTable } from '@/components/dashboard/UserTotalsTable';
import { TodayQuickEntry } from '@/components/dashboard/TodayQuickEntry';

export function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const currentCycleId = useSelector(selectCurrentCycleId);
  const dashboardStats = useSelector(selectDashboardStats);
  const loading = useSelector(selectDashboardLoading);

  useEffect(() => {
    if (currentCycleId) {
      // Fetch all data for the current cycle
      dispatch(fetchDeposits(currentCycleId));
      dispatch(fetchExpenses(currentCycleId));
      dispatch(fetchMealEntries(currentCycleId));
    }
  }, [dispatch, currentCycleId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (!currentCycleId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Cycle</h3>
          <p className="text-gray-500">Create a new cycle to start tracking meals and expenses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of current month's meals and expenses</p>
      </div>

      {/* KPI Cards */}
      <KpiCards stats={dashboardStats} />

      {/* User Totals Table */}
      <UserTotalsTable stats={dashboardStats} />

      {/* Today's Quick Entry */}
      <TodayQuickEntry />
    </div>
  );
}
