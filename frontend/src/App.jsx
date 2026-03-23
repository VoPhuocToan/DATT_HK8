import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminPage from './admin/AdminPage';
import AdminRoute from './components/AdminRoute';
import Footer from './components/Footer';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductsPage from './pages/ProductsPage';
import RegisterPage from './pages/RegisterPage';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Header />
          <main className="container page-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage categorySlug="dien-thoai" pageTitle="Điện thoại" />} />
              <Route path="/laptops" element={<ProductsPage categorySlug="laptop" pageTitle="Laptop" />} />
              <Route path="/smartwatch" element={<ProductsPage categorySlug="smartwatch" pageTitle="Smartwatch" />} />
              <Route path="/accessories" element={<ProductsPage categorySlug="phu-kien" pageTitle="Phụ kiện" />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
              <Route path="/admin/products" element={<AdminRoute><Navigate to="/admin" replace /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><Navigate to="/admin" replace /></AdminRoute>} />
            </Routes>
          </main>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
