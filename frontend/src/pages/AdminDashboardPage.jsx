import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    };

    fetchStats();
  }, []);

  if (!stats) {
    return <p>Đang tải dữ liệu quản trị...</p>;
  }

  return (
    <div>
      <h1>Quản trị hệ thống</h1>
      <div className="grid admin-stats">
        <div className="card"><h3>Khách hàng</h3><p>{stats.userCount}</p></div>
        <div className="card"><h3>Sản phẩm</h3><p>{stats.productCount}</p></div>
        <div className="card"><h3>Đơn hàng</h3><p>{stats.orderCount}</p></div>
        <div className="card"><h3>Doanh thu</h3><p>{stats.revenue.toLocaleString('vi-VN')}đ</p></div>
      </div>

      <div className="row" style={{ marginTop: 16 }}>
        <Link className="btn" to="/admin/products">Quản lý sản phẩm</Link>
        <Link className="btn btn-outline" to="/admin/orders">Quản lý đơn hàng</Link>
      </div>

      <h2 style={{ marginTop: 24 }}>Đơn hàng mới</h2>
      <div className="grid">
        {stats.recentOrders.map((order) => (
          <article className="card" key={order._id}>
            <p>{order.user?.name || 'Khách vãng lai'}</p>
            <p>{order.totalPrice.toLocaleString('vi-VN')}đ</p>
            <p>{order.orderStatus}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
