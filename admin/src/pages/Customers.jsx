import { useEffect, useState } from 'react';
import api from '../services/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/customers').then(({ data }) => {
      setCustomers(data || []);
      setLoading(false);
    });
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <h2 className="page-title">Khách hàng</h2>

      <div className="search-bar" style={{ marginBottom: 16 }}>
        <input
          placeholder="Tìm theo tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        {loading ? <div className="page-loading">Đang tải...</div> : (
          <table className="table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Ngày đăng ký</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div className="customer-avatar-row">
                      <div className="user-avatar sm">{c.name?.[0]?.toUpperCase()}</div>
                      {c.name}
                    </div>
                  </td>
                  <td>{c.email}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ padding: '8px 0', color: '#6b7280', fontSize: 13 }}>
          Tổng: {filtered.length} khách hàng
        </div>
      </div>
    </div>
  );
};

export default Customers;
