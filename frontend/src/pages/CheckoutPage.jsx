import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartTotal, fetchCart } = useCart();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    city: '',
    district: '',
    ward: '',
    detail: '',
    paymentMethod: 'cod',
    note: '',
  });

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await api.post('/orders', {
      shippingAddress: {
        fullName: form.fullName,
        phone: form.phone,
        city: form.city,
        district: form.district,
        ward: form.ward,
        detail: form.detail,
      },
      paymentMethod: form.paymentMethod,
      note: form.note,
      shippingFee: 0,
    });

    await fetchCart();
    navigate('/orders');
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h1>Thanh toán</h1>
      <input name="fullName" placeholder="Họ và tên" value={form.fullName} onChange={handleChange} required />
      <input name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} required />
      <input name="city" placeholder="Tỉnh / Thành phố" value={form.city} onChange={handleChange} required />
      <input name="district" placeholder="Quận / Huyện" value={form.district} onChange={handleChange} required />
      <input name="ward" placeholder="Phường / Xã" value={form.ward} onChange={handleChange} required />
      <input name="detail" placeholder="Số nhà, đường" value={form.detail} onChange={handleChange} required />

      <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
        <option value="cod">Thanh toán khi nhận hàng</option>
        <option value="bank_transfer">Chuyển khoản ngân hàng</option>
      </select>

      <textarea name="note" placeholder="Ghi chú" value={form.note} onChange={handleChange} />
      <h3>Tổng thanh toán: {cartTotal.toLocaleString('vi-VN')}đ</h3>
      <button className="btn" type="submit">
        Đặt hàng
      </button>
    </form>
  );
};

export default CheckoutPage;
