import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatBDT } from '@/utils/currency';
import { InterimTotals } from '@/utils/settlement';

interface UserTotalsTableProps {
  stats: InterimTotals;
}

export function UserTotalsTable({ stats }: UserTotalsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Summary (Month to Date)</CardTitle>
      </CardHeader>
      <CardContent>
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
              {stats.perUser.map((user) => (
                <tr key={user.userId} className="border-b border-gray-100">
                  <td className="py-3 px-3 font-medium">{user.name}</td>
                  <td className="py-3 px-3 text-right">{formatBDT(user.deposited)}</td>
                  <td className="py-3 px-3 text-right">{user.meals}</td>
                  <td className="py-3 px-3 text-right">{formatBDT(user.burn)}</td>
                  <td className="py-3 px-3 text-right">
                    <span
                      className={`font-medium ${
                        parseFloat(user.net) > 0
                          ? 'text-green-600'
                          : parseFloat(user.net) < 0
                          ? 'text-red-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {formatBDT(user.net)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {stats.perUser.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No user data available. Add some deposits and meals to see summary.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
