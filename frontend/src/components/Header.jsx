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
        <div className="container nav">
          <Link to="/" className="brand">
            Đặng Anh Shop
          </Link>

          <div className="header-search">
            <input placeholder="Bạn tìm gì..." readOnly />
          </div>

          <div className="auth-actions">
            {user ? (
              <>
                <span className="welcome-text">Xin chào, {user.name}</span>
                <button className="btn btn-outline" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="quick-box">
                  Đăng nhập
                </Link>
                <Link to="/register" className="quick-box">
                  Đăng ký
                </Link>
              </>
            )}
            <NavLink to="/cart" className="quick-box">
              Giỏ hàng ({cartCount})
            </NavLink>
          </div>
        </div>
      </div>

      <div className="header-bottom">
        <div className="container">
          <nav className="menu">
            <NavLink to="/">Trang chủ</NavLink>
            <NavLink to="/products">Điện thoại</NavLink>
            {user && <NavLink to="/orders">Đơn hàng</NavLink>}
            {user?.role === 'admin' && <NavLink to="/admin">Quản trị</NavLink>}
            <a href="#">Laptop</a>
            <a href="#">Tablet</a>
            <a href="#">Phụ kiện</a>
            <a href="#">Khuyến mãi</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
