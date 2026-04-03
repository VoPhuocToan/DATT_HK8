import { useEffect, useState } from 'react';
import api from '../services/api';

const fmt = (n) => Number(n || 0).toLocaleString('vi-VN') + ' đ';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
const imgUrl = (src) => {
  if (!src) return 'https://placehold.co/44';
  if (src.startsWith('http')) return src;
  return `${BASE_URL}/images${src.startsWith('/') ? src : '/' + src}`;
};

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
};

const getStatus = (s) => {
  const now = new Date();
  if (!s.isActive) return { label: 'Đã tắt',       color: '#64748b', bg: '#f1f5f9' };
  if (now < new Date(s.startTime)) return { label: 'Sắp diễn ra', color: '#d97706', bg: '#fef3c7' };
  if (now <= new Date(s.endTime))  return { label: '🟢 Đang chạy', color: '#059669', bg: '#d1fae5' };
  return { label: 'Đã kết thúc', color: '#dc2626', bg: '#fee2e2' };
};

const EMPTY_FORM = { name: '', startTime: '', endTime: '', isActive: true };

const FlashSalePage = () => {
  const [sessions, setSessions]       = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [view, setView]               = useState('list'); // 'list' | 'form'
  const [editSession, setEditSession] = useState(null);

  const [form, setForm]         = useState(EMPTY_FORM);
  const [items, setItems]       = useState([]);
  const [search, setSearch]     = useState('');
  const [saving, setSaving]     = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      let all = [];
      let page = 1;
      while (true) {
        const res = await api.get(`/products?limit=100&page=${page}&showHidden=true`);
        const data = res.data;
        all = all.concat(data.items || []);
        if (page >= (data.pages || 1)) break;
        page++;
      }
      setAllProducts(all);
    } catch (e) {
      console.error('Lỗi tải sản phẩm:', e);
    } finally {
      setLoadingProducts(false);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const sRes = await api.get('/flash-sale');
      setSessions(sRes.data || []);
    } finally {
      setLoading(false);
    }
    loadProducts();
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditSession(null);
    setForm(EMPTY_FORM);
    setItems([]);
    setSearch('');
    setView('form');
    if (allProducts.length === 0) loadProducts();
  };

  const openEdit = (s) => {
    setEditSession(s);
    setForm({
      name: s.name,
      startTime: toLocalInput(s.startTime),
      endTime: toLocalInput(s.endTime),
      isActive: s.isActive,
    });
    setItems((s.items || []).map((it) => ({
      productId: it.product?._id || it.product,
      productName: it.product?.name || '',
      productImage: it.product?.images?.[0] || '',
      productPrice: it.product?.price || 0,
      flashSalePrice: it.flashSalePrice,
      flashSaleStock: it.flashSaleStock,
    })));
    setSearch('');
    setView('form');
  };

  const goBack = () => { setView('list'); setEditSession(null); };

  const addProduct = (p) => {
    if (items.find((i) => i.productId === p._id)) return;
    setItems((prev) => [...prev, {
      productId: p._id,
      productName: p.name,
      productImage: p.images?.[0] || '',
      productPrice: p.price,
      flashSalePrice: p.salePrice > 0 ? p.salePrice : Math.round(p.price * 0.8),
      flashSaleStock: 50,
    }]);
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.productId !== id));

  const updateItem = (id, field, val) =>
    setItems((prev) => prev.map((i) => i.productId === id ? { ...i, [field]: Number(val) } : i));

  const handleSave = async () => {
    if (!form.name.trim() || !form.startTime || !form.endTime) {
      alert('Vui lòng điền đầy đủ tên và thời gian');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        isActive: form.isActive,
        items: items.map((i) => ({
          product: i.productId,
          flashSalePrice: i.flashSalePrice,
          flashSaleStock: i.flashSaleStock,
        })),
      };
      if (editSession) {
        await api.put(`/flash-sale/${editSession._id}`, payload);
      } else {
        await api.post('/flash-sale', payload);
      }
      goBack();
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Lỗi lưu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa đợt Flash Sale này?')) return;
    await api.delete(`/flash-sale/${id}`);
    load();
  };

  const handleToggle = async (s) => {
    await api.put(`/flash-sale/${s._id}`, { isActive: !s.isActive });
    load();
  };

  const addedIds = new Set(items.map((i) => i.productId));
  const filtered = allProducts.filter(
    (p) => !addedIds.has(p._id) && p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="page-loading">Đang tải...</div>;

  /* ════════════════════════════════
     VIEW: FORM (tạo / sửa)
  ════════════════════════════════ */
  if (view === 'form') {
    return (
      <div className="page">
        {/* Breadcrumb header */}
        <div className="fsadm-form-topbar">
          <button className="fsadm-back-btn" onClick={goBack}>← Quay lại</button>
          <h2 className="page-title" style={{ margin: 0 }}>
            {editSession ? '✏️ Chỉnh sửa đợt Flash Sale' : '⚡ Tạo đợt Flash Sale mới'}
          </h2>
        </div>

        <div className="fsadm-form-grid">
          {/* ── CỘT TRÁI: Thông tin + Sản phẩm đã chọn ── */}
          <div className="fsadm-col-left">

            {/* Card: Thông tin */}
            <div className="fsadm-card">
              <div className="fsadm-card-title">📋 Thông tin đợt Flash Sale</div>
              <div className="fsadm-field">
                <label>Tên đợt *</label>
                <input className="input" value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="VD: Flash Sale cuối tuần" />
              </div>
              <div className="fsadm-row2">
                <div className="fsadm-field">
                  <label>Thời gian bắt đầu *</label>
                  <input className="input" type="datetime-local" value={form.startTime}
                    onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} />
                </div>
                <div className="fsadm-field">
                  <label>Thời gian kết thúc *</label>
                  <input className="input" type="datetime-local" value={form.endTime}
                    onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} />
                </div>
              </div>
              <label className="fsadm-checkbox-label">
                <input type="checkbox" checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                <span>Kích hoạt — tự động hiển thị khi đến giờ bắt đầu</span>
              </label>
            </div>

            {/* Card: Sản phẩm đã chọn */}
            <div className="fsadm-card">
              <div className="fsadm-card-title">🛒 Sản phẩm trong đợt
                <span className="fsadm-badge-count">{items.length}</span>
              </div>

              {items.length === 0 ? (
                <div className="fsadm-empty-items">
                  <span>📦</span>
                  <p>Chưa có sản phẩm. Tìm và thêm từ danh sách bên phải.</p>
                </div>
              ) : (
                <div className="fsadm-items-table">
                  <div className="fsadm-items-head">
                    <span style={{ flex: 1 }}>Sản phẩm</span>
                    <span style={{ width: 120, textAlign: 'center' }}>Giá Flash Sale</span>
                    <span style={{ width: 90, textAlign: 'center' }}>Số suất</span>
                    <span style={{ width: 60, textAlign: 'center' }}>Giảm</span>
                    <span style={{ width: 32 }}></span>
                  </div>
                  {items.map((item) => {
                    const discount = item.productPrice > 0
                      ? Math.round((1 - item.flashSalePrice / item.productPrice) * 100) : 0;
                    return (
                      <div key={item.productId} className="fsadm-items-row">
                        <div className="fsadm-item-product">
                          <img src={imgUrl(item.productImage)} alt=""
                            className="fsadm-item-img" />
                          <div>
                            <div className="fsadm-item-name">{item.productName}</div>
                            <div className="fsadm-item-orig">Gốc: {fmt(item.productPrice)}</div>
                          </div>
                        </div>
                        <div style={{ width: 120 }}>
                          <input type="number" className="input input-center"
                            value={item.flashSalePrice}
                            onChange={(e) => updateItem(item.productId, 'flashSalePrice', e.target.value)} />
                        </div>
                        <div style={{ width: 90 }}>
                          <input type="number" className="input input-center"
                            value={item.flashSaleStock}
                            onChange={(e) => updateItem(item.productId, 'flashSaleStock', e.target.value)} />
                        </div>
                        <div style={{ width: 60, textAlign: 'center' }}>
                          {discount > 0
                            ? <span className="fsadm-pct">-{discount}%</span>
                            : <span style={{ color: '#cbd5e1' }}>—</span>}
                        </div>
                        <button className="fsadm-remove-btn" onClick={() => removeItem(item.productId)}>✕</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="fsadm-form-actions">
              <button className="fsadm-btn-cancel" onClick={goBack}>Hủy</button>
              <button className="fsadm-btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : editSession ? '💾 Cập nhật' : '⚡ Tạo đợt Flash Sale'}
              </button>
            </div>
          </div>

          {/* ── CỘT PHẢI: Tìm & thêm sản phẩm ── */}
          <div className="fsadm-col-right">
            <div className="fsadm-card fsadm-sticky">
              <div className="fsadm-card-title">🔍 Chọn sản phẩm</div>
              <input className="input" placeholder="Tìm theo tên sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)} />

              <div className="fsadm-product-list">
                {loadingProducts ? (
                  <div className="fsadm-no-result">Đang tải sản phẩm...</div>
                ) : filtered.length === 0 ? (
                  <div className="fsadm-no-result">
                    {search ? 'Không tìm thấy sản phẩm' : allProducts.length === 0 ? 'Không có sản phẩm nào' : 'Tất cả sản phẩm đã được thêm'}
                  </div>
                ) : (
                  filtered.slice(0, 50).map((p) => (
                    <div key={p._id} className="fsadm-product-row">
                      <img src={imgUrl(p.images?.[0])} alt=""
                        style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="fsadm-item-name">{p.name}</div>
                        <div className="fsadm-item-orig">{fmt(p.price)}</div>
                      </div>
                      <button className="fsadm-btn-add" onClick={() => addProduct(p)}>+ Thêm</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════
     VIEW: LIST
  ════════════════════════════════ */
  return (
    <div className="page">
      <div className="fsadm-list-topbar">
        <h2 className="page-title" style={{ margin: 0 }}>⚡ Quản lý Flash Sale</h2>
        <button className="fsadm-btn-create" onClick={openCreate}>+ Tạo đợt mới</button>
      </div>

      {sessions.length === 0 ? (
        <div className="fsadm-empty-page">
          <span style={{ fontSize: 52 }}>⚡</span>
          <p>Chưa có đợt Flash Sale nào</p>
          <button className="fsadm-btn-create" onClick={openCreate}>Tạo đợt đầu tiên</button>
        </div>
      ) : (
        <div className="fsadm-sessions-grid">
          {sessions.map((s) => {
            const st = getStatus(s);
            return (
              <div key={s._id} className="fsadm-session-card">
                {/* Header */}
                <div className="fsadm-sc-header">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="fsadm-sc-name">{s.name}</div>
                    <div className="fsadm-sc-time">
                      🕐 {fmtDate(s.startTime)} → {fmtDate(s.endTime)}
                    </div>
                  </div>
                  <span className="fsadm-status-tag" style={{ background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                </div>

                {/* Product thumbnails */}
                {s.items.length > 0 && (
                  <div className="fsadm-sc-thumbs">
                    {s.items.slice(0, 5).map((it, i) => {
                      const p = it.product;
                      if (!p) return null;
                      const disc = p.price > 0 ? Math.round((1 - it.flashSalePrice / p.price) * 100) : 0;
                      return (
                        <div key={i} className="fsadm-thumb">
                          <div style={{ position: 'relative' }}>
                            <img src={imgUrl(p.images?.[0])} alt=""
                              style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8 }} />
                            {disc > 0 && <span className="fsadm-thumb-badge">-{disc}%</span>}
                          </div>
                          <div className="fsadm-thumb-price">{fmt(it.flashSalePrice)}</div>
                        </div>
                      );
                    })}
                    {s.items.length > 5 && (
                      <div className="fsadm-thumb-more">+{s.items.length - 5}</div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="fsadm-sc-footer">
                  <span className="fsadm-count">{s.items.length} sản phẩm</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <label className="fsadm-toggle" title={s.isActive ? 'Tắt' : 'Bật'}>
                      <input type="checkbox" checked={s.isActive} onChange={() => handleToggle(s)} />
                      <span className="fsadm-toggle-track" />
                    </label>
                    <button className="fsadm-btn-edit" onClick={() => openEdit(s)}>✏️ Sửa</button>
                    <button className="fsadm-btn-del" onClick={() => handleDelete(s._id)}>🗑</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FlashSalePage;
