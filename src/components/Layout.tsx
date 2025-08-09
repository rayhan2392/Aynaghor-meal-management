import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Utensils,
    Receipt,
    DollarSign,
    Archive,
    Settings
} from 'lucide-react';

interface LayoutProps {
    children: ReactNode;
}

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Meals', href: '/meals', icon: Utensils },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Deposits', href: '/deposits', icon: DollarSign },
    { name: 'Close Month', href: '/close', icon: Archive },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Layout({ children }: LayoutProps) {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
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
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === item.href
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Current Cycle: March 2025
                            </h2>
                            <p className="text-sm text-gray-500">
                                Open • {new Date().toLocaleDateString('en-BD')}
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

                {/* Page content */}
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
