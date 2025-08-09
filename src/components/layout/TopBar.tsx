import { useSelector } from 'react-redux';
import { selectCurrentCycle } from '@/features/dashboard/dashboard.selectors';

export function TopBar() {
  const currentCycle = useSelector(selectCurrentCycle);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {currentCycle ? `Current Cycle: ${currentCycle.name}` : 'No Active Cycle'}
          </h2>
          <p className="text-sm text-gray-500">
            {currentCycle 
              ? `${currentCycle.status === 'open' ? 'Open' : 'Closed'} • ${new Date().toLocaleDateString('en-BD')}`
              : 'Create a new cycle to get started'
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">Manager</p>
            <p className="text-xs text-gray-500">Meal Management System</p>
          </div>
        </div>
      </div>
    </header>
  );
}
