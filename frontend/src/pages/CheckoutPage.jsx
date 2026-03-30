import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + ' đ';
const FREE_SHIP = 500000;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, fetchCart } = useCart();
  const { user } = useAuth();

  // Chỉ lấy sản phẩm đã được chọn từ giỏ hàng
  const selectedIds = JSON.parse(sessionStorage.getItem('checkout_selected') || '[]');
  const selectedItems = selectedIds.length > 0
    ? items.filter((i) => selectedIds.includes(i.product?._id))
    : items;

  const cartTotal = selectedItems.reduce((sum, item) => {
    const price = item.product?.salePrice > 0 ? item.product.salePrice : item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    city: '',
    district: '',
    ward: '',
    detail: '',
    paymentMethod: 'cod',
    note: '',
  });
  const [couponMsg, setCouponMsg] = useState('');
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [coupon, setCoupon] = useState('');

  // Load địa chỉ đã lưu từ profile
  useEffect(() => {
    api.get('/auth/profile').then(({ data }) => {
      const addr = data.address || {};
      setForm((f) => ({
        ...f,
        fullName: addr.fullName || data.name || f.fullName,
        phone: addr.phone || data.phone || f.phone,
        city: addr.city || '',
        district: addr.district || '',
        ward: addr.ward || '',
        detail: addr.detail || '',
      }));
      setEditAddress(!(addr.fullName && addr.city && addr.district && addr.detail));
    }).catch(() => { setEditAddress(true); });
  }, []);

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const shippingFee = cartTotal >= FREE_SHIP ? 0 : 30000;
  const total = cartTotal - discount + shippingFee;

  const addressFilled = form.fullName && form.phone && form.city && form.district && form.detail;
  const addressDisplay = addressFilled
    ? `${form.detail}, ${form.ward ? form.ward + ', ' : ''}${form.district}, ${form.city}`
    : null;

  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === 'SALE10') {
      setDiscount(Math.round(cartTotal * 0.1));
      setCouponMsg('Áp dụng thành công! Giảm 10%');
    } else {
      setDiscount(0);
      setCouponMsg('Mã giảm giá không hợp lệ');
    }
  };

  const handleSubmit = async () => {
    if (!addressFilled) { alert('Vui lòng điền đầy đủ địa chỉ nhận hàng.'); return; }
    setSubmitting(true);
    try {
      await api.post('/orders', {
        shippingAddress: { fullName: form.fullName, phone: form.phone, city: form.city, district: form.district, ward: form.ward, detail: form.detail },
        paymentMethod: form.paymentMethod,
        note: form.note,
        shippingFee,
        selectedProductIds: selectedIds, // Gửi danh sách ID sản phẩm được chọn
      });
      await fetchCart();
      navigate('/orders');
    } catch (err) {
      alert(err.response?.data?.message || 'Đặt hàng thất bại, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ck-page">
      <h1 className="ck-title">💳 Xác nhận thanh toán</h1>

      <div className="ck-layout">
        {/* ── Cột trái ── */}
        <div className="ck-left">

          {/* Địa chỉ nhận hàng */}
          <div className="ck-section">
            <h2 className="ck-section-title">📍 Địa chỉ nhận hàng</h2>

            {!editAddress && addressFilled ? (
              <div className="ck-address-card">
                <div className="ck-address-name">{form.fullName}</div>
                <div className="ck-address-row">📞 {form.phone}</div>
                <div className="ck-address-row">📍 {addressDisplay}</div>
                <button className="ck-edit-btn" onClick={() => setEditAddress(true)}>✏️ Thay đổi</button>
              </div>
            ) : (
              <div className="ck-address-form">
                <div className="ck-form-row">
                  <div className="ck-field">
                    <label>Họ và tên *</label>
                    <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Nguyễn Văn A" />
                  </div>
                  <div className="ck-field">
                    <label>Số điện thoại *</label>
                    <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="0912 345 678" />
                  </div>
                </div>
                <div className="ck-form-row">
                  <div className="ck-field">
                    <label>Tỉnh / Thành phố *</label>
                    <input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="TP. Hồ Chí Minh" />
                  </div>
                  <div className="ck-field">
                    <label>Quận / Huyện *</label>
                    <input value={form.district} onChange={(e) => set('district', e.target.value)} placeholder="Quận 1" />
                  </div>
                </div>
                <div className="ck-form-row">
                  <div className="ck-field">
                    <label>Phường / Xã</label>
                    <input value={form.ward} onChange={(e) => set('ward', e.target.value)} placeholder="Phường Bến Nghé" />
                  </div>
                  <div className="ck-field">
                    <label>Số nhà, đường *</label>
                    <input value={form.detail} onChange={(e) => set('detail', e.target.value)} placeholder="123 Nguyễn Huệ" />
                  </div>
                </div>
                {addressFilled && (
                  <button className="ck-save-addr-btn" onClick={() => setEditAddress(false)}>✅ Lưu địa chỉ</button>
                )}
              </div>
            )}
          </div>

          {/* Sản phẩm đã chọn */}
          <div className="ck-section">
            <h2 className="ck-section-title">🛍️ Sản phẩm đã chọn</h2>
            <div className="ck-items">
              {selectedItems.map((item) => {
                const p = item.product;
                if (!p) return null;
                const price = p.salePrice > 0 ? p.salePrice : p.price;
                return (
                  <div key={p._id} className="ck-item">
                    <img src={p.images?.[0]} alt={p.name} className="ck-item-img" />
                    <div className="ck-item-info">
                      <div className="ck-item-name">{p.name}</div>
                      <div className="ck-item-sku">SKU: {p.slug?.toUpperCase().slice(0, 12)}</div>
                      <div className="ck-item-price">{fmt(price)} × {item.quantity}</div>
                    </div>
                    <div className="ck-item-total">{fmt(price * item.quantity)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Cột phải: tóm tắt đơn ── */}
        <aside className="ck-summary">
          <h2 className="ck-summary-title">Thông tin đơn hàng</h2>

          {/* Mã giảm giá */}
          <div className="ck-coupon-wrap">
            <label className="ck-label">Mã giảm giá</label>
            <div className="ck-coupon-row">
              <input
                className="ck-coupon-input"
                placeholder="Nhập mã giảm giá"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
              />
              <button className="ck-coupon-btn" onClick={handleApplyCoupon}>Áp dụng</button>
            </div>
            {couponMsg && (
              <div className={`ck-coupon-msg ${couponMsg.includes('thành công') ? 'success' : 'error'}`}>
                {couponMsg}
              </div>
            )}
          </div>

          {/* Tóm tắt giá */}
          <div className="ck-price-rows">
            <div className="ck-price-row">
              <span>Tạm tính:</span>
              <span>{fmt(cartTotal)}</span>
            </div>
            {discount > 0 && (
              <div className="ck-price-row ck-discount-row">
                <span>Giảm giá:</span>
                <span>- {fmt(discount)}</span>
              </div>
            )}
            <div className="ck-price-row">
              <span>Phí vận chuyển:</span>
              <span className={shippingFee === 0 ? 'ck-free' : ''}>{shippingFee === 0 ? 'Miễn phí' : fmt(shippingFee)}</span>
            </div>
          </div>

          <div className="ck-total-row">
            <span>Tổng cộng:</span>
            <span>{fmt(total)}</span>
          </div>

          {/* Phương thức thanh toán */}
          <div className="ck-field" style={{ marginTop: 16 }}>
            <label className="ck-label">Phương thức thanh toán</label>
            <select className="ck-select" value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}>
              <option value="cod">Thanh toán khi nhận hàng (COD)</option>
              <option value="bank_transfer">Chuyển khoản ngân hàng</option>
            </select>
            {form.paymentMethod === 'bank_transfer' && (
              <div className="ck-bank-note">ℹ️ Chuyển khoản qua PayOS: Quét mã QR hoặc chuyển khoản trực tiếp</div>
            )}
          </div>

          {/* Ghi chú */}
          <div className="ck-field" style={{ marginTop: 12 }}>
            <label className="ck-label">Ghi chú</label>
            <textarea
              className="ck-textarea"
              placeholder="Ghi chú cho đơn hàng..."
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
              rows={3}
            />
          </div>

          {/* Nút đặt hàng */}
          <button
            className="ck-submit-btn"
            onClick={handleSubmit}
            disabled={submitting || selectedItems.length === 0}
          >
            {submitting ? 'Đang xử lý...' : '✅ Xác nhận đặt hàng'}
          </button>

          <Link to="/cart" className="ck-back-btn">← Quay lại giỏ hàng</Link>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
