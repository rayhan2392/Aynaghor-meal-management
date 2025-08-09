import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatBDT } from '@/utils/currency';
import { InterimTotals } from '@/utils/settlement';

interface KpiCardsProps {
  stats: InterimTotals;
}

export function KpiCards({ stats }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Deposits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBDT(stats.totalDeposits)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBDT(stats.totalExpenses)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Total Meals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMeals}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Per Meal Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalMeals > 0 ? formatBDT(stats.interimPerMealRate) : '৳0'}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.totalMeals > 0 ? 'Current rate' : 'No meals recorded'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
