import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Utensils, 
  Receipt, 
  DollarSign, 
  Archive, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Meals', href: '/meals', icon: Utensils },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Deposits', href: '/deposits', icon: DollarSign },
  { name: 'Close Month', href: '/close', icon: Archive },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function NavSidebar() {
  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo/Title */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            Aynnaghor Meal Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manager Dashboard</p>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
