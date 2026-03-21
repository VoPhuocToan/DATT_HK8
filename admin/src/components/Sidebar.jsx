import { useAuth } from '../context/AuthContext';

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'products', label: 'Sản phẩm', icon: '📦' },
  { key: 'orders', label: 'Đơn hàng', icon: '🛒' },
  { key: 'categories', label: 'Danh mục', icon: '🗂️' },
  { key: 'customers', label: 'Khách hàng', icon: '👥' },
  { key: 'discounts', label: 'Giảm giá', icon: '🏷️' },
  { key: 'statistics', label: 'Thống kê', icon: '📈' },
  { key: 'support', label: 'Hỗ trợ', icon: '🎧' },
  { key: 'revenue', label: 'Tổng doanh thu', icon: '💰' },
];

const Sidebar = ({ active, onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">🛒</span>
        <div>
          <div className="sidebar-title">Đặng Anh Mobile</div>
          <div className="sidebar-sub">Admin Panel</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map((item) => (
          <button
            key={item.key}
            className={`nav-item ${active === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">Administrator</div>
          </div>
        </div>
        <button className="btn-logout" onClick={logout}>Đăng xuất</button>
      </div>
    </aside>
  );
};

export default Sidebar;
