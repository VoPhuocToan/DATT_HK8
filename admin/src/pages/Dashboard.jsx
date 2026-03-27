import { useEffect, useState } from 'react';
import api from '../services/api';

/* ── Donut Chart (SVG thuần) ── */
const DonutChart = ({ segments, size = 140, thickness = 32 }) => {
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  let offset = 0;
  const arcs = segments.map((seg) => {
    const dash = total > 0 ? (seg.value / total) * circumference : 0;
    const arc = { ...seg, dash, offset: circumference - offset };
    offset += dash;
    return arc;
  });

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
      {arcs.map((arc, i) => (
        <circle
          key={i} cx={cx} cy={cx} r={r} fill="none"
          stroke={arc.color} strokeWidth={thickness}
          strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
          strokeDashoffset={arc.offset}
          strokeLinecap="butt"
        />
      ))}
    </svg>
  );
};

/* ── Line Chart (SVG thuần) ── */
const LineChart = ({ data }) => {
  if (!data.length) return <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Chưa có dữ liệu</div>;

  const W = 600; const H = 160; const PAD = { t: 10, r: 10, b: 30, l: 50 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;
  const maxVal = Math.max(...data.map((d) => d.revenue), 1);

  const pts = data.map((d, i) => ({
    x: PAD.l + (i / Math.max(data.length - 1, 1)) * iW,
    y: PAD.t + iH - (d.revenue / maxVal) * iH,
    ...d,
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L${pts[pts.length - 1].x},${PAD.t + iH} L${pts[0].x},${PAD.t + iH} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    val: maxVal * t,
    y: PAD.t + iH - t * iH,
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 180 }}>
      {/* Grid lines */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PAD.l} y1={t.y} x2={W - PAD.r} y2={t.y} stroke="#e2e8f0" strokeWidth={1} />
          <text x={PAD.l - 6} y={t.y + 4} textAnchor="end" fontSize={9} fill="#94a3b8">
            {t.val >= 1_000_000 ? (t.val / 1_000_000).toFixed(1) + 'M' : t.val >= 1000 ? (t.val / 1000).toFixed(0) + 'K' : t.val.toFixed(0)}
          </text>
        </g>
      ))}
      {/* Area */}
      <path d={areaD} fill="#3b82f610" />
      {/* Line */}
      <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinejoin="round" />
      {/* Dots + labels */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3} fill="#3b82f6" />
          <text x={p.x} y={H - 4} textAnchor="middle" fontSize={9} fill="#94a3b8">{p.label}</text>
        </g>
      ))}
    </svg>
  );
};

/* ── Status badge ── */
const StatusBadge = ({ status }) => {
  const MAP = {
    pending: { label: 'Chờ xác nhận', bg: '#fef3c7', color: '#d97706' },
    confirmed: { label: 'Đã xác nhận', bg: '#dbeafe', color: '#2563eb' },
    shipping: { label: 'Đang giao', bg: '#ede9fe', color: '#7c3aed' },
    delivered: { label: 'Hoàn thành', bg: '#d1fae5', color: '#059669' },
    cancelled: { label: 'Đã hủy', bg: '#fee2e2', color: '#dc2626' },
  };
  const s = MAP[status] || { label: status, bg: '#f1f5f9', color: '#64748b' };
  return <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
};

/* ── Main ── */
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueTab, setRevenueTab] = useState('week'); // week | month | quarter

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Đang tải...</div>;

  if (!stats) return (
    <div className="page-loading" style={{ color: '#e53e3e' }}>
      Không thể tải dữ liệu. Vui lòng kiểm tra kết nối server.
    </div>
  );

  const revenue = Number(stats.revenue || 0);

  /* Donut: đơn hàng */
  const orderSegments = [
    { label: 'Chờ xác nhận', value: stats.orderStats?.pending || 0, color: '#f59e0b' },
    { label: 'Đang giao', value: stats.orderStats?.shipping || 0, color: '#3b82f6' },
    { label: 'Hoàn thành', value: stats.orderStats?.delivered || 0, color: '#10b981' },
    { label: 'Đã hủy', value: stats.orderStats?.cancelled || 0, color: '#ef4444' },
  ].filter((s) => s.value > 0);

  /* Donut: tồn kho */
  const stockSegments = [
    { label: 'Còn hàng', value: stats.stockStats?.inStock || 0, color: '#10b981' },
    { label: 'Sắp hết', value: stats.stockStats?.lowStock || 0, color: '#f59e0b' },
    { label: 'Hết hàng', value: stats.stockStats?.outStock || 0, color: '#ef4444' },
  ].filter((s) => s.value > 0);

  /* Line chart data */
  const buildWeek = () => {
    const map = {};
    (stats.revenueByDay || []).forEach((d) => { map[d._id] = d.revenue; });
    return Array.from({ length: 7 }, (_, i) => {
      const dt = new Date(); dt.setDate(dt.getDate() - 6 + i);
      const key = dt.toISOString().slice(0, 10);
      const label = `${['CN','T2','T3','T4','T5','T6','T7'][dt.getDay()]}, ngày ${dt.getDate()}`;
      return { label, revenue: map[key] || 0 };
    });
  };

  const buildMonth = () => {
    const map = {};
    (stats.revenueByMonth || []).forEach((d) => { map[d._id] = d.revenue; });
    return Array.from({ length: 30 }, (_, i) => {
      const dt = new Date(); dt.setDate(dt.getDate() - 29 + i);
      const key = dt.toISOString().slice(0, 10);
      return { label: `${dt.getDate()}/${dt.getMonth() + 1}`, revenue: map[key] || 0 };
    }).filter((_, i) => i % 3 === 0); // mỗi 3 ngày 1 điểm
  };

  const buildQuarter = () =>
    (stats.revenueByQuarter || []).map((d) => ({
      label: `T${d._id.month}/${String(d._id.year).slice(2)}`,
      revenue: d.revenue,
    }));

  const chartData = revenueTab === 'week' ? buildWeek() : revenueTab === 'month' ? buildMonth() : buildQuarter();

  /* Order status summary */
  const orderSummary = [
    { label: 'Chờ xác nhận', count: stats.orderStats?.pending || 0, color: '#f59e0b', icon: '🟡' },
    { label: 'Đang giao', count: stats.orderStats?.shipping || 0, color: '#3b82f6', icon: '🔵' },
    { label: 'Hoàn thành', count: stats.orderStats?.delivered || 0, color: '#10b981', icon: '🟢' },
    { label: 'Đã hủy', count: stats.orderStats?.cancelled || 0, color: '#ef4444', icon: '🔴' },
  ];

  return (
    <div className="page">
      <div className="db-topbar">
        <h2 className="page-title" style={{ margin: 0 }}>Quản trị hệ thống</h2>
      </div>

      {/* ── Stat cards ── */}
      <div className="db-stat-row">
        <div className="db-stat-card" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
          <div className="db-stat-icon">👥</div>
          <div>
            <div className="db-stat-num">{stats.userCount}</div>
            <div className="db-stat-lbl">Tổng người dùng</div>
          </div>
        </div>
        <div className="db-stat-card" style={{ background: 'linear-gradient(135deg,#f093fb,#f5576c)' }}>
          <div className="db-stat-icon">🛒</div>
          <div>
            <div className="db-stat-num">{stats.orderCount}</div>
            <div className="db-stat-lbl">Tổng đơn hàng</div>
          </div>
        </div>
        <div className="db-stat-card" style={{ background: 'linear-gradient(135deg,#4facfe,#00f2fe)' }}>
          <div className="db-stat-icon">📦</div>
          <div>
            <div className="db-stat-num">{stats.productCount}</div>
            <div className="db-stat-lbl">Tổng sản phẩm</div>
          </div>
        </div>
        <div className="db-stat-card" style={{ background: 'linear-gradient(135deg,#43e97b,#38f9d7)' }}>
          <div className="db-stat-icon">💵</div>
          <div>
            <div className="db-stat-num">{revenue.toLocaleString('vi-VN')} đ</div>
            <div className="db-stat-lbl">Tổng doanh thu</div>
          </div>
        </div>
      </div>

      {/* ── Donut charts ── */}
      <div className="db-two-col">
        <div className="card">
          <h3 className="card-title">🟡 Tình trạng đơn hàng</h3>
          <div className="donut-wrap">
            <DonutChart segments={orderSegments.length ? orderSegments : [{ value: 1, color: '#e2e8f0' }]} />
            <div className="donut-legend">
              {orderSegments.map((s, i) => (
                <div key={i} className="legend-item">
                  <span className="legend-dot" style={{ background: s.color }} />
                  <span>{s.label}</span>
                  <span className="legend-val">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">🔵 Tình trạng tồn kho</h3>
          <div className="donut-wrap">
            <DonutChart segments={stockSegments.length ? stockSegments : [{ value: 1, color: '#e2e8f0' }]} />
            <div className="donut-legend">
              {stockSegments.map((s, i) => (
                <div key={i} className="legend-item">
                  <span className="legend-dot" style={{ background: s.color }} />
                  <span>{s.label}</span>
                  <span className="legend-val">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Revenue line chart ── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 className="card-title" style={{ margin: 0 }}>📈 Biểu đồ doanh thu</h3>
          <div className="tab-group">
            {[['week','Tuần'],['month','Tháng'],['quarter','Quý']].map(([k, l]) => (
              <button key={k} className={`tab-btn ${revenueTab === k ? 'active' : ''}`} onClick={() => setRevenueTab(k)}>{l}</button>
            ))}
          </div>
        </div>
        <LineChart data={chartData} />
      </div>

      {/* ── Recent activity + Order stats ── */}
      <div className="db-two-col">
        <div className="card">
          <h3 className="card-title">🕐 Hoạt động gần đây</h3>
          <div className="activity-list">
            {stats.recentOrders?.map((order, i) => {
              const total = Number(order.totalPrice).toLocaleString('vi-VN');
              const date = new Date(order.createdAt);
              const timeStr = `${date.getHours()}:${String(date.getMinutes()).padStart(2,'0')} ${date.toLocaleDateString('vi-VN')}`;
              return (
                <div key={order._id} className="activity-item">
                  <div className="activity-icon">🛒</div>
                  <div className="activity-body">
                    <div className="activity-title">Đơn hàng #{String(order._id).slice(-3).toUpperCase()}</div>
                    <div className="activity-sub">{order.user?.name || 'Khách'} · {total}đ</div>
                    <div className="activity-time">🕐 {timeStr}</div>
                  </div>
                  <StatusBadge status={order.orderStatus} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">📊 Thống kê đơn hàng</h3>
          <div className="order-stat-list">
            {orderSummary.map((s, i) => (
              <div key={i} className="order-stat-row">
                <span>{s.icon} {s.label}</span>
                <span className="order-stat-badge" style={{ background: s.color }}>{s.count}</span>
              </div>
            ))}
            <div className="order-stat-row total-row">
              <span>Tổng đơn hàng:</span>
              <span className="order-stat-badge" style={{ background: '#3b82f6' }}>{stats.orderCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
