import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';

const EMPTY_SPECS = {
  screen: '', chipset: '', ram: '', storage: '',
  battery: '', rearCamera: '', frontCamera: '', os: '',
};

const EMPTY = {
  name: '', slug: '', brand: '', category: '',
  shortDescription: '', description: '',
  price: 0, salePrice: 0, stock: 0,
  images: [],
  mainImageIndex: 0,
  colors: [],
  storageOptions: [],
  specifications: { ...EMPTY_SPECS },
};

const PRICE_RANGES = [
  { label: 'Tất cả', min: 0, max: Infinity },
  { label: 'Dưới 500K', min: 0, max: 500000 },
  { label: '500K – 2 triệu', min: 500000, max: 2000000 },
  { label: '2 – 10 triệu', min: 2000000, max: 10000000 },
  { label: '10 – 30 triệu', min: 10000000, max: 30000000 },
  { label: 'Trên 30 triệu', min: 30000000, max: Infinity },
];

const PAGE_SIZE = 10;

const RAM_OPTIONS = ['2GB', '4GB', '6GB', '8GB', '12GB', '16GB', '32GB'];
const ROM_OPTIONS = ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];

const StoragePicker = ({ onAdd }) => {
  const [ram, setRam] = useState('');
  const [rom, setRom] = useState('');
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
      <select value={ram} onChange={(e) => setRam(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }}>
        <option value="">RAM (tuỳ chọn)</option>
        {RAM_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <select value={rom} onChange={(e) => setRom(e.target.value)} style={{ padding: '6px 10px', borderRadius: 6, border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }}>
        <option value="">ROM *</option>
        {ROM_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <button
        type="button"
        className="variant-add-btn"
        onClick={() => {
          if (!rom) return;
          onAdd({ ram, rom });
          setRam(''); setRom('');
        }}
      >+ Thêm</button>
    </div>
  );
};

const Products = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [uploadedImages, setUploadedImages] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterPrice, setFilterPrice] = useState(0);
  const [filterStock, setFilterStock] = useState('all'); // all | instock | outstock
  const [filterVisible, setFilterVisible] = useState('all'); // all | visible | hidden

  const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  const load = async () => {
    setLoading(true);
    const [{ data: pd }, { data: cd }] = await Promise.all([
      api.get('/products?limit=500&showHidden=true'),
      api.get('/categories'),
    ]);
    setAllProducts(pd.items || []);
    setCategories(cd || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Danh sách brand duy nhất
  const brands = useMemo(() => [...new Set(allProducts.map((p) => p.brand).filter(Boolean))].sort(), [allProducts]);

  // Lọc client-side
  const filtered = useMemo(() => {
    const pr = PRICE_RANGES[filterPrice];
    return allProducts.filter((p) => {
      const price = p.salePrice > 0 ? p.salePrice : p.price;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCategory && p.category?._id !== filterCategory) return false;
      if (filterBrand && p.brand !== filterBrand) return false;
      if (price < pr.min || price > pr.max) return false;
      if (filterStock === 'instock' && p.stock <= 0) return false;
      if (filterStock === 'outstock' && p.stock > 0) return false;
      if (filterVisible === 'visible' && p.isVisible === false) return false;
      if (filterVisible === 'hidden' && p.isVisible !== false) return false;
      return true;
    });
  }, [allProducts, search, filterCategory, filterBrand, filterPrice, filterStock, filterVisible]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilter = search || filterCategory || filterBrand || filterPrice > 0 || filterStock !== 'all' || filterVisible !== 'all';

  const resetFilters = () => {
    setSearch(''); setFilterCategory(''); setFilterBrand('');
    setFilterPrice(0); setFilterStock('all'); setFilterVisible('all');
    setPage(1);
  };

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const setSpec = (field, val) => setForm((f) => ({ ...f, specifications: { ...f.specifications, [field]: val } }));

  const handleImageUpload = async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await api.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newImages = [...form.images, ...response.data.filenames];
      setForm(f => ({ ...f, images: newImages }));
      setUploadedImages(prev => [...prev, ...response.data.filenames]);
    } catch (error) {
      setMsg('Lỗi upload ảnh: ' + (error.response?.data?.message || error.message));
    }
  };

  const removeImage = (index) => {
    const newImages = form.images.filter((_, i) => i !== index);
    setForm(f => ({ 
      ...f, 
      images: newImages,
      mainImageIndex: f.mainImageIndex >= newImages.length ? 0 : f.mainImageIndex
    }));
  };

  const setMainImage = (index) => {
    setForm(f => ({ ...f, mainImageIndex: index }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const payload = { 
        ...form, 
        images: form.images.filter(Boolean),
        mainImageIndex: form.mainImageIndex || 0
      };
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
      setUploadedImages([]);
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Thao tác thất bại.');
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name, 
      slug: product.slug, 
      brand: product.brand,
      category: product.category?._id || product.category,
      shortDescription: product.shortDescription, 
      description: product.description,
      price: product.price, 
      salePrice: product.salePrice || 0, 
      stock: product.stock,
      images: product.images?.length ? product.images : [],
      mainImageIndex: product.mainImageIndex || 0,
      colors: product.colors || [],
      storageOptions: (product.storageOptions || []).map(s =>
        typeof s === 'string' ? { ram: '', rom: s } : { ram: s.ram || '', rom: s.rom || '' }
      ),
      specifications: { ...EMPTY_SPECS, ...(product.specifications || {}) },
    });
    setEditId(product._id); 
    setShowForm(true); 
    setMsg('');
    setUploadedImages([]);
  };

  const handleToggleVisibility = async (id) => {
    await api.patch(`/products/${id}/visibility`);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Sản phẩm</h2>
        <button className="btn-primary" onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true); setMsg(''); setUploadedImages([]); }}>
          + Thêm sản phẩm
        </button>
      </div>

      {msg && <p className={msg.includes('thành công') ? 'success-msg' : 'error-msg'}>{msg}</p>}

      {/* ── Bộ lọc ── */}
      <div className="pf-bar">
        {/* Tìm kiếm */}
        <div className="pf-search">
          <input
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="pf-divider" />

        {/* Danh mục */}
        <select className={`pf-select ${filterCategory ? 'active' : ''}`} value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}>
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        {/* Hãng */}
        <select className={`pf-select ${filterBrand ? 'active' : ''}`} value={filterBrand} onChange={(e) => { setFilterBrand(e.target.value); setPage(1); }}>
          <option value="">Tất cả hãng</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>

        {/* Giá */}
        <select className={`pf-select ${filterPrice > 0 ? 'active' : ''}`} value={filterPrice} onChange={(e) => { setFilterPrice(Number(e.target.value)); setPage(1); }}>
          {PRICE_RANGES.map((pr, i) => <option key={i} value={i}>{pr.label}</option>)}
        </select>

        {/* Tồn kho */}
        <select className={`pf-select ${filterStock !== 'all' ? 'active' : ''}`} value={filterStock} onChange={(e) => { setFilterStock(e.target.value); setPage(1); }}>
          <option value="all">Tất cả tồn kho</option>
          <option value="instock">Còn hàng</option>
          <option value="outstock">Hết hàng</option>
        </select>

        {/* Hiển thị */}
        <select className={`pf-select ${filterVisible !== 'all' ? 'active' : ''}`} value={filterVisible} onChange={(e) => { setFilterVisible(e.target.value); setPage(1); }}>
          <option value="all">Tất cả trạng thái</option>
          <option value="visible">Đang hiện</option>
          <option value="hidden">Đang ẩn</option>
        </select>

        {hasFilter && (
          <button className="pf-reset" onClick={resetFilters}>✕ Xóa lọc</button>
        )}
      </div>

      {/* Kết quả */}
      <div className="pf-result-info">
        Hiển thị <strong>{filtered.length}</strong> / {allProducts.length} sản phẩm
        {hasFilter && <span className="pf-active-badge">Đang lọc</span>}
      </div>

      {/* ── Modal form ── */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
              <button className="btn-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="field">
                <label>Tên sản phẩm *</label>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} required />
              </div>
              <div className="field">
                <label>Slug *</label>
                <input value={form.slug} onChange={(e) => set('slug', e.target.value)} required />
              </div>
              <div className="field">
                <label>Thương hiệu *</label>
                <input value={form.brand} onChange={(e) => set('brand', e.target.value)} required />
              </div>
              <div className="field">
                <label>Danh mục *</label>
                <select value={form.category} onChange={(e) => set('category', e.target.value)} required>
                  <option value="">Chọn danh mục</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Giá *</label>
                <input type="number" value={form.price} onChange={(e) => set('price', Number(e.target.value))} required />
              </div>
              <div className="field">
                <label>Giá khuyến mãi</label>
                <input type="number" value={form.salePrice} onChange={(e) => set('salePrice', Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Tồn kho *</label>
                <input type="number" value={form.stock} onChange={(e) => set('stock', Number(e.target.value))} required />
              </div>
              
              {/* Upload ảnh */}
              <div className="field full">
                <label>Hình ảnh sản phẩm</label>
                <div className="image-upload-section">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    style={{ marginBottom: '10px' }}
                  />
                  
                  {form.images.length > 0 && (
                    <div className="image-preview-grid">
                      {form.images.map((image, index) => (
                        <div key={index} className="image-preview-item">
                          <img
                            src={`${BACKEND_URL}/images${image}`}
                            alt={`Preview ${index + 1}`}
                            className="preview-image"
                          />
                          <div className="image-controls">
                            <button
                              type="button"
                              className={`btn-sm ${form.mainImageIndex === index ? 'btn-primary' : 'btn-outline'}`}
                              onClick={() => setMainImage(index)}
                            >
                              {form.mainImageIndex === index ? 'Ảnh chính' : 'Chọn làm ảnh chính'}
                            </button>
                            <button
                              type="button"
                              className="btn-sm btn-danger"
                              onClick={() => removeImage(index)}
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Màu sắc & Bộ nhớ */}
              <div className="field full">
                <label style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: 6, marginBottom: 4 }}>
                  Biến thể sản phẩm
                </label>
              </div>

              {/* Màu sắc */}
              <div className="field full">
                <label style={{ fontWeight: 500 }}>Màu sắc</label>
                <div className="variant-tag-list">
                  {form.colors.map((c, i) => (
                    <span key={i} className="variant-tag">
                      {c}
                      <button type="button" className="variant-tag-remove" onClick={() => set('colors', form.colors.filter((_, idx) => idx !== i))}>✕</button>
                    </span>
                  ))}
                  <button type="button" className="variant-add-btn" onClick={() => {
                    const val = prompt('Nhập tên màu sắc:');
                    if (val?.trim()) set('colors', [...form.colors, val.trim()]);
                  }}>+ Thêm</button>
                </div>
              </div>

              {/* Bộ nhớ (RAM + ROM) */}
              <div className="field full">
                <label style={{ fontWeight: 500 }}>Tùy chọn bộ nhớ (RAM + ROM)</label>
                <div className="variant-storage-list">
                  {form.storageOptions.map((s, i) => (
                    <span key={i} className="variant-tag">
                      {s.ram ? `${s.ram}/${s.rom}` : s.rom}
                      <button type="button" className="variant-tag-remove" onClick={() => set('storageOptions', form.storageOptions.filter((_, idx) => idx !== i))}>✕</button>
                    </span>
                  ))}
                </div>
                <div className="variant-storage-picker">
                  <StoragePicker onAdd={(opt) => set('storageOptions', [...form.storageOptions, opt])} />
                </div>
              </div>

              {/* Thông số kỹ thuật */}
              <div className="field full">
                <label style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: 6, marginBottom: 4 }}>
                  Thông số kỹ thuật
                </label>
              </div>
              <div className="field">
                <label>Màn hình</label>
                <input placeholder="VD: 6.1 inches OLED" value={form.specifications.screen} onChange={(e) => setSpec('screen', e.target.value)} />
              </div>
              <div className="field">
                <label>Chipset</label>
                <input placeholder="VD: Apple A18 Pro" value={form.specifications.chipset} onChange={(e) => setSpec('chipset', e.target.value)} />
              </div>
              <div className="field">
                <label>RAM</label>
                <input placeholder="VD: 8 GB" value={form.specifications.ram} onChange={(e) => setSpec('ram', e.target.value)} />
              </div>
              <div className="field">
                <label>Bộ nhớ trong</label>
                <input placeholder="VD: 128 GB" value={form.specifications.storage} onChange={(e) => setSpec('storage', e.target.value)} />
              </div>
              <div className="field">
                <label>Pin</label>
                <input placeholder="VD: 4000 mAh" value={form.specifications.battery} onChange={(e) => setSpec('battery', e.target.value)} />
              </div>
              <div className="field">
                <label>Camera sau</label>
                <input placeholder="VD: 48 MP + 12 MP" value={form.specifications.rearCamera} onChange={(e) => setSpec('rearCamera', e.target.value)} />
              </div>
              <div className="field">
                <label>Camera trước</label>
                <input placeholder="VD: 12 MP" value={form.specifications.frontCamera} onChange={(e) => setSpec('frontCamera', e.target.value)} />
              </div>
              <div className="field">
                <label>Hệ điều hành</label>
                <input placeholder="VD: iOS 18" value={form.specifications.os} onChange={(e) => setSpec('os', e.target.value)} />
              </div>

              <div className="field full">
                <label>Mô tả ngắn *</label>
                <input value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} required />
              </div>
              <div className="field full">
                <label>Mô tả chi tiết *</label>
                <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} required />
              </div>
              
              <div className="field full modal-actions">
                <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="btn-primary">{editId ? 'Cập nhật' : 'Tạo sản phẩm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Bảng sản phẩm ── */}
      <div className="card">
        {loading ? <div className="page-loading">Đang tải...</div> : (
          <table className="table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Hãng</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Hiển thị</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Không tìm thấy sản phẩm phù hợp</td></tr>
              ) : paginated.map((p) => (
                <tr key={p._id} style={{ opacity: p.isVisible === false ? 0.5 : 1 }}>
                  <td>
                    <img
                      src={p.images?.[p.mainImageIndex || 0] ? `${BACKEND_URL}/images${p.images[p.mainImageIndex || 0]}` : 'https://placehold.co/48'}
                      alt={p.name}
                      className="product-thumb"
                      onError={(e) => { e.target.src = 'https://placehold.co/48'; }}
                    />
                  </td>
                  <td style={{ maxWidth: 220 }}>{p.name}</td>
                  <td>{p.category?.name || '—'}</td>
                  <td>{p.brand}</td>
                  <td>{Number(p.price).toLocaleString('vi-VN')}đ</td>
                  <td>
                    <span style={{ color: p.stock <= 0 ? '#e53e3e' : p.stock < 10 ? '#f59e0b' : '#16a34a', fontWeight: 600 }}>
                      {p.stock <= 0 ? 'Hết hàng' : p.stock}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn-sm ${p.isVisible === false ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => handleToggleVisibility(p._id)}
                      title={p.isVisible === false ? 'Đang ẩn – nhấn để hiện' : 'Đang hiện – nhấn để ẩn'}
                    >
                      {p.isVisible === false ? '🙈 Ẩn' : '👁 Hiện'}
                    </button>
                  </td>
                  <td>
                    <div className="action-cell">
                      <button className="btn-sm btn-outline" onClick={() => handleEdit(p)}>Sửa</button>
                      <button className="btn-sm btn-danger" onClick={() => handleDelete(p._id)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
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

export default Products;
