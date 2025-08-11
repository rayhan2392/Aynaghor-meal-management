import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { MealsPage } from './pages/MealsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { DepositsPage } from './pages/DepositsPage';
import { ClosePage } from './pages/ClosePage';
import { SettingsPage } from './pages/SettingsPage';
import { Toaster } from './components/ui/toaster';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/meals" element={<MealsPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/deposits" element={<DepositsPage />} />
            <Route path="/close" element={<ClosePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
        <Toaster />
      </Router>
    </Provider>
  );
}

export default App;