import { useEffect, useState } from 'react';
import api from '../services/api';
import { IconEdit, IconTrash, IconFileText, IconImage, IconSettings, IconUpload } from '../components/Icons';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
const imgUrl = (src) => {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  // Tất cả ảnh serve qua backend /images/
  const filename = src.replace(/^\//, '');
  return `${BASE_URL}/images/${filename}`;
};

const CATEGORIES = ['Tin tức', 'Đánh giá', 'Mở hộp', 'Cận cảnh', 'Thủ thuật'];

const EMPTY = { title: '', category: 'Tin tức', excerpt: '', content: '', img: '', images: [], mainImageIndex: 0, author: 'Đặng Anh', readTime: '', featured: false, published: true };

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // list | form
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [uploadMsg, setUploadMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/articles?all=true');
      setArticles(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setView('form'); };
  const openEdit = (a) => {
    const images = a.images?.length ? a.images : (a.img ? [a.img] : []);
    const mainImageIndex = a.mainImageIndex || 0;
    setEditing(a);
    setForm({
      title: a.title, category: a.category, excerpt: a.excerpt, content: a.content,
      img: images[mainImageIndex] || a.img || '',
      images,
      mainImageIndex,
      author: a.author, readTime: a.readTime || '', featured: a.featured, published: a.published
    });
    setView('form');
  };
  const goBack = () => { setView('list'); setEditing(null); setUploadMsg(''); };

  const handleImageUpload = async (files) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('images', file));
    setUploadMsg('Đang upload...');
    try {
      const { data } = await api.post('/upload/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (!data.filenames || data.filenames.length === 0) {
        setUploadMsg('Upload thất bại: không nhận được tên file');
        return;
      }
      setUploadMsg(`Upload thành công ${data.filenames.length} ảnh`);
      setForm((p) => {
        const newImages = [...p.images, ...data.filenames];
        const mainIdx = p.mainImageIndex < newImages.length ? p.mainImageIndex : 0;
        return { ...p, images: newImages, mainImageIndex: mainIdx, img: newImages[mainIdx] };
      });
    } catch (e) {
      setUploadMsg('Lỗi upload: ' + (e.response?.data?.message || e.message));
    }
  };

  const removeImage = (index) => {
    setForm((p) => {
      const newImages = p.images.filter((_, i) => i !== index);
      const newIdx = p.mainImageIndex >= newImages.length ? Math.max(0, newImages.length - 1) : p.mainImageIndex;
      return { ...p, images: newImages, mainImageIndex: newIdx, img: newImages[newIdx] || '' };
    });
  };

  const setMainImage = (index) => setForm((p) => ({ ...p, mainImageIndex: index, img: p.images[index] || p.img }));

  const handleSave = async () => {
    if (!form.title.trim()) return alert('Vui lòng nhập tiêu đề');
    setSaving(true);
    try {
      // Đảm bảo img luôn sync với images[mainImageIndex]
      const payload = { ...form, img: form.images[form.mainImageIndex] || form.img || '' };
      if (editing) await api.put(`/articles/${editing._id}`, payload);
      else await api.post('/articles', payload);
      goBack(); load();
    } catch (e) { alert(e.response?.data?.message || 'Lỗi lưu'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa bài viết này?')) return;
    await api.delete(`/articles/${id}`);
    load();
  };

  const handleTogglePublish = async (a) => {
    await api.put(`/articles/${a._id}`, { published: !a.published });
    load();
  };

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  if (loading) return <div className="page-loading">Đang tải...</div>;

  /* ── FORM ── */
  if (view === 'form') return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#64748b' }}>← Quay lại</button>
        <h2 className="page-title" style={{ margin: 0 }}>{editing ? <><IconEdit size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />Chỉnh sửa bài viết</> : <><IconFileText size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />Tạo bài viết mới</>}</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Cột trái */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="fsadm-card">
            <div className="fsadm-card-title"><IconFileText size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />Thông tin bài viết</div>
            <div className="fsadm-field">
              <label>Tiêu đề *</label>
              <input className="input" value={form.title} onChange={f('title')} placeholder="Nhập tiêu đề bài viết..." />
            </div>
            <div className="fsadm-field">
              <label>Mô tả ngắn</label>
              <textarea className="input" rows={3} value={form.excerpt} onChange={f('excerpt')} placeholder="Tóm tắt nội dung bài viết..." style={{ resize: 'vertical' }} />
            </div>
          </div>

          <div className="fsadm-card">
            <div className="fsadm-card-title"><IconFileText size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />Nội dung (HTML)</div>
            <textarea
              className="input"
              rows={20}
              value={form.content}
              onChange={f('content')}
              placeholder="<p>Nội dung bài viết...</p>"
              style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
            />
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Hỗ trợ HTML: &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;img&gt;, &lt;strong&gt;, &lt;em&gt;...</div>
          </div>
        </div>

        {/* Cột phải */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="fsadm-card">
            <div className="fsadm-card-title"><IconSettings size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />Cài đặt</div>
            <div className="fsadm-field">
              <label>Danh mục</label>
              <select className="input" value={form.category} onChange={f('category')}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="fsadm-field">
              <label>Tác giả</label>
              <input className="input" value={form.author} onChange={f('author')} />
            </div>
            <div className="fsadm-field">
              <label>Thời gian đọc</label>
              <input className="input" value={form.readTime} onChange={f('readTime')} placeholder="VD: 5 phút đọc" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.published} onChange={f('published')} />
                Xuất bản
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.featured} onChange={f('featured')} />
                Bài nổi bật
              </label>
            </div>
          </div>

          <div className="fsadm-card">
            <div className="fsadm-card-title"><IconImage size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />Ảnh bìa</div>
            <div className="fsadm-field">
              <label>Upload ảnh</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
                style={{ fontSize: 13 }}
              />
              {uploadMsg && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{uploadMsg}</div>}
            </div>

            {form.images.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {form.images.map((img, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, border: form.mainImageIndex === i ? '2px solid #2563eb' : '1px solid #e2e8f0', background: form.mainImageIndex === i ? '#eff6ff' : '#fff' }}>
                    <img src={imgUrl(img)} alt="" style={{ width: 56, height: 42, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {form.mainImageIndex === i
                        ? <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb' }}>✓ Ảnh bìa</span>
                        : <button type="button" onClick={() => setMainImage(i)} style={{ fontSize: 11, color: '#64748b', background: 'none', border: '1px solid #cbd5e1', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>Chọn làm ảnh bìa</button>
                      }
                    </div>
                    <button type="button" onClick={() => removeImage(i)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>✕</button>
                  </div>
                ))}
              </div>
            )}

            {form.images.length === 0 && (
              <div style={{ marginTop: 8, padding: '20px', border: '2px dashed #e2e8f0', borderRadius: 8, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                Chưa có ảnh nào được chọn
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={goBack} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Hủy</button>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 2, padding: '10px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Đang lưu...' : editing ? <><IconUpload size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />Cập nhật</> : <><IconFileText size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />Tạo bài viết</>}
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
        <h2 className="page-title" style={{ margin: 0 }}><IconFileText size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />Quản lý bài viết</h2>
        <button onClick={openCreate} className="fsadm-btn-create">+ Tạo bài viết</button>
      </div>

      <input className="input" placeholder="Tìm kiếm bài viết..." value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 400 }} />

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Chưa có bài viết nào</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((a) => (
            <div key={a._id} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', display: 'flex', gap: 16, alignItems: 'center' }}>
              {a.img && (
                <img src={imgUrl(a.img)} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: '#eff6ff', color: '#2563eb' }}>{a.category}</span>
                  {a.featured && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: '#fef3c7', color: '#d97706' }}>⭐ Nổi bật</span>}
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: a.published ? '#dcfce7' : '#f1f5f9', color: a.published ? '#16a34a' : '#64748b', fontWeight: 600 }}>
                    {a.published ? '✓ Đã xuất bản' : '○ Nháp'}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  👤 {a.author} · 🕐 {new Date(a.createdAt).toLocaleDateString('vi-VN')} {a.readTime && `· ${a.readTime}`}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <label style={{ cursor: 'pointer' }} title={a.published ? 'Ẩn' : 'Xuất bản'}>
                  <input type="checkbox" checked={a.published} onChange={() => handleTogglePublish(a)} style={{ cursor: 'pointer' }} />
                </label>
                <button onClick={() => openEdit(a)} style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}><IconEdit size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Sửa</button>
                <button onClick={() => handleDelete(a._id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 16 }}><IconTrash size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticlesPage;
