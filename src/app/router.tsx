import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { MealsPage } from '@/pages/MealsPage';
import { ExpensesPage } from '@/pages/ExpensesPage';
import { DepositsPage } from '@/pages/DepositsPage';
import { ClosePage } from '@/pages/ClosePage';
import { SettingsPage } from '@/pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'meals',
        element: <MealsPage />,
      },
      {
        path: 'expenses',
        element: <ExpensesPage />,
      },
      {
        path: 'deposits',
        element: <DepositsPage />,
      },
      {
        path: 'close',
        element: <ClosePage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
]);
