import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './components/LoginPage';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Categories from './pages/Categories';
import Customers from './pages/Customers';
import Discounts from './pages/Discounts';
import Statistics from './pages/Statistics';
import Support from './pages/Support';
import Revenue from './pages/Revenue';

const PAGES = {
  dashboard: Dashboard,
  products: Products,
  orders: Orders,
  categories: Categories,
  customers: Customers,
  discounts: Discounts,
  statistics: Statistics,
  support: Support,
  revenue: Revenue,
};

const AdminApp = () => {
  const { token, isAdmin } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (!token || !isAdmin) return <LoginPage />;

  const Page = PAGES[activePage] || Dashboard;

  return (
    <div className="layout">
      <Sidebar active={activePage} onNavigate={setActivePage} />
      <main className="main-content">
        <Page />
      </main>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <AdminApp />
  </AuthProvider>
);

export default App;
