import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const stripStorage = (name) =>
  name.replace(/\b(64|128|256|512|1T|1TB)\s*GB\b/gi, '').replace(/\s{2,}/g, ' ').trim();

// Ảnh có _1 hoặc -1 ở cuối tên file được ưu tiên hiển thị đầu tiên
const getPrimaryImage = (images) => {
  if (!images?.length) return null;
  const primary = images.find((img) => /[_-]1\.\w+$/.test(img));
  return primary || images[0];
};

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const displayName = stripStorage(product.name);
  const primaryImage = getPrimaryImage(product.images);

  const price = product.salePrice > 0 ? product.salePrice : product.price;
  const discount = product.salePrice > 0
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const isOutOfStock = product.stock === 0;
  const isComingSoon = false; // có thể mở rộng sau

  const spec = product.specifications || {};
  const specTags = [
    spec.screen && spec.screen,
    spec.ram && spec.ram,
    spec.storage && spec.storage,
  ].filter(Boolean);

  // Tính ưu đãi mock dựa trên giá
  const smemberDiscount = price > 0 ? Math.round(price * 0.008 / 1000) * 1000 : 0;
  const studentDiscount = price > 0 ? Math.round(price * 0.05 / 500) * 500 : 0;

  const rating = product.rating > 0 ? product.rating : (4.5 + Math.random() * 0.5).toFixed(1);

  return (
    <article className="pc-card">
      {/* Top badges */}
      <div className="pc-top-row">
        {discount > 0 && <span className="pc-badge-discount">Giảm {discount}%</span>}
        {isOutOfStock && !discount && <span className="pc-badge-out">Hết hàng</span>}
        <span className="pc-badge-installment">Trả góp 0%</span>
      </div>

      {/* Image */}
      <Link to={`/products/${product.slug}`} className="pc-img-link">
        <img
          src={primaryImage || '/iphone-17_1.webp'}
          alt={product.name}
          className="pc-img"
        />
      </Link>

      {/* Body */}
      <div className="pc-body">
        {/* Name */}
        <Link to={`/products/${product.slug}`} className="pc-name">
          {displayName}
        </Link>

        {/* Price */}
        {isComingSoon ? (
          <div className="pc-coming">
            <span className="pc-coming-label">Sắp về hàng</span>
            <span className="pc-contact-price">Giá Liên Hệ</span>
          </div>
        ) : isOutOfStock ? (
          <div className="pc-coming">
            <span className="pc-coming-label">Sắp về hàng</span>
            <div className="pc-prices">
              <span className="pc-sale-price">{price.toLocaleString('vi-VN')}đ</span>
              {product.salePrice > 0 && (
                <span className="pc-old-price">{product.price.toLocaleString('vi-VN')}đ</span>
              )}
            </div>
          </div>
        ) : (
          <div className="pc-prices">
            <span className="pc-sale-price">{price.toLocaleString('vi-VN')}đ</span>
            {product.salePrice > 0 && (
              <span className="pc-old-price">{product.price.toLocaleString('vi-VN')}đ</span>
            )}
          </div>
        )}

        {/* Spec tags */}
        {specTags.length > 0 && (
          <div className="pc-specs">
            {specTags.map((tag, i) => (
              <span key={i} className="pc-spec-tag">{tag}</span>
            ))}
          </div>
        )}

        {/* Footer: rating + wishlist */}
        <div className="pc-footer">
          <span className="pc-rating">⭐ {Number(rating).toFixed(1)}</span>
          <button
            className={`pc-wish-btn ${liked ? 'liked' : ''}`}
            onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
            aria-label="Yêu thích"
          >
            {liked ? '❤️' : '🤍'} Yêu thích
          </button>
        </div>

        {/* Add to cart */}
        <button
          className="pc-add-btn"
          onClick={() => addItem(product._id, 1)}
          disabled={!user || isOutOfStock}
        >
          {isOutOfStock ? 'Hết hàng' : !user ? 'Đăng nhập để mua' : 'Thêm vào giỏ'}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
