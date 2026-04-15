import { useState, useEffect } from 'react';
import api from '../services/api';

const STATUS_MAP = {
  pending:    { label: 'Chờ xử lý',    bg: '#fef3c7', color: '#d97706', icon: '🟡' },
  processing: { label: 'Đang xử lý',   bg: '#dbeafe', color: '#2563eb', icon: '🔵' },
  resolved:   { label: 'Đã giải quyết', bg: '#d1fae5', color: '#059669', icon: '🟢' },
  closed:     { label: 'Đã đóng',      bg: '#f1f5f9', color: '#64748b', icon: '⚫' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return <span className="badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
};

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/support');
      setTickets(data);
    } catch { setTickets([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const counts = {
    pending:    tickets.filter((t) => t.status === 'pending').length,
    processing: tickets.filter((t) => t.status === 'processing').length,
    resolved:   tickets.filter((t) => t.status === 'resolved').length,
    closed:     tickets.filter((t) => t.status === 'closed').length,
  };

  const filtered = tickets.filter((t) => {
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchSearch = t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleUpdateStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/support/${id}`, { status });
      setTickets((prev) => prev.map((t) => t._id === id ? data : t));
      if (selected?._id === id) setSelected(data);
    } catch { alert('Cập nhật thất bại.'); }
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSaving(true);
    try {
      const { data } = await api.put(`/support/${selected._id}`, {
        adminReply: reply,
        status: 'resolved',
      });
      setTickets((prev) => prev.map((t) => t._id === data._id ? data : t));
      setSelected(null);
      setReply('');
    } catch { alert('Gửi phản hồi thất bại.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="page">
      <h2 className="page-title">Hỗ trợ khách hàng</h2>

      {/* Summary cards */}
      <div className="stats-grid">
        {Object.entries(STATUS_MAP).map(([key, s]) => (
          <div key={key} className="stat-card" style={{ borderTop: `4px solid ${s.color}`, cursor: 'pointer' }}
            onClick={() => setFilterStatus(filterStatus === key ? 'all' : key)}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color, fontSize: 20 }}>{s.icon}</div>
            <div>
              <div className="stat-value">{counts[key]}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter + search */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input placeholder="Tìm theo tên hoặc tiêu đề..." value={search}
          onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
        <div className="tab-group">
          <button className={`tab-btn ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>Tất cả</button>
          {Object.entries(STATUS_MAP).map(([k, s]) => (
            <button key={k} className={`tab-btn ${filterStatus === k ? 'active' : ''}`} onClick={() => setFilterStatus(k)}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết yêu cầu hỗ trợ</h3>
              <button className="btn-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <StatusBadge status={selected.status} />
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  {new Date(selected.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              <div className="support-info-row"><span>Khách hàng:</span><strong>{selected.name}</strong></div>
              <div className="support-info-row"><span>Email:</span><a href={`mailto:${selected.email}`}>{selected.email}</a></div>
              {selected.phone && <div className="support-info-row"><span>SĐT:</span>{selected.phone}</div>}
              <div className="support-info-row"><span>Tiêu đề:</span><strong>{selected.subject}</strong></div>
              <div className="support-msg-box">{selected.message}</div>

              {selected.adminReply && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
                  <div style={{ fontWeight: 700, color: '#059669', marginBottom: 4 }}>Phản hồi đã gửi:</div>
                  {selected.adminReply}
                </div>
              )}

              <div className="field">
                <label>Phản hồi khách hàng</label>
                <textarea rows={3} placeholder="Nhập nội dung phản hồi..." value={reply} onChange={(e) => setReply(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {Object.entries(STATUS_MAP).map(([k, s]) => (
                    <button key={k} className="btn-sm btn-outline"
                      style={selected.status === k ? { borderColor: s.color, color: s.color } : {}}
                      onClick={() => handleUpdateStatus(selected._id, k)}>
                      {s.label}
                    </button>
                  ))}
                </div>
                <button className="btn-primary" onClick={handleReply} disabled={saving}>
                  {saving ? 'Đang gửi...' : 'Gửi phản hồi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket list */}
      <div className="card">
        {loading ? <div className="page-loading">Đang tải...</div> : (
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Khách hàng</th>
                <th>Tiêu đề</th>
                <th>Trạng thái</th>
                <th>Ngày gửi</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>Không có yêu cầu nào</td></tr>
              )}
              {filtered.map((t, i) => (
                <tr key={t._id}>
                  <td style={{ color: '#94a3b8', fontSize: 12 }}>#{i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{t.email}</div>
                  </td>
                  <td>{t.subject}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td style={{ fontSize: 12, color: '#64748b' }}>{new Date(t.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div className="action-cell">
                      <button className="btn-sm btn-primary" onClick={() => { setSelected(t); setReply(''); }}>Xem</button>
                      {t.status === 'pending' && (
                        <button className="btn-sm btn-outline" onClick={() => handleUpdateStatus(t._id, 'processing')}>Tiếp nhận</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Support;
