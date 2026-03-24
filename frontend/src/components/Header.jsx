import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      {/* ── Main bar ── */}
      <div className="header-main">
        <div className="container header-inner">

          {/* Logo */}
          <Link to="/" className="header-logo">
            Đặng Anh<span className="header-logo-accent">Mobile</span>
          </Link>

          {/* Search */}
          <div className="header-search-wrap">
            <span className="header-search-icon">🔍</span>
            <input className="header-search-input" placeholder="Bạn muốn mua gì hôm nay?" readOnly />
          </div>

          {/* Actions */}
          <div className="header-actions">
            <NavLink to="/cart" className="header-action-btn">
              <span className="header-action-icon">🛒</span>
              <span className="header-action-label">Giỏ hàng</span>
              {cartCount > 0 && <span className="header-cart-badge">{cartCount}</span>}
            </NavLink>

            {user ? (
              <div className="header-action-btn header-user-wrap">
                <span className="header-user-avatar">👤</span>
                <span className="header-action-label">{user.name}</span>
                <span className="header-user-caret">▾</span>
                <div className="header-user-dropdown">
                  <div className="header-user-dropdown-header">
                    <span className="header-user-avatar-lg">👤</span>
                    <span className="header-user-dropdown-name">{user.name}</span>
                  </div>
                  <div className="header-user-dropdown-body">
                    {user.role === 'admin' && (
                      <NavLink to="/admin" className="hud-item">
                        <span className="hud-icon">⚙️</span> Quản trị
                      </NavLink>
                    )}
                    <NavLink to="/profile" className="hud-item">
                      <span className="hud-icon">👤</span> Thông tin cá nhân
                    </NavLink>
                    <NavLink to="/orders" className="hud-item">
                      <span className="hud-icon">🛍️</span> Đơn hàng của tôi
                    </NavLink>
                    <NavLink to="/wishlist" className="hud-item">
                      <span className="hud-icon">❤️</span> Sản phẩm yêu thích
                    </NavLink>
                  </div>
                  <div className="header-user-dropdown-footer">
                    <button onClick={handleLogout} className="hud-logout">
                      <span className="hud-icon">↪️</span> Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="header-action-btn">
                <span className="header-action-icon">👤</span>
                <span className="header-action-label">Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Nav bar ── */}
      <div className="header-nav-bar">
        <div className="container">
          <nav className="header-nav">
            <NavLink to="/" end>Trang chủ</NavLink>
            <NavLink to="/products">📱 Điện thoại</NavLink>
            <NavLink to="/laptops">💻 Laptop</NavLink>
            <NavLink to="/accessories">🎧 Phụ kiện</NavLink>
            <NavLink to="/smartwatch">⌚ Smartwatch</NavLink>
            <a href="#">📟 Tablet</a>
            <NavLink to="/blog">📝 Bài viết</NavLink>
            <NavLink to="/contact">📞 Liên hệ</NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
