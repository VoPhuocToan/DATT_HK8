import { useEffect, useState } from 'react';
import api from '../services/api';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const { data } = await api.get('/admin/orders');
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, orderStatus) => {
    await api.put(`/admin/orders/${id}/status`, { orderStatus });
    fetchOrders();
  };

  return (
    <div>
      <h1>Quản lý đơn hàng</h1>
      <div className="grid">
        {orders.map((order) => (
          <article className="card" key={order._id}>
            <p>Khách: {order.user?.name}</p>
            <p>Tổng: {order.totalPrice.toLocaleString('vi-VN')}đ</p>
            <p>Trạng thái: {order.orderStatus}</p>
            <select value={order.orderStatus} onChange={(e) => updateStatus(order._id, e.target.value)}>
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="shipping">shipping</option>
              <option value="delivered">delivered</option>
              <option value="cancelled">cancelled</option>
            </select>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
