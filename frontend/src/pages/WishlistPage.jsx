import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

const WishlistPage = () => {
  const { items, toggle, clear } = useWishlist();
  const { addItem } = useCart();
  const { user } = useAuth();

  if (items.length === 0) {
    return (
      <div className="wl-empty">
        <div style={{ fontSize: 56 }}>🤍</div>
        <h2>Chưa có sản phẩm yêu thích</h2>
        <p>Nhấn vào biểu tượng ❤️ trên sản phẩm để thêm vào danh sách yêu thích.</p>
        <Link to="/products" className="btn">Khám phá sản phẩm</Link>
      </div>
    );
  }

  return (
    <div className="wl-page">
      <div className="wl-header">
        <h1 className="wl-title">❤️ Sản phẩm yêu thích</h1>
        <div className="wl-header-right">
          <span className="wl-count">{items.length} sản phẩm</span>
          <button className="wl-clear-btn" onClick={() => { if (confirm('Xóa tất cả sản phẩm yêu thích?')) clear(); }}>
            🗑 Xóa tất cả
          </button>
        </div>
      </div>

      <div className="wl-grid">
        {items.map((p) => {
          const price = p.salePrice > 0 ? p.salePrice : p.price;
          const discount = p.salePrice > 0
            ? Math.round(((p.price - p.salePrice) / p.price) * 100) : 0;
          const img = p.images?.find((i) => /[_-]1\.\w+$/.test(i)) || p.images?.[0];

          return (
            <div key={p._id} className="wl-card">
              {/* Nút bỏ yêu thích */}
              <button className="wl-remove-btn" onClick={() => toggle(p)} title="Bỏ yêu thích">✕</button>

              {/* Ảnh */}
              <Link to={`/products/${p.slug}`} className="wl-img-wrap">
                <img src={img} alt={p.name} className="wl-img" />
                {discount > 0 && <span className="wl-discount-badge">-{discount}%</span>}
              </Link>

              {/* Info */}
              <div className="wl-card-body">
                <Link to={`/products/${p.slug}`} className="wl-name">{p.name}</Link>
                <div className="wl-prices">
                  <span className="wl-price">{fmt(price)}</span>
                  {p.salePrice > 0 && <span className="wl-old-price">{fmt(p.price)}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="wl-card-footer">
                <button
                  className="wl-add-btn"
                  onClick={() => user ? addItem(p._id, 1) : null}
                  disabled={!user}
                  title={!user ? 'Đăng nhập để mua' : ''}
                >
                  {user ? '🛒 Thêm vào giỏ' : 'Đăng nhập để mua'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
