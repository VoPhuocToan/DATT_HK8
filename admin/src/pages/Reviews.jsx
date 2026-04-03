import { useEffect, useState } from 'react';
import api from '../services/api';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
const imgUrl = (src) => {
  if (!src) return 'https://placehold.co/40';
  if (src.startsWith('http')) return src;
  return `${BASE_URL}/images${src.startsWith('/') ? src : '/' + src}`;
};

const Stars = ({ rating }) => (
  <span>
    {[1,2,3,4,5].map((s) => (
      <span key={s} style={{ color: s <= rating ? '#f59e0b' : '#d1d5db', fontSize: 14 }}>★</span>
    ))}
  </span>
);

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [saving, setSaving] = useState(null);
  const [filter, setFilter] = useState('all'); // all | pending | replied

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reviews');
      setReviews(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleReply = async (id) => {
    setSaving(id);
    try {
      const { data } = await api.put(`/reviews/${id}/reply`, { reply: replyText[id] || '' });
      setReviews((prev) => prev.map((r) => r._id === id ? data : r));
      setReplyText((prev) => ({ ...prev, [id]: '' }));
    } catch (e) {
      alert(e.response?.data?.message || 'Lỗi');
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa đánh giá này?')) return;
    await api.delete(`/reviews/${id}`);
    setReviews((prev) => prev.filter((r) => r._id !== id));
  };

  const filtered = reviews.filter((r) => {
    if (filter === 'pending') return !r.adminReply;
    if (filter === 'replied') return !!r.adminReply;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.adminReply).length;

  if (loading) return <div className="page-loading">Đang tải...</div>;

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 className="page-title" style={{ margin: 0 }}>⭐ Quản lý đánh giá</h2>
        <span style={{ fontSize: 13, color: '#64748b' }}>{reviews.length} đánh giá · {pendingCount} chưa trả lời</span>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'all', label: `Tất cả (${reviews.length})` },
          { key: 'pending', label: `Chưa trả lời (${pendingCount})` },
          { key: 'replied', label: `Đã trả lời (${reviews.length - pendingCount})` },
        ].map((t) => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            style={{
              padding: '6px 16px', borderRadius: 20, border: '1px solid',
              borderColor: filter === t.key ? '#2563eb' : '#e2e8f0',
              background: filter === t.key ? '#eff6ff' : '#fff',
              color: filter === t.key ? '#2563eb' : '#64748b',
              fontWeight: filter === t.key ? 700 : 400, cursor: 'pointer', fontSize: 13,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Không có đánh giá nào</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((r) => (
            <div key={r._id} style={{
              background: '#fff', borderRadius: 12, padding: 20,
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              borderLeft: r.adminReply ? '4px solid #22c55e' : '4px solid #f59e0b',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{r.user?.name || 'Ẩn danh'}</span>
                    <Stars rating={r.rating} />
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 10,
                      background: r.adminReply ? '#dcfce7' : '#fef3c7',
                      color: r.adminReply ? '#16a34a' : '#d97706', fontWeight: 600,
                    }}>
                      {r.adminReply ? '✓ Đã trả lời' : '⏳ Chờ trả lời'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                    {r.user?.email} · {new Date(r.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
                <button onClick={() => handleDelete(r._id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 18 }}>
                  🗑
                </button>
              </div>

              {/* Sản phẩm */}
              {r.product && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', borderRadius: 8, padding: '8px 12px', marginBottom: 10 }}>
                  <img src={imgUrl(r.product.images?.[0])}
                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} alt="" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{r.product.name}</span>
                </div>
              )}

              {/* Nội dung đánh giá */}
              <p style={{ fontSize: 14, color: '#334155', margin: '0 0 12px' }}>{r.comment}</p>

              {/* Reply hiện tại */}
              {r.adminReply && (
                <div style={{ background: '#f0fdf4', borderLeft: '3px solid #22c55e', borderRadius: '0 8px 8px 0', padding: '8px 12px', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>
                    💬 Phản hồi của bạn · {r.repliedAt ? new Date(r.repliedAt).toLocaleString('vi-VN') : ''}
                  </div>
                  <p style={{ fontSize: 13, color: '#166534', margin: 0 }}>{r.adminReply}</p>
                </div>
              )}

              {/* Form trả lời */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}
                  placeholder={r.adminReply ? 'Chỉnh sửa phản hồi...' : 'Nhập phản hồi...'}
                  value={replyText[r._id] ?? (r.adminReply || '')}
                  onChange={(e) => setReplyText((prev) => ({ ...prev, [r._id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleReply(r._id)}
                />
                <button onClick={() => handleReply(r._id)} disabled={saving === r._id}
                  style={{
                    background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8,
                    padding: '8px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 13,
                    opacity: saving === r._id ? 0.6 : 1,
                  }}>
                  {saving === r._id ? '...' : r.adminReply ? 'Cập nhật' : 'Gửi'}
                </button>
                {r.adminReply && (
                  <button
                    title="Xóa phản hồi"
                    style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}
                    onClick={() => {
                      setReplyText((prev) => ({ ...prev, [r._id]: '' }));
                      setTimeout(() => handleReply(r._id), 0);
                    }}>
                    Xóa phản hồi
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
