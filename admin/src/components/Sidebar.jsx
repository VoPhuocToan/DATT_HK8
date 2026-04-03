import { useAuth } from '../context/AuthContext';
import {
  IconDashboard, IconPackage, IconCart, IconGrid,
  IconZap, IconStar, IconFileText, IconUsers,
  IconPercent, IconBarChart, IconHeadphones, IconDollar,
  IconStore, IconLogOut, IconImage
} from './Icons';

const NAV = [
  { key: 'dashboard',  label: 'Dashboard',      Icon: IconDashboard },
  { key: 'products',   label: 'Sản phẩm',        Icon: IconPackage },
  { key: 'orders',     label: 'Đơn hàng',        Icon: IconCart },
  { key: 'categories', label: 'Danh mục',        Icon: IconGrid },
  { key: 'flashsale',  label: 'Flash Sale',      Icon: IconZap },
  { key: 'banners',    label: 'Quảng cáo',       Icon: IconImage },
  { key: 'reviews',    label: 'Đánh giá',        Icon: IconStar },
  { key: 'articles',   label: 'Bài viết',        Icon: IconFileText },
  { key: 'customers',  label: 'Khách hàng',      Icon: IconUsers },
  { key: 'discounts',  label: 'Giảm giá',        Icon: IconPercent },
  { key: 'statistics', label: 'Thống kê',        Icon: IconBarChart },
  { key: 'support',    label: 'Hỗ trợ',          Icon: IconHeadphones },
  { key: 'revenue',    label: 'Tổng doanh thu',  Icon: IconDollar },
];

const Sidebar = ({ active, onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo"><IconStore size={22} /></span>
        <div>
          <div className="sidebar-title">Đặng Anh Mobile</div>
          <div className="sidebar-sub">Admin Panel</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`nav-item ${active === key ? 'active' : ''}`}
            onClick={() => onNavigate(key)}
          >
            <span className="nav-icon"><Icon size={17} /></span>
            <span>{label}</span>
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
        <button className="btn-logout" onClick={logout}>
          <IconLogOut size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
