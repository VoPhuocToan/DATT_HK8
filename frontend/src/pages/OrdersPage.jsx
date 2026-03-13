import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await api.get('/orders/my');
      setOrders(data);
    };

    fetchOrders();
  }, []);

  return (
    <div>
      <h1>Đơn hàng của tôi</h1>
      <div className="grid">
        {orders.map((order) => (
          <article className="card" key={order._id}>
            <p>Mã đơn: {order._id}</p>
            <p>Trạng thái: {order.orderStatus}</p>
            <p>Thanh toán: {order.paymentStatus}</p>
            <p>Tổng tiền: {order.totalPrice.toLocaleString('vi-VN')}đ</p>
            <p>Số sản phẩm: {order.orderItems.length}</p>
          </article>
        ))}
      </div>
      {!orders.length && <p>Bạn chưa có đơn hàng nào. <Link to="/products">Mua ngay</Link></p>}
    </div>
  );
};

export default OrdersPage;
