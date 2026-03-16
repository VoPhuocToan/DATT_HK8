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
      <div className="header-top">
        <div className="container nav tgdd-topbar">
          <Link to="/" className="brand tgdd-logo" aria-label="Trang chủ Đặng Anh Shop">
            <span className="logo-dot" />
            danganhshop
            <small>.com</small>
          </Link>

          <div className="header-search tgdd-search">
            <input placeholder="Bạn tìm gì hôm nay?" readOnly />
          </div>

          <div className="auth-actions tgdd-actions">
            {user ? (
              <>
                <span className="welcome-text">Xin chào, {user.name}</span>
                <button className="quick-box" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="quick-box">
                  👤 Đăng nhập
                </Link>
                <Link to="/register" className="quick-box">
                  Đăng ký
                </Link>
              </>
            )}
            <NavLink to="/cart" className="quick-box">
              🛒 Giỏ hàng ({cartCount})
            </NavLink>
            <div className="quick-box location-box">📍 Hồ Chí Minh</div>
          </div>
        </div>
      </div>

      <div className="header-bottom">
        <div className="container">
          <nav className="menu tgdd-menu">
            <NavLink to="/products">📱 Điện thoại</NavLink>
            <a href="#">💻 Laptop</a>
            <a href="#">🎧 Phụ kiện</a>
            <a href="#">⌚ Smartwatch</a>
            <a href="#">⌚ Đồng hồ</a>
            <a href="#">📟 Tablet</a>
            <a href="#">🖥️ Màn hình, Máy in</a>
            <a href="#">💳 Sim, Thẻ cào</a>
            {user && <NavLink to="/orders">Đơn hàng</NavLink>}
            {user?.role === 'admin' && <NavLink to="/admin">Quản trị</NavLink>}
            <NavLink to="/">Khuyến mãi online</NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
