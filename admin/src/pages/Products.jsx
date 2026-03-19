import { useEffect, useState } from 'react';
import api from '../services/api';

const EMPTY = {
  name: '', slug: '', brand: '', category: '',
  shortDescription: '', description: '',
  price: 0, salePrice: 0, stock: 0,
  images: [''], isFeatured: false,
  specifications: { screen: '', chipset: '', ram: '', storage: '', battery: '', rearCamera: '', frontCamera: '', os: '' },
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (p = 1, kw = search) => {
    setLoading(true);
    const [{ data: pd }, { data: cd }] = await Promise.all([
      api.get(`/products?limit=10&page=${p}&keyword=${kw}`),
      api.get('/categories'),
    ]);
    setProducts(pd.items || []);
    setTotalPages(pd.pages || 1);
    setCategories(cd || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const setSpec = (field, val) => setForm((f) => ({ ...f, specifications: { ...f.specifications, [field]: val } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const payload = { ...form, images: form.images.filter(Boolean) };
      if (editId) {
        await api.put(`/products/${editId}`, payload);
        setMsg('Cập nhật thành công.');
      } else {
        await api.post('/products', payload);
        setMsg('Tạo sản phẩm thành công.');
      }
      setForm(EMPTY);
      setEditId(null);
      setShowForm(false);
      load(page);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Thao tác thất bại.');
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name, slug: product.slug, brand: product.brand,
      category: product.category?._id || product.category,
      shortDescription: product.shortDescription, description: product.description,
      price: product.price, salePrice: product.salePrice || 0, stock: product.stock,
      images: product.images?.length ? product.images : [''],
      isFeatured: product.isFeatured,
      specifications: { screen: '', chipset: '', ram: '', storage: '', battery: '', rearCamera: '', frontCamera: '', os: '', ...product.specifications },
    });
    setEditId(product._id);
    setShowForm(true);
    setMsg('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    await api.delete(`/products/${id}`);
    load(page);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, search);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Sản phẩm</h2>
        <button className="btn-primary" onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true); setMsg(''); }}>
          + Thêm sản phẩm
        </button>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input placeholder="Tìm kiếm sản phẩm..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="submit" className="btn-primary">Tìm</button>
      </form>

      {msg && <p className={msg.includes('thành công') ? 'success-msg' : 'error-msg'}>{msg}</p>}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
              <button className="btn-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="field"><label>Tên sản phẩm *</label><input value={form.name} onChange={(e) => set('name', e.target.value)} required /></div>
              <div className="field"><label>Slug *</label><input value={form.slug} onChange={(e) => set('slug', e.target.value)} required /></div>
              <div className="field"><label>Thương hiệu *</label><input value={form.brand} onChange={(e) => set('brand', e.target.value)} required /></div>
              <div className="field">
                <label>Danh mục *</label>
                <select value={form.category} onChange={(e) => set('category', e.target.value)} required>
                  <option value="">Chọn danh mục</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="field"><label>Giá *</label><input type="number" value={form.price} onChange={(e) => set('price', Number(e.target.value))} required /></div>
              <div className="field"><label>Giá khuyến mãi</label><input type="number" value={form.salePrice} onChange={(e) => set('salePrice', Number(e.target.value))} /></div>
              <div className="field"><label>Tồn kho *</label><input type="number" value={form.stock} onChange={(e) => set('stock', Number(e.target.value))} required /></div>
              <div className="field"><label>Ảnh (URL)</label><input value={form.images[0]} onChange={(e) => set('images', [e.target.value])} /></div>
              <div className="field full"><label>Mô tả ngắn *</label><input value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} required /></div>
              <div className="field full"><label>Mô tả chi tiết *</label><textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} required /></div>

              <div className="field full">
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} />
                  Sản phẩm nổi bật
                </label>
              </div>

              <div className="field full spec-section">
                <label className="section-label">Thông số kỹ thuật</label>
                <div className="form-grid">
                  {['screen', 'chipset', 'ram', 'storage', 'battery', 'rearCamera', 'frontCamera', 'os'].map((k) => (
                    <div className="field" key={k}>
                      <label>{k}</label>
                      <input value={form.specifications[k]} onChange={(e) => setSpec(k, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="field full modal-actions">
                <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="btn-primary">{editId ? 'Cập nhật' : 'Tạo sản phẩm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? <div className="page-loading">Đang tải...</div> : (
          <table className="table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Nổi bật</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td><img src={p.images?.[0] || 'https://placehold.co/48'} alt={p.name} className="product-thumb" /></td>
                  <td>{p.name}</td>
                  <td>{p.category?.name || '—'}</td>
                  <td>{Number(p.price).toLocaleString('vi-VN')}đ</td>
                  <td>{p.stock}</td>
                  <td>{p.isFeatured ? '✅' : '—'}</td>
                  <td className="action-cell">
                    <button className="btn-sm btn-outline" onClick={() => handleEdit(p)}>Sửa</button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(p._id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => { setPage(page - 1); load(page - 1); }} className="btn-outline btn-sm">← Trước</button>
          <span>Trang {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => { setPage(page + 1); load(page + 1); }} className="btn-outline btn-sm">Sau →</button>
        </div>
      </div>
    </div>
  );
};

export default Products;
