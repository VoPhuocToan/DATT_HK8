import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + ' đ';

const CartPage = () => {
  const { items, cartTotal, updateItem, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(new Set());

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.product?._id)));
  };

  const clearAll = () => {
    items.forEach((i) => removeItem(i.product?._id));
    setSelected(new Set());
  };

  const selectedItems = items.filter((i) => selected.has(i.product?._id));
  const selectedTotal = selectedItems.reduce((sum, i) => {
    const price = i.product?.salePrice > 0 ? i.product.salePrice : i.product?.price || 0;
    return sum + price * i.quantity;
  }, 0);

  const FREE_SHIP_THRESHOLD = 500000;
  const shippingFee = selectedTotal >= FREE_SHIP_THRESHOLD || selectedTotal === 0 ? 0 : 30000;

  if (!items.length) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon">🛒</div>
        <h2>Giỏ hàng trống</h2>
        <p>Hãy thêm sản phẩm vào giỏ hàng để tiến hành mua sắm nhé!</p>
        <Link to="/products" className="btn">Mua sắm ngay</Link>
      </div>
    );
  }

  return (
    <div className="cart-wrap">
      <h1 className="cart-title">🛒 Giỏ hàng của bạn</h1>

      <div className="cart-layout">
        {/* ── Danh sách sản phẩm ── */}
        <div className="cart-main">
          {/* Chọn tất cả */}
          <div className="cart-select-all">
            <label className="cart-checkbox-label">
              <input
                type="checkbox"
                checked={selected.size === items.length && items.length > 0}
                onChange={toggleAll}
              />
              <span>Chọn tất cả ({selected.size}/{items.length})</span>
            </label>
          </div>

          {/* Items */}
          {items.map((item) => {
            const p = item.product;
            if (!p) return null;
            const price = p.salePrice > 0 ? p.salePrice : p.price || 0;
            const lineTotal = price * item.quantity;
            const isSelected = selected.has(p._id);

            return (
              <div key={p._id} className={`cart-item ${isSelected ? 'cart-item--selected' : ''}`}>
                <label className="cart-item-check">
                  <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(p._id)} />
                </label>

                <Link to={`/products/${p.slug}`} className="cart-item-img-wrap">
                  <img src={p.images?.[0]} alt={p.name} className="cart-item-img" />
                </Link>

                <div className="cart-item-info">
                  <Link to={`/products/${p.slug}`} className="cart-item-name">{p.name}</Link>
                  <span className="cart-item-sku">SKU: {p.slug?.toUpperCase().slice(0, 10)}</span>
                  <span className="cart-item-price">{fmt(price)}</span>
                </div>

                <div className="cart-item-actions">
                  <div className="cart-qty">
                    <button
                      className="cart-qty-btn"
                      onClick={() => item.quantity > 1 && updateItem(p._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >−</button>
                    <span className="cart-qty-val">{item.quantity}</span>
                    <button
                      className="cart-qty-btn"
                      onClick={() => updateItem(p._id, item.quantity + 1)}
                    >+</button>
                  </div>
                  <span className="cart-line-total">{fmt(lineTotal)}</span>
                  <button className="cart-remove-btn" onClick={() => removeItem(p._id)} aria-label="Xóa">
                    🗑
                  </button>
                </div>
              </div>
            );
          })}

          {/* Xóa toàn bộ */}
          <div className="cart-footer-actions">
            <button className="cart-clear-btn" onClick={clearAll}>🗑 Xóa toàn bộ giỏ hàng</button>
          </div>
        </div>

        {/* ── Tổng đơn hàng ── */}
        <aside className="cart-summary">
          <h2 className="cart-summary-title">Tổng đơn hàng</h2>

          <div className="cart-summary-row">
            <span>Tạm tính ({selectedItems.length} sản phẩm):</span>
            <span>{fmt(selectedTotal)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Phí vận chuyển:</span>
            <span className={shippingFee === 0 ? 'cart-free-ship' : ''}>
              {shippingFee === 0 ? 'Miễn phí' : fmt(shippingFee)}
            </span>
          </div>

          {selectedTotal > 0 && selectedTotal < FREE_SHIP_THRESHOLD && (
            <div className="cart-ship-notice">
              Mua thêm <strong>{fmt(FREE_SHIP_THRESHOLD - selectedTotal)}</strong> để được miễn phí vận chuyển
            </div>
          )}

          <div className="cart-summary-divider" />

          <div className="cart-summary-total">
            <span>Tổng cộng:</span>
            <span>{fmt(selectedTotal + shippingFee)}</span>
          </div>

          <button
            className="btn cart-checkout-btn"
            disabled={selectedItems.length === 0}
            onClick={() => navigate(user ? '/checkout' : '/login')}
          >
            💳 Thanh toán ({selectedItems.length})
          </button>

          <Link to="/products" className="cart-continue-btn">← Tiếp tục mua sắm</Link>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;
