import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminPage from './admin/AdminPage';
import AdminRoute from './components/AdminRoute';
import Footer from './components/Footer';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductsPage from './pages/ProductsPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';
import RegisterPage from './pages/RegisterPage';
import PaymentQRPage from './pages/PaymentQRPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
          <Header />
          <main className="container page-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage pageTitle="Tất cả sản phẩm" />} />
              <Route path="/dien-thoai" element={<ProductsPage categorySlug="dien-thoai" pageTitle="Điện thoại" />} />
              <Route path="/laptops" element={<ProductsPage categorySlug="laptop" pageTitle="Laptop" />} />
              <Route path="/smartwatch" element={<ProductsPage categorySlug="smartwatch" pageTitle="Smartwatch" />} />
              <Route path="/accessories" element={<ProductsPage categorySlug="phu-kien" pageTitle="Phụ kiện" />} />
              <Route path="/tablet" element={<ProductsPage categorySlug="tablet" pageTitle="Tablet" />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/payment/qr/:orderId" element={<ProtectedRoute><PaymentQRPage /></ProtectedRoute>} />
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route path="/payment/cancel" element={<PaymentCancelPage />} />
              <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
              <Route path="/admin/products" element={<AdminRoute><Navigate to="/admin" replace /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><Navigate to="/admin" replace /></AdminRoute>} />
            </Routes>
          </main>
          <Footer />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
