import { useEffect, useState } from 'react';
import api from '../services/api';

const Discounts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({}); // { [id]: salePrice }
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | discounted | normal

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/products?limit=200');
    setProducts(data.items || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (product) => {
    const salePrice = Number(editing[product._id] ?? product.salePrice);
    setMsg('');
    try {
      await api.put(`/products/${product._id}`, { ...product, category: product.category?._id || product.category, salePrice });
      setMsg(`Đã cập nhật giảm giá cho "${product.name}".`);
      setEditing((prev) => { const n = { ...prev }; delete n[product._id]; return n; });
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Cập nhật thất bại.');
    }
  };

  const handleRemove = async (product) => {
    setMsg('');
    try {
      await api.put(`/products/${product._id}`, { ...product, category: product.category?._id || product.category, salePrice: 0 });
      setMsg(`Đã xóa giảm giá cho "${product.name}".`);
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Thao tác thất bại.');
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (filter === 'discounted') return matchSearch && p.salePrice > 0;
    if (filter === 'normal') return matchSearch && (!p.salePrice || p.salePrice === 0);
    return matchSearch;
  });

  const discountedCount = products.filter((p) => p.salePrice > 0).length;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Giảm giá</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge" style={{ background: '#fef3c7', color: '#d97706', padding: '6px 14px', borderRadius: 20, fontSize: 13 }}>
            {discountedCount} sản phẩm đang giảm
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          placeholder="Tìm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 'auto' }}>
          <option value="all">Tất cả</option>
          <option value="discounted">Đang giảm giá</option>
          <option value="normal">Chưa giảm giá</option>
        </select>
      </div>

      {msg && <p className={msg.includes('thất bại') ? 'error-msg' : 'success-msg'}>{msg}</p>}

      <div className="card">
        {loading ? <div className="page-loading">Đang tải...</div> : (
          <table className="table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Giá gốc</th>
                <th>Giá giảm</th>
                <th>% Giảm</th>
                <th>Cập nhật giảm giá</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const currentSale = editing[p._id] !== undefined ? editing[p._id] : p.salePrice;
                const pct = p.price > 0 && p.salePrice > 0
                  ? Math.round((1 - p.salePrice / p.price) * 100)
                  : 0;
                return (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img src={p.images?.[0] || 'https://placehold.co/40'} alt={p.name} className="product-thumb" />
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td>{Number(p.price).toLocaleString('vi-VN')}đ</td>
                    <td>
                      {p.salePrice > 0
                        ? <span style={{ color: '#dc2626', fontWeight: 600 }}>{Number(p.salePrice).toLocaleString('vi-VN')}đ</span>
                        : <span style={{ color: '#94a3b8' }}>—</span>}
                    </td>
                    <td>
                      {pct > 0
                        ? <span className="badge" style={{ background: '#fee2e2', color: '#dc2626' }}>-{pct}%</span>
                        : '—'}
                    </td>
                    <td>
                      <input
                        type="number"
                        value={currentSale}
                        min={0}
                        style={{ width: 140 }}
                        onChange={(e) => setEditing((prev) => ({ ...prev, [p._id]: e.target.value }))}
                      />
                    </td>
                    <td className="action-cell">
                      <button className="btn-sm btn-primary" onClick={() => handleSave(p)}>Lưu</button>
                      {p.salePrice > 0 && (
                        <button className="btn-sm btn-danger" onClick={() => handleRemove(p)}>Xóa giảm</button>
                      )}
                    </td>
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

export default Discounts;
