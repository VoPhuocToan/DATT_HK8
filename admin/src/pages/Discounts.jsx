import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';

const PRICE_RANGES = [
  { label: 'Tất cả giá', min: 0, max: Infinity },
  { label: 'Dưới 500K', min: 0, max: 500000 },
  { label: '500K – 2 triệu', min: 500000, max: 2000000 },
  { label: '2 – 10 triệu', min: 2000000, max: 10000000 },
  { label: '10 – 30 triệu', min: 10000000, max: 30000000 },
  { label: 'Trên 30 triệu', min: 30000000, max: Infinity },
];

const PAGE_SIZE = 10;

const Discounts = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({});
  const [msg, setMsg] = useState('');
  const [page, setPage] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterPrice, setFilterPrice] = useState(0);

  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

  const load = async () => {
    setLoading(true);
    const [{ data: pd }, { data: cd }] = await Promise.all([
      api.get('/products?limit=500&showHidden=true'),
      api.get('/categories'),
    ]);
    // Chỉ giữ sản phẩm đang giảm giá VÀ còn hàng
    const discountedInStock = (pd.items || []).filter((p) => p.salePrice > 0 && p.stock > 0);
    setAllProducts(discountedInStock);
    setCategories(cd || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const brands = useMemo(() => [...new Set(allProducts.map((p) => p.brand).filter(Boolean))].sort(), [allProducts]);

  const filtered = useMemo(() => {
    const pr = PRICE_RANGES[filterPrice];
    return allProducts.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCategory && p.category?._id !== filterCategory) return false;
      if (filterBrand && p.brand !== filterBrand) return false;
      if (p.price < pr.min || p.price > pr.max) return false;
      return true;
    });
  }, [allProducts, search, filterCategory, filterBrand, filterPrice]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const discountedCount = allProducts.length;
  const hasFilter = search || filterCategory || filterBrand || filterPrice > 0;

  const resetFilters = () => {
    setSearch(''); setFilterCategory(''); setFilterBrand('');
    setFilterPrice(0); setPage(1);
  };

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

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Giảm giá</h2>
        <span className="badge" style={{ background: '#fef3c7', color: '#d97706', padding: '6px 14px', borderRadius: 20, fontSize: 13 }}>
          {discountedCount} sản phẩm đang giảm
        </span>
      </div>

      {msg && <p className={msg.includes('thất bại') ? 'error-msg' : 'success-msg'}>{msg}</p>}

      {/* ── Bộ lọc ── */}
      <div className="pf-bar">
        <div className="pf-search">
          <input
            placeholder="Tìm sản phẩm..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="pf-divider" />

        <select className={`pf-select ${filterCategory ? 'active' : ''}`} value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}>
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        <select className={`pf-select ${filterBrand ? 'active' : ''}`} value={filterBrand} onChange={(e) => { setFilterBrand(e.target.value); setPage(1); }}>
          <option value="">Tất cả hãng</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>

        <select className={`pf-select ${filterPrice > 0 ? 'active' : ''}`} value={filterPrice} onChange={(e) => { setFilterPrice(Number(e.target.value)); setPage(1); }}>
          {PRICE_RANGES.map((pr, i) => <option key={i} value={i}>{pr.label}</option>)}
        </select>

        {hasFilter && (
          <button className="pf-reset" onClick={resetFilters}>✕ Xóa lọc</button>
        )}
      </div>

      <div className="pf-result-info">
        Hiển thị <strong>{filtered.length}</strong> / {allProducts.length} sản phẩm
        {hasFilter && <span className="pf-active-badge">Đang lọc</span>}
      </div>

      {/* ── Bảng ── */}
      <div className="card">
        {loading ? <div className="page-loading">Đang tải...</div> : (
          <table className="table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá gốc</th>
                <th>Giá giảm</th>
                <th>% Giảm</th>
                <th>Cập nhật giảm giá</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Không tìm thấy sản phẩm phù hợp</td></tr>
              ) : paginated.map((p) => {
                const currentSale = editing[p._id] !== undefined ? editing[p._id] : p.salePrice;
                const pct = p.price > 0 && p.salePrice > 0
                  ? Math.round((1 - p.salePrice / p.price) * 100) : 0;
                return (
                  <tr key={p._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src={p.images?.[0] ? `${FRONTEND_URL}${p.images[0]}` : 'https://placehold.co/44'}
                          alt={p.name}
                          className="product-thumb"
                          onError={(e) => { e.target.src = 'https://placehold.co/44'; }}
                        />
                        <span style={{ fontWeight: 500 }}>{p.name}</span>
                      </div>
                    </td>
                    <td>{p.category?.name || '—'}</td>
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
                        style={{ width: 130 }}
                        onChange={(e) => setEditing((prev) => ({ ...prev, [p._id]: e.target.value }))}
                      />
                    </td>
                    <td>
                      <div className="action-cell">
                        <button className="btn-sm btn-primary" onClick={() => handleSave(p)}>Lưu</button>
                        {p.salePrice > 0 && (
                          <button className="btn-sm btn-danger" onClick={() => handleRemove(p)}>Xóa giảm</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-outline btn-sm">← Trước</button>
          <span>Trang {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn-outline btn-sm">Sau →</button>
        </div>
      </div>
    </div>
  );
};

export default Discounts;
