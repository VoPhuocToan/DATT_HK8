import { useEffect, useState } from 'react';
import api from '../services/api';

const now = new Date();
const THIS_YEAR = now.getFullYear();
const THIS_MONTH = now.getMonth() + 1;
const YEARS = Array.from({ length: 5 }, (_, i) => THIS_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const RANK_COLORS = ['#f59e0b', '#94a3b8', '#f97316'];

const RankBadge = ({ rank }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 28, height: 28, borderRadius: '50%', fontWeight: 700, fontSize: 13,
    background: rank <= 3 ? RANK_COLORS[rank - 1] : '#e2e8f0',
    color: rank <= 3 ? '#fff' : '#475569',
  }}>{rank}</span>
);

const StatusBadge = ({ stock }) => {
  if (stock === 0) return <span className="badge" style={{ background: '#fee2e2', color: '#dc2626' }}>Hết hàng</span>;
  if (stock <= 5) return <span className="badge" style={{ background: '#fef3c7', color: '#d97706' }}>Sắp hết</span>;
  return <span className="badge" style={{ background: '#d1fae5', color: '#059669' }}>Còn hàng</span>;
};

const ProductTable = ({ products, type }) => (
  <table className="table">
    <thead>
      <tr>
        <th>Hạng</th>
        <th>Ảnh</th>
        <th>Tên sản phẩm</th>
        <th>Giá bán</th>
        <th>Đã bán</th>
        <th>Doanh thu</th>
        <th>Tồn kho</th>
        <th>Trạng thái</th>
      </tr>
    </thead>
    <tbody>
      {products.map((p, i) => (
        <tr key={p._id}>
          <td><RankBadge rank={i + 1} /></td>
          <td>
            <img
              src={p.image || 'https://placehold.co/44'}
              alt={p.name}
              className="product-thumb"
            />
          </td>
          <td>
            <div style={{ fontWeight: 500 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{p.category}</div>
          </td>
          <td>{Number(p.price).toLocaleString('vi-VN')}đ</td>
          <td>
            <span style={{
              display: 'inline-block', padding: '2px 10px', borderRadius: 20,
              background: type === 'top' ? '#d1fae5' : '#fee2e2',
              color: type === 'top' ? '#059669' : '#dc2626',
              fontWeight: 700, fontSize: 13,
            }}>{p.sold}</span>
          </td>
          <td style={{ color: '#059669', fontWeight: 600 }}>
            {Number(p.revenue).toLocaleString('vi-VN')}đ
          </td>
          <td>{p.stock}</td>
          <td><StatusBadge stock={p.stock} /></td>
        </tr>
      ))}
      {products.length === 0 && (
        <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>Chưa có dữ liệu</td></tr>
      )}
    </tbody>
  </table>
);

const Statistics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [filterType, setFilterType] = useState('month'); // all | day | month | year
  const [day, setDay] = useState('');
  const [month, setMonth] = useState(THIS_MONTH);
  const [year, setYear] = useState(THIS_YEAR);

  const buildRange = () => {
    if (filterType === 'all') return {};
    if (filterType === 'day' && day) {
      return { from: day, to: day };
    }
    if (filterType === 'month') {
      const from = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
      return { from, to };
    }
    if (filterType === 'year') {
      return { from: `${year}-01-01`, to: `${year}-12-31` };
    }
    return {};
  };

  const load = async () => {
    setLoading(true);
    const params = buildRange();
    const { data: d } = await api.get('/admin/product-stats', { params });
    setData(d);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filterLabel = () => {
    if (filterType === 'all') return 'Tất cả thời gian';
    if (filterType === 'day') return day ? `Ngày ${new Date(day).toLocaleDateString('vi-VN')}` : 'Chọn ngày';
    if (filterType === 'month') return `Tháng ${month}/${year}`;
    if (filterType === 'year') return `Năm ${year}`;
    return '';
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Thống kê sản phẩm</h2>
      </div>

      {/* ── Bộ lọc ── */}
      <div className="card filter-bar">
        <div className="filter-group">
          <label>Lọc theo</label>
          <div className="tab-group">
            {[['all','Tất cả'],['day','Ngày'],['month','Tháng'],['year','Năm']].map(([k, l]) => (
              <button key={k} className={`tab-btn ${filterType === k ? 'active' : ''}`} onClick={() => setFilterType(k)}>{l}</button>
            ))}
          </div>
        </div>

        {filterType === 'day' && (
          <div className="filter-group">
            <label>Chọn ngày</label>
            <input type="date" value={day} onChange={(e) => setDay(e.target.value)} style={{ width: 160 }} />
          </div>
        )}

        {filterType === 'month' && (
          <>
            <div className="filter-group">
              <label>Tháng</label>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ width: 100 }}>
                {MONTHS.map((m) => <option key={m} value={m}>Tháng {m}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Năm</label>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ width: 100 }}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </>
        )}

        {filterType === 'year' && (
          <div className="filter-group">
            <label>Năm</label>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ width: 100 }}>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}

        <button className="btn-primary" onClick={load} disabled={loading}>
          {loading ? 'Đang tải...' : '🔍 Thống kê'}
        </button>
      </div>

      {loading && <div className="page-loading">Đang tải dữ liệu...</div>}

      {data && !loading && (
        <>
          {/* ── Top bán chạy ── */}
          <div className="card">
            <div className="stats-section-header top">
              <div>
                <div className="stats-section-title">🏆 Top 10 Sản phẩm bán chạy</div>
                <div className="stats-section-sub">Danh sách 10 sản phẩm có lượt bán cao nhất · {filterLabel()}</div>
              </div>
            </div>
            <ProductTable products={data.topSelling} type="top" />
          </div>

          {/* ── Top bán ế ── */}
          <div className="card">
            <div className="stats-section-header slow">
              <div>
                <div className="stats-section-title">⚠️ Top 10 Sản phẩm bán chậm</div>
                <div className="stats-section-sub">Danh sách 10 sản phẩm có lượt bán thấp nhất · {filterLabel()}</div>
              </div>
            </div>
            <ProductTable products={data.topSlow} type="slow" />
          </div>
        </>
      )}
    </div>
  );
};

export default Statistics;
