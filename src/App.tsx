import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Meals } from './pages/Meals';
import { Expenses } from './pages/Expenses';
import { Deposits } from './pages/Deposits';
import { ClosePage } from './pages/ClosePage';
import { SettingsPage } from './pages/SettingsPage';
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/meals" element={<Meals />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/deposits" element={<Deposits />} />
            <Route path="/close" element={<ClosePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App;