import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SearchBox from './SearchBox';
import {
  IconCart, IconUser, IconSettings, IconShoppingBag,
  IconHeart, IconLogOut, IconPhone, IconLaptop,
  IconHeadphones, IconWatch, IconTablet, IconFileText,
  IconStore
} from './Icons';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDropdownItemClick = () => {
    setIsDropdownOpen(false);
  };

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
            <SearchBox />
          </div>

          {/* Actions */}
          <div className="header-actions">
            <NavLink to="/cart" className="header-action-btn">
              <span className="header-action-icon"><IconCart size={20} /></span>
              <span className="header-action-label">Giỏ hàng</span>
              {cartCount > 0 && <span className="header-cart-badge">{cartCount}</span>}
            </NavLink>

            {user ? (
              <div className="header-action-btn header-user-wrap" ref={dropdownRef}>
                <div className="header-user-trigger" onClick={toggleDropdown}>
                  <span className="header-user-avatar"><IconUser size={20} /></span>
                  <span className="header-action-label">{user.name}</span>
                  <span className="header-user-caret">▾</span>
                </div>
                <div className={`header-user-dropdown ${isDropdownOpen ? 'show' : ''}`}>
                  <div className="header-user-dropdown-header">
                    <span className="header-user-avatar-lg"><IconUser size={28} /></span>
                    <span className="header-user-dropdown-name">{user.name}</span>
                  </div>
                  <div className="header-user-dropdown-body">
                    {user.role === 'admin' && (
                      <NavLink to="/admin" className="hud-item" onClick={handleDropdownItemClick}>
                        <span className="hud-icon"><IconSettings size={15} /></span> Quản trị
                      </NavLink>
                    )}
                    <NavLink to="/profile" className="hud-item" onClick={handleDropdownItemClick}>
                      <span className="hud-icon"><IconUser size={15} /></span> Thông tin cá nhân
                    </NavLink>
                    <NavLink to="/orders" className="hud-item" onClick={handleDropdownItemClick}>
                      <span className="hud-icon"><IconShoppingBag size={15} /></span> Đơn hàng của tôi
                    </NavLink>
                    <NavLink to="/wishlist" className="hud-item" onClick={handleDropdownItemClick}>
                      <span className="hud-icon"><IconHeart size={15} /></span> Sản phẩm yêu thích
                    </NavLink>
                  </div>
                  <div className="header-user-dropdown-footer">
                    <button onClick={handleLogout} className="hud-logout">
                      <span className="hud-icon"><IconLogOut size={15} /></span> Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="header-action-btn">
                <span className="header-action-icon"><IconUser size={20} /></span>
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
            <NavLink to="/products"><IconStore size={15} /> Tất cả</NavLink>
            <NavLink to="/dien-thoai"><IconPhone size={15} /> Điện thoại</NavLink>
            <NavLink to="/laptops"><IconLaptop size={15} /> Laptop</NavLink>
            <NavLink to="/accessories"><IconHeadphones size={15} /> Phụ kiện</NavLink>
            <NavLink to="/smartwatch"><IconWatch size={15} /> Smartwatch</NavLink>
            <NavLink to="/tablet"><IconTablet size={15} /> Tablet</NavLink>
            <NavLink to="/blog"><IconFileText size={15} /> Bài viết</NavLink>
            <NavLink to="/contact"><IconPhone size={15} /> Liên hệ</NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
