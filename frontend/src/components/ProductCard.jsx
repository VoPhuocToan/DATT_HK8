import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { user } = useAuth();

  const price = product.salePrice > 0 ? product.salePrice : product.price;
  const discount = product.salePrice > 0 ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;

  return (
    <article className="card product-card">
      {discount > 0 && <span className="discount-badge">Giảm {discount}%</span>}
      <img src={product.images?.[0] || 'https://via.placeholder.com/280x200?text=San+pham'} alt={product.name} />
      <span className="installment-pill">Trả chậm 0%</span>
      <h3>
        <Link to={`/products/${product.slug}`}>{product.name}</Link>
      </h3>
      <p className="text-muted product-brand">{product.brand}</p>
      <div className="price-wrap">
        <strong className="sale-price">{price.toLocaleString('vi-VN')}đ</strong>
        {product.salePrice > 0 && <span className="old-price">{product.price.toLocaleString('vi-VN')}đ</span>}
      </div>
      <div className="row">
        <Link to={`/products/${product.slug}`} className="btn btn-outline product-link-btn">
          Chi tiết
        </Link>
        <button
          className="btn"
          onClick={() => addItem(product._id, 1)}
          disabled={!user || product.stock <= 0}
        >
          Thêm giỏ
        </button>
      </div>
      {!user && <small className="text-muted">Đăng nhập để thêm giỏ hàng</small>}
    </article>
  );
};

export default ProductCard;
