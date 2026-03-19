import { useEffect, useState } from 'react';
import api from '../services/api';

const STATUS_LABEL = {
  pending: { label: 'Chờ xác nhận', color: '#f59e0b' },
  confirmed: { label: 'Đã xác nhận', color: '#3b82f6' },
  shipping: { label: 'Đang giao', color: '#8b5cf6' },
  delivered: { label: 'Đã giao', color: '#10b981' },
  cancelled: { label: 'Đã hủy', color: '#ef4444' },
};

const Revenue = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    api.get('/admin/orders').then(({ data }) => {
      setOrders(data || []);
      setLoading(false);
    });
  }, []);

  const filtered = orders.filter((o) => {
    if (o.orderStatus === 'cancelled') return false;
    const d = new Date(o.createdAt);
    if (fromDate && d < new Date(fromDate)) return false;
    if (toDate && d > new Date(toDate + 'T23:59:59')) return false;
    return true;
  });

  const totalRevenue = filtered.reduce((s, o) => s + Number(o.totalPrice), 0);
  const totalOrders = filtered.length;
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Group by day
  const byDay = {};
  filtered.forEach((o) => {
    const day = new Date(o.createdAt).toLocaleDateString('vi-VN');
    if (!byDay[day]) byDay[day] = { count: 0, revenue: 0 };
    byDay[day].count += 1;
    byDay[day].revenue += Number(o.totalPrice);
  });
  const dayRows = Object.entries(byDay).sort((a, b) => {
    const [da, ma, ya] = a[0].split('/').map(Number);
    const [db, mb, yb] = b[0].split('/').map(Number);
    return new Date(yb, mb - 1, db) - new Date(ya, ma - 1, da);
  });

  return (
    <div className="page">
      <h2 className="page-title">Tổng doanh thu</h2>

      {/* Filter */}
      <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div className="field" style={{ minWidth: 160 }}>
          <label>Từ ngày</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="field" style={{ minWidth: 160 }}>
          <label>Đến ngày</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <button className="btn-outline" onClick={() => { setFromDate(''); setToDate(''); }}>Xóa lọc</button>
      </div>

      {/* Summary */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderTop: '4px solid #10b981' }}>
          <div className="stat-icon" style={{ background: '#10b98120', color: '#10b981' }}>💰</div>
          <div>
            <div className="stat-value">{totalRevenue.toLocaleString('vi-VN')}đ</div>
            <div className="stat-label">Tổng doanh thu</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
          <div className="stat-icon" style={{ background: '#3b82f620', color: '#3b82f6' }}>🛒</div>
          <div>
            <div className="stat-value">{totalOrders}</div>
            <div className="stat-label">Số đơn hàng</div>
          </div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid #f59e0b' }}>
          <div className="stat-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>📊</div>
          <div>
            <div className="stat-value">{Math.round(avgOrder).toLocaleString('vi-VN')}đ</div>
            <div className="stat-label">Giá trị đơn TB</div>
          </div>
        </div>
      </div>

      {/* By day */}
      <div className="card">
        <h3 className="card-title">Doanh thu theo ngày</h3>
        {loading ? <div className="page-loading">Đang tải...</div> : (
          <table className="table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Số đơn</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {dayRows.length === 0 && (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8' }}>Không có dữ liệu</td></tr>
              )}
              {dayRows.map(([day, val]) => (
                <tr key={day}>
                  <td>{day}</td>
                  <td>{val.count} đơn</td>
                  <td style={{ fontWeight: 600, color: '#10b981' }}>{val.revenue.toLocaleString('vi-VN')}đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* All orders */}
      <div className="card">
        <h3 className="card-title">Chi tiết đơn hàng ({totalOrders})</h3>
        {loading ? <div className="page-loading">Đang tải...</div> : (
          <table className="table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const s = STATUS_LABEL[o.orderStatus] || {};
                return (
                  <tr key={o._id}>
                    <td>
                      <div>{o.user?.name || '—'}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{o.user?.email}</div>
                    </td>
                    <td style={{ fontSize: 12, color: '#475569' }}>
                      {o.orderItems?.map((i) => i.name).join(', ')}
                    </td>
                    <td style={{ fontWeight: 600 }}>{Number(o.totalPrice).toLocaleString('vi-VN')}đ</td>
                    <td>
                      <span className="badge" style={{ background: s.color + '20', color: s.color }}>
                        {s.label}
                      </span>
                    </td>
                    <td>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Revenue;
