import { useEffect, useState } from 'react';
import api from '../services/api';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
const STATUS_LABEL = {
  pending: { label: 'Chờ xác nhận', color: '#f59e0b' },
  confirmed: { label: 'Đã xác nhận', color: '#3b82f6' },
  shipping: { label: 'Đang giao', color: '#8b5cf6' },
  delivered: { label: 'Đã giao', color: '#10b981' },
  cancelled: { label: 'Đã hủy', color: '#ef4444' },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/orders');
      setOrders(data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, orderStatus) => {
    setMsg('');
    try {
      await api.put(`/admin/orders/${id}/status`, { orderStatus });
      setMsg('Cập nhật trạng thái thành công.');
      load();
      if (selected?._id === id) setSelected((o) => ({ ...o, orderStatus }));
    } catch (err) {
      setMsg(err.response?.data?.message || 'Cập nhật thất bại.');
    }
  };

  const filtered = filterStatus ? orders.filter((o) => o.orderStatus === filterStatus) : orders;

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Đơn hàng</h2>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: 'auto' }}>
          <option value="">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s].label}</option>)}
        </select>
      </div>

      {msg && <p className={msg.includes('thành công') ? 'success-msg' : 'error-msg'}>{msg}</p>}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết đơn hàng</h3>
              <button className="btn-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="order-detail">
              <p><strong>Khách hàng:</strong> {selected.user?.name}</p>
              <p><strong>Email:</strong> {selected.user?.email}</p>
              <p><strong>SĐT:</strong> {selected.shippingAddress?.phone}</p>
              <p><strong>Địa chỉ:</strong> {selected.shippingAddress?.detail}, {selected.shippingAddress?.ward}, {selected.shippingAddress?.district}, {selected.shippingAddress?.city}</p>
              <p><strong>Thanh toán:</strong> {selected.paymentMethod === 'cod' ? 'Tiền mặt (COD)' : 'Chuyển khoản'}</p>
              <p><strong>Ghi chú:</strong> {selected.note || '—'}</p>
              <table className="table" style={{ marginTop: 12 }}>
                <thead><tr><th>Sản phẩm</th><th>Số lượng</th><th>Đơn giá</th></tr></thead>
                <tbody>
                  {selected.orderItems?.map((item, i) => (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{Number(item.price).toLocaleString('vi-VN')}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ textAlign: 'right', marginTop: 8 }}><strong>Tổng: {Number(selected.totalPrice).toLocaleString('vi-VN')}đ</strong></p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {loading ? <div className="page-loading">Đang tải...</div> : (
          <table className="table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const s = STATUS_LABEL[order.orderStatus] || {};
                return (
                  <tr key={order._id}>
                    <td>
                      <div>{order.user?.name || '—'}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{order.user?.email}</div>
                    </td>
                    <td>{Number(order.totalPrice).toLocaleString('vi-VN')}đ</td>
                    <td>{order.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}</td>
                    <td>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        style={{ width: 'auto', padding: '4px 8px', fontSize: 13, borderRadius: 6, border: `1px solid ${s.color}`, color: s.color }}
                      >
                        {STATUS_OPTIONS.map((st) => <option key={st} value={st}>{STATUS_LABEL[st].label}</option>)}
                      </select>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <button className="btn-sm btn-outline" onClick={() => setSelected(order)}>Xem</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Orders;
