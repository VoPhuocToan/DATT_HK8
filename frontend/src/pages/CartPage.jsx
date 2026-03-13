import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const { items, cartTotal, updateItem, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <h1>Giỏ hàng</h1>
      {!items.length ? (
        <p>Giỏ hàng trống. <Link to="/products">Mua sắm ngay</Link></p>
      ) : (
        <>
          <div className="cart-list">
            {items.map((item) => {
              const price = item.product?.salePrice > 0 ? item.product.salePrice : item.product?.price || 0;
              return (
                <article key={item.product?._id} className="card cart-item">
                  <div>
                    <h3>{item.product?.name}</h3>
                    <p>{price.toLocaleString('vi-VN')}đ</p>
                  </div>
                  <div className="row">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) => updateItem(item.product?._id, Number(event.target.value))}
                    />
                    <button className="btn btn-outline" onClick={() => removeItem(item.product?._id)}>
                      Xóa
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="card summary">
            <h2>Tạm tính: {cartTotal.toLocaleString('vi-VN')}đ</h2>
            <button className="btn" onClick={() => navigate(user ? '/checkout' : '/login')}>
              Tiến hành đặt hàng
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
