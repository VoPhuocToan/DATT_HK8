import { useEffect, useState } from 'react';
import api from '../services/api';
import { IconEdit, IconTrash, IconImage, IconSettings, IconUpload } from '../components/Icons';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
const imgUrl = (src) => {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${BASE_URL}/images/${src.replace(/^\//, '')}`;
};

const EMPTY = {
  badge: '', title: '', subtitle: '', ctaText: 'Mua ngay', ctaLink: '/',
  image: '', bgFrom: '#ffe0ef', bgTo: '#f8f2ff', active: true, order: 0,
};

const BannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/banners?all=true');
      setBanners(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setView('form'); };
  const openEdit = (b) => { setEditing(b); setForm({ ...EMPTY, ...b }); setView('form'); };
  const goBack = () => { setView('list'); setEditing(null); setUploadMsg(''); };

  const handleImageUpload = async (files) => {
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append('images', f));
    setUploadMsg('Đang upload...');
    try {
      const { data } = await api.post('/upload/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (!data.filenames?.length) { setUploadMsg('Upload thất bại'); return; }
      setUploadMsg('Upload thành công');
      setForm((p) => ({ ...p, image: data.filenames[0] }));
    } catch (e) {
      setUploadMsg('Lỗi: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return alert('Vui lòng nhập tiêu đề');
    setSaving(true);
    try {
      if (editing) await api.put(`/banners/${editing._id}`, form);
      else await api.post('/banners', form);
      goBack(); load();
    } catch (e) { alert(e.response?.data?.message || 'Lỗi lưu'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa banner này?')) return;
    await api.delete(`/banners/${id}`);
    load();
  };

  const handleToggleActive = async (b) => {
    await api.put(`/banners/${b._id}`, { active: !b.active });
    load();
  };

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  if (loading) return <div className="page-loading">Đang tải...</div>;

  /* ── FORM ── */
  if (view === 'form') return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#64748b' }}>← Quay lại</button>
        <h2 className="page-title" style={{ margin: 0 }}>
          <IconImage size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {editing ? 'Chỉnh sửa banner' : 'Tạo banner mới'}
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Cột trái — Preview + nội dung */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Preview live */}
          <div className="fsadm-card">
            <div className="fsadm-card-title">👁 Xem trước</div>
            <div style={{
              background: `linear-gradient(135deg, ${form.bgFrom} 0%, ${form.bgTo} 100%)`,
              borderRadius: 12, padding: '24px 28px', display: 'flex',
              alignItems: 'center', justifyContent: 'space-between', gap: 16, minHeight: 140,
            }}>
              <div>
                {form.badge && <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', background: 'rgba(255,255,255,0.55)', borderRadius: 20, padding: '2px 10px', display: 'inline-block', marginBottom: 8 }}>{form.badge}</p>}
                <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>{form.title || 'Tiêu đề banner'}</div>
                {form.subtitle && <div style={{ fontSize: 13, color: '#475569' }}>{form.subtitle}</div>}
                <div style={{ marginTop: 12, display: 'inline-block', background: '#facc15', color: '#1e293b', fontWeight: 700, padding: '7px 18px', borderRadius: 8, fontSize: 13 }}>{form.ctaText || 'Mua ngay'}</div>
              </div>
              {form.image
                ? <img src={imgUrl(form.image)} alt="" style={{ maxHeight: 110, maxWidth: 200, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }} />
                : <div style={{ width: 180, height: 110, borderRadius: 12, background: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 12 }}>Chưa có ảnh</div>
              }
            </div>
          </div>

          {/* Nội dung */}
          <div className="fsadm-card">
            <div className="fsadm-card-title"><IconSettings size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />Nội dung</div>
            <div className="fsadm-field">
              <label>Badge (dòng nhỏ phía trên)</label>
              <input className="input" value={form.badge} onChange={f('badge')} placeholder="VD: danganhshop x mùa sale tháng 3" />
            </div>
            <div className="fsadm-field">
              <label>Tiêu đề *</label>
              <input className="input" value={form.title} onChange={f('title')} placeholder="VD: iPhone 17e" />
            </div>
            <div className="fsadm-field">
              <label>Mô tả</label>
              <input className="input" value={form.subtitle} onChange={f('subtitle')} placeholder="VD: Đủ tính năng. Đầy giá trị. Chỉ từ 17.990.000đ" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="fsadm-field">
                <label>Nút CTA</label>
                <input className="input" value={form.ctaText} onChange={f('ctaText')} placeholder="Mua ngay" />
              </div>
              <div className="fsadm-field">
                <label>Link CTA</label>
                <input className="input" value={form.ctaLink} onChange={f('ctaLink')} placeholder="/dien-thoai" />
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải — Ảnh + màu + cài đặt */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="fsadm-card">
            <div className="fsadm-card-title"><IconImage size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />Ảnh sản phẩm</div>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files)} style={{ fontSize: 13 }} />
            {uploadMsg && <div style={{ fontSize: 12, color: uploadMsg.startsWith('Lỗi') ? '#dc2626' : '#16a34a', marginTop: 6 }}>{uploadMsg}</div>}
            {form.image && (
              <div style={{ marginTop: 10, position: 'relative', display: 'inline-block' }}>
                <img src={imgUrl(form.image)} alt="" style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <button onClick={() => setForm((p) => ({ ...p, image: '' }))}
                  style={{ position: 'absolute', top: -6, right: -6, background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
            )}
            <div className="fsadm-field" style={{ marginTop: 12 }}>
              <label>Hoặc nhập URL ảnh</label>
              <input className="input" value={form.image} onChange={f('image')} placeholder="https://... hoặc tên file" />
            </div>
          </div>

          <div className="fsadm-card">
            <div className="fsadm-card-title">🎨 Màu nền</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="fsadm-field">
                <label>Màu bắt đầu</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={form.bgFrom} onChange={f('bgFrom')} style={{ width: 40, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
                  <input className="input" value={form.bgFrom} onChange={f('bgFrom')} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                </div>
              </div>
              <div className="fsadm-field">
                <label>Màu kết thúc</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={form.bgTo} onChange={f('bgTo')} style={{ width: 40, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
                  <input className="input" value={form.bgTo} onChange={f('bgTo')} style={{ flex: 1, fontFamily: 'monospace', fontSize: 12 }} />
                </div>
              </div>
            </div>
            {/* Preset màu */}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Preset màu nhanh:</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  ['#ffe0ef','#f8f2ff'],['#dbeafe','#eff6ff'],['#dcfce7','#f0fdf4'],
                  ['#fef3c7','#fffbeb'],['#fce7f3','#fdf2f8'],['#e0e7ff','#eef2ff'],
                ].map(([from, to]) => (
                  <button key={from} onClick={() => setForm((p) => ({ ...p, bgFrom: from, bgTo: to }))}
                    style={{ width: 32, height: 22, borderRadius: 6, border: form.bgFrom === from ? '2px solid #2563eb' : '1px solid #e2e8f0', cursor: 'pointer', background: `linear-gradient(135deg, ${from}, ${to})`, padding: 0 }}
                    title={`${from} → ${to}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="fsadm-card">
            <div className="fsadm-card-title"><IconSettings size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />Cài đặt</div>
            <div className="fsadm-field">
              <label>Thứ tự hiển thị</label>
              <input className="input" type="number" value={form.order} onChange={f('order')} min={0} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', marginTop: 8 }}>
              <input type="checkbox" checked={form.active} onChange={f('active')} />
              Hiển thị banner
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={goBack} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Hủy</button>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 2, padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
              <IconUpload size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Tạo banner'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── LIST ── */
  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 className="page-title" style={{ margin: 0 }}>
          <IconImage size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Quản lý Banner quảng cáo
        </h2>
        <button onClick={openCreate} className="fsadm-btn-create">+ Tạo banner</button>
      </div>

      {banners.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          <IconImage size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div>Chưa có banner nào. Tạo banner đầu tiên!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {banners.map((b) => (
            <div key={b._id} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', display: 'flex', gap: 16, alignItems: 'center' }}>
              {/* Mini preview */}
              <div style={{
                width: 160, height: 80, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
                background: `linear-gradient(135deg, ${b.bgFrom} 0%, ${b.bgTo} 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>{b.title}</div>
                  {b.subtitle && <div style={{ fontSize: 9, color: '#64748b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80 }}>{b.subtitle}</div>}
                </div>
                {b.image && <img src={imgUrl(b.image)} alt="" style={{ height: 56, maxWidth: 60, objectFit: 'contain', flexShrink: 0 }} />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: b.active ? '#dcfce7' : '#f1f5f9', color: b.active ? '#16a34a' : '#64748b' }}>
                    {b.active ? '✓ Đang hiển thị' : '○ Ẩn'}
                  </span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Thứ tự: {b.order}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 2 }}>{b.title}</div>
                {b.badge && <div style={{ fontSize: 12, color: '#64748b' }}>{b.badge}</div>}
                {b.subtitle && <div style={{ fontSize: 12, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.subtitle}</div>}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                  CTA: <span style={{ color: '#2563eb' }}>{b.ctaText}</span> → {b.ctaLink}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <label style={{ cursor: 'pointer' }} title={b.active ? 'Ẩn' : 'Hiển thị'}>
                  <input type="checkbox" checked={b.active} onChange={() => handleToggleActive(b)} style={{ cursor: 'pointer' }} />
                </label>
                <button onClick={() => openEdit(b)} style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                  <IconEdit size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Sửa
                </button>
                <button onClick={() => handleDelete(b._id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16 }}>
                  <IconTrash size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BannersPage;
