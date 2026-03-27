import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const FRONTEND_URL = 'http://localhost:5173';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + ' đ';

const ORDER_TABS = [
  { key: 'all',       label: '≡ Tất cả' },
  { key: 'pending',   label: '🕐 Chờ xác nhận' },
  { key: 'shipping',  label: '🚚 Đang giao' },
  { key: 'delivered', label: '✅ Đã giao' },
  { key: 'cancelled', label: '✕ Đã hủy' },
];

const STATUS_MAP = {
  pending:   { label: 'Chờ xác nhận', bg: '#fef3c7', color: '#d97706' },
  confirmed: { label: 'Đã xác nhận',  bg: '#dbeafe', color: '#2563eb' },
  shipping:  { label: 'Đang giao',    bg: '#ede9fe', color: '#7c3aed' },
  delivered: { label: 'Đã giao',      bg: '#d1fae5', color: '#059669' },
  cancelled: { label: 'Đã hủy',       bg: '#fee2e2', color: '#dc2626' },
};

const PAYMENT_STATUS_MAP = {
  pending: { label: 'Chưa thanh toán', bg: '#fef3c7', color: '#d97706' },
  paid:    { label: 'Đã thanh toán',   bg: '#d1fae5', color: '#059669' },
  failed:  { label: 'Đã hủy thanh toán', bg: '#fee2e2', color: '#dc2626' },
};

const PAYMENT_METHOD_MAP = {
  cod:           { label: 'Thanh toán khi nhận hàng', bg: '#f1f5f9', color: '#475569' },
  bank_transfer: { label: 'Chuyển khoản QR',          bg: '#dbeafe', color: '#2563eb' },
};

const Badge = ({ bg, color, label }) => (
  <span style={{ background: bg, color, fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 6, whiteSpace: 'nowrap' }}>
    {label}
  </span>
);

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [expanded, setExpanded] = useState({});
  const [cancelling, setCancelling] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/my');
      setOrders(data || []);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    setCancelling(id);
    try {
      await api.put(`/orders/${id}/cancel`);
      load();
    } catch { alert('Không thể hủy đơn hàng này.'); }
    finally { setCancelling(null); }
  };

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const filtered = tab === 'all' ? orders : orders.filter((o) => o.orderStatus === tab);

  const shortId = (id) => 'DH' + String(id).replace(/\D/g, '').slice(-10).padStart(10, '0');

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Đang tải đơn hàng...</div>;

  return (
    <div className="ord-page">
      <h1 className="ord-title">🛍️ Đơn hàng của tôi</h1>

      {/* Tabs */}
      <div className="ord-tabs">
        {ORDER_TABS.map((t) => (
          <button
            key={t.key}
            className={`ord-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.key !== 'all' && (
              <span className="ord-tab-count">
                {orders.filter((o) => o.orderStatus === t.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="ord-empty">
          <div style={{ fontSize: 48 }}>📦</div>
          <p>Không có đơn hàng nào.</p>
          <Link to="/products" className="btn">Mua sắm ngay</Link>
        </div>
      ) : (
        <div className="ord-list">
          {filtered.map((order) => {
            const st = STATUS_MAP[order.orderStatus] || STATUS_MAP.pending;
            const pm = PAYMENT_METHOD_MAP[order.paymentMethod] || PAYMENT_METHOD_MAP.cod;
            const ps = PAYMENT_STATUS_MAP[order.paymentStatus] || PAYMENT_STATUS_MAP.pending;
            const addr = order.shippingAddress || {};
            const isExpanded = expanded[order._id] !== false; // mặc định mở
            const canCancel = ['pending', 'confirmed'].includes(order.orderStatus);
            const date = new Date(order.createdAt);
            const dateStr = `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')} ${date.toLocaleDateString('vi-VN')}`;

            return (
              <div key={order._id} className="ord-card">
                {/* Header */}
                <div className="ord-card-header">
                  <div className="ord-card-meta">
                    <span className="ord-id">Mã đơn hàng: <strong>{shortId(order._id)}</strong></span>
                    <span className="ord-date">📅 {dateStr}</span>
                  </div>
                  <div className="ord-badges">
                    <Badge {...st} />
                    <Badge {...pm} />
                    <Badge {...ps} />
                  </div>
                </div>

                {/* Body */}
                <div className="ord-card-body">
                  {/* Thông tin giao hàng */}
                  <div className="ord-shipping-info">
                    <div className="ord-shipping-title">ℹ️ Thông tin giao hàng</div>
                    <div className="ord-shipping-row">👤 Người nhận hàng: <strong>{addr.fullName}</strong></div>
                    <div className="ord-shipping-row">📞 Số điện thoại: {addr.phone}</div>
                    <div className="ord-shipping-row">
                      📍 Địa chỉ: {[addr.detail, addr.ward, addr.district, addr.city].filter(Boolean).join(', ')}
                    </div>
                  </div>

                  {/* Sản phẩm */}
                  <div className="ord-items">
                    {(isExpanded ? order.orderItems : order.orderItems.slice(0, 2)).map((item, i) => (
                      <div key={i} className="ord-item">
                        <img
                          src={item.image ? `${FRONTEND_URL}${item.image}` : 'https://placehold.co/56'}
                          alt={item.name}
                          className="ord-item-img"
                          onError={(e) => { e.target.src = 'https://placehold.co/56'; }}
                        />
                        <div className="ord-item-info">
                          <div className="ord-item-name">{item.name}</div>
                          <div className="ord-item-qty">x{item.quantity}</div>
                        </div>
                        <div className="ord-item-price">{fmt(item.price * item.quantity)}</div>
                      </div>
                    ))}
                    {order.orderItems.length > 2 && (
                      <button className="ord-show-more" onClick={() => toggleExpand(order._id)}>
                        {isExpanded ? '▲ Thu gọn' : `▼ Xem thêm ${order.orderItems.length - 2} sản phẩm`}
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="ord-card-footer">
                  <div className="ord-total">
                    Tổng tiền: <span className="ord-total-price">{fmt(order.totalPrice)}</span>
                  </div>
                  <div className="ord-actions">
                    <Link to={`/orders/${order._id}`} className="ord-btn ord-btn-detail">🔍 Chi tiết</Link>
                    {order.orderStatus === 'delivered' && (
                      <button className="ord-btn ord-btn-review">⭐ Đánh giá</button>
                    )}
                    {canCancel && (
                      <button
                        className="ord-btn ord-btn-cancel"
                        onClick={() => handleCancel(order._id)}
                        disabled={cancelling === order._id}
                      >
                        {cancelling === order._id ? '...' : '✕ Hủy đơn'}
                      </button>
                    )}
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

export default OrdersPage;
