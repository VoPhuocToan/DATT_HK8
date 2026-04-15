import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  IconShoppingBag, IconUser, IconPhone, IconMapPin,
  IconCreditCard, IconArrowLeft, IconX, IconCheck, IconPackage
} from '../components/Icons';

const IconCalendar2 = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const FRONTEND_URL = 'http://localhost:5173';
const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + ' đ';

const STATUS_MAP = {
  pending:   { label: 'Chờ xác nhận', bg: '#fef3c7', color: '#d97706' },
  confirmed: { label: 'Đã xác nhận',  bg: '#dbeafe', color: '#2563eb' },
  shipping:  { label: 'Đang giao',    bg: '#ede9fe', color: '#7c3aed' },
  delivered: { label: 'Đã giao',      bg: '#d1fae5', color: '#059669' },
  cancelled: { label: 'Đã hủy',       bg: '#fee2e2', color: '#dc2626' },
};

const PAYMENT_STATUS_MAP = {
  pending: { label: 'Chưa thanh toán',    bg: '#fef3c7', color: '#d97706' },
  paid:    { label: 'Đã thanh toán',      bg: '#d1fae5', color: '#059669' },
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

const STEPS = ['pending', 'confirmed', 'shipping', 'delivered'];
const STEP_LABELS = ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao', 'Đã giao'];

const shortId = (id) => 'DH' + String(id).replace(/\D/g, '').slice(-10).padStart(10, '0');

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    setCancelling(true);
    try {
      await api.put(`/orders/${id}/cancel`);
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể hủy đơn hàng này.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Đang tải...</div>;
  if (!order) return null;

  const st = STATUS_MAP[order.orderStatus] || STATUS_MAP.pending;
  const pm = PAYMENT_METHOD_MAP[order.paymentMethod] || PAYMENT_METHOD_MAP.cod;
  const ps = PAYMENT_STATUS_MAP[order.paymentStatus] || PAYMENT_STATUS_MAP.pending;
  const addr = order.shippingAddress || {};
  const date = new Date(order.createdAt);
  const dateStr = `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')} ${date.toLocaleDateString('vi-VN')}`;
  const isCancelled = order.orderStatus === 'cancelled';
  const currentStep = isCancelled ? -1 : STEPS.indexOf(order.orderStatus);
  const isPaidBankTransfer = order.paymentMethod === 'bank_transfer' && order.paymentStatus === 'paid';
  const canCancel = ['pending', 'confirmed'].includes(order.orderStatus) && !isPaidBankTransfer;

  return (
    <div className="od-page">
      <div className="od-back">
        <Link to="/orders" className="od-back-btn">
          <IconArrowLeft size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Quay lại đơn hàng
        </Link>
      </div>

      <div className="od-header">
        <div>
          <h1 className="od-title">
            <IconShoppingBag size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Chi tiết đơn hàng
          </h1>
          <div className="od-meta">
            <span className="od-code">{shortId(order._id)}</span>
            <span className="od-date">
              <IconCalendar2 size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />
              {dateStr}
            </span>
          </div>
        </div>
        <div className="od-badges">
          <Badge {...st} />
          <Badge {...pm} />
          <Badge {...ps} />
        </div>
      </div>

      {/* Thanh tiến trình */}
      {!isCancelled ? (
        <div className="od-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`od-step ${i <= currentStep ? 'done' : ''} ${i === currentStep ? 'active' : ''}`}>
              <div className="od-step-dot">
                {i < currentStep ? <IconCheck size={12} /> : i + 1}
              </div>
              <div className="od-step-label">{STEP_LABELS[i]}</div>
              {i < STEPS.length - 1 && <div className="od-step-line" />}
            </div>
          ))}
        </div>
      ) : (
        <div className="od-cancelled-banner">
          <IconX size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Đơn hàng này đã bị hủy
        </div>
      )}

      <div className="od-layout">
        {/* Cột trái */}
        <div className="od-left">
          {/* Sản phẩm */}
          <div className="od-section">
            <div className="od-section-title">
              <IconPackage size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Sản phẩm đã đặt ({order.orderItems.length})
            </div>
            <div className="od-items">
              {order.orderItems.map((item, i) => (
                <div key={i} className="od-item">
                  <img
                    src={item.image ? `${FRONTEND_URL}${item.image}` : 'https://placehold.co/72'}
                    alt={item.name}
                    className="od-item-img"
                    onError={(e) => { e.target.src = 'https://placehold.co/72'; }}
                  />
                  <div className="od-item-info">
                    <div className="od-item-name">{item.name}</div>
                    <div className="od-item-unit">{fmt(item.price)} × {item.quantity}</div>
                  </div>
                  <div className="od-item-total">{fmt(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>

            {/* Tổng tiền */}
            <div className="od-price-summary">
              <div className="od-price-row">
                <span>Tạm tính</span>
                <span>{fmt(order.subtotal)}</span>
              </div>
              <div className="od-price-row">
                <span>Phí vận chuyển</span>
                <span>{order.shippingFee === 0 ? <span style={{ color: '#059669' }}>Miễn phí</span> : fmt(order.shippingFee)}</span>
              </div>
              <div className="od-price-row od-price-total">
                <span>Tổng cộng</span>
                <span>{fmt(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          {order.note && (
            <div className="od-section">
              <div className="od-section-title">Ghi chú</div>
              <p style={{ fontSize: 14, color: '#374151', margin: 0 }}>{order.note}</p>
            </div>
          )}
        </div>

        {/* Cột phải */}
        <div className="od-right">
          {/* Địa chỉ giao hàng */}
          <div className="od-section">
            <div className="od-section-title">
              <IconMapPin size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Địa chỉ giao hàng
            </div>
            <div className="od-addr-row"><IconUser size={13} style={{ verticalAlign: 'middle', marginRight: 6, color: '#6b7280' }} /><strong>{addr.fullName}</strong></div>
            <div className="od-addr-row"><IconPhone size={13} style={{ verticalAlign: 'middle', marginRight: 6, color: '#6b7280' }} />{addr.phone}</div>
            <div className="od-addr-row"><IconMapPin size={13} style={{ verticalAlign: 'middle', marginRight: 6, color: '#6b7280' }} />{[addr.detail, addr.ward, addr.district, addr.city].filter(Boolean).join(', ')}</div>
          </div>

          {/* Thanh toán */}
          <div className="od-section">
            <div className="od-section-title">
              <IconCreditCard size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Thanh toán
            </div>
            <div className="od-addr-row">Phương thức: <strong style={{ marginLeft: 4 }}>{pm.label}</strong></div>
            <div className="od-addr-row">Trạng thái: <Badge {...ps} /></div>
          </div>

          {/* Hành động */}
          <div className="od-actions">
            {order.paymentMethod === 'bank_transfer' && order.paymentStatus === 'pending' && order.orderStatus !== 'cancelled' && (
              <Link to={`/payment/qr/${order._id}`} className="od-btn od-btn-pay">
                <IconCreditCard size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Thanh toán ngay
              </Link>
            )}
            {canCancel && (
              <button className="od-btn od-btn-cancel" onClick={handleCancel} disabled={cancelling}>
                <IconX size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
