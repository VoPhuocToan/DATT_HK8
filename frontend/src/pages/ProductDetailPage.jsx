import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

/* ── Star rating display ── */
const Stars = ({ rating, size = 16 }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="pd-stars" style={{ fontSize: size }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < full || (i === full && half) ? '#f59e0b' : '#d1d5db' }}>★</span>
      ))}
    </span>
  );
};

/* ── Rating bar ── */
const RatingBar = ({ label, count, total }) => (
  <div className="pd-rbar-row">
    <span className="pd-rbar-label">{label} sao</span>
    <div className="pd-rbar-track">
      <div className="pd-rbar-fill" style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }} />
    </div>
    <span className="pd-rbar-count">{count}</span>
  </div>
);

const MOCK_REVIEWS = [
  { id: 1, name: 'Nguyễn Văn A', rating: 5, comment: 'Sản phẩm rất tốt, đóng gói cẩn thận, giao hàng nhanh!', date: '2026-03-15T12:10:00Z' },
  { id: 2, name: 'Trần Thị B', rating: 4, comment: 'Máy đẹp, chạy mượt. Hài lòng với sản phẩm.', date: '2026-03-10T09:30:00Z' },
];

const COLORS = ['Titan', 'Trắng', 'Đen', 'Xanh'];

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [mainImg, setMainImg] = useState(0);
  const [tab, setTab] = useState('desc'); // desc | specs | reviews
  const [relatedTab, setRelatedTab] = useState('similar');
  const [liked, setLiked] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const [qty, setQty] = useState(1);
  const [addedMsg, setAddedMsg] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get(`/products/${slug}`).then(({ data }) => {
      setProduct(data);
      setMainImg(0);
      // Load related
      api.get(`/products?limit=5`).then(({ data: rd }) => {
        setRelated((rd.items || []).filter((p) => p.slug !== slug));
      });
    });
  }, [slug]);

  if (!product) return <div className="pd-loading">Đang tải sản phẩm...</div>;

  const price = product.salePrice > 0 ? product.salePrice : product.price;
  const discount = product.salePrice > 0
    ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  const tradeInPrice = Math.round(price * 0.7 / 1000) * 1000;
  const spec = product.specifications || {};

  const handleAddCart = () => {
    addItem(product._id, qty);
    setAddedMsg('Đã thêm vào giỏ hàng!');
    setTimeout(() => setAddedMsg(''), 2500);
  };

  const ratingCounts = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: MOCK_REVIEWS.filter((r) => r.rating === s).length,
  }));
  const avgRating = MOCK_REVIEWS.length
    ? (MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0) / MOCK_REVIEWS.length).toFixed(1)
    : 0;

  return (
    <div className="pd-page">
      {/* ── Breadcrumb ── */}
      <nav className="pd-breadcrumb">
        <Link to="/">Trang chủ</Link> › <Link to="/products">Điện thoại</Link> › <span>{product.name}</span>
      </nav>

      {/* ── Main layout ── */}
      <div className="pd-main">
        {/* LEFT: images */}
        <div className="pd-gallery">
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-quick-actions">
            <button className={`pd-action-btn ${liked ? 'liked' : ''}`} onClick={() => setLiked(!liked)}>
              {liked ? '❤️' : '🤍'} Yêu thích
            </button>
            <span className="pd-action-sep">|</span>
            <button className="pd-action-btn" onClick={() => setTab('desc')}>💬 Hỏi đáp</button>
            <span className="pd-action-sep">|</span>
            <button className="pd-action-btn" onClick={() => setTab('specs')}>📋 Thông số</button>
            <span className="pd-action-sep">|</span>
            <button className="pd-action-btn">⚖️ So sánh</button>
          </div>

          {/* Main image */}
          <div className="pd-main-img-wrap">
            <img
              src={product.images?.[mainImg] || '/iphone-17_1.webp'}
              alt={product.name}
              className="pd-main-img"
            />
          </div>

          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="pd-thumbs">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`pd-thumb ${mainImg === i ? 'active' : ''}`}
                  onClick={() => setMainImg(i)}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: info */}
        <div className="pd-info">
          {/* Price */}
          <div className="pd-price-line">
            <span className="pd-price-main">{price.toLocaleString('vi-VN')} ₫</span>
            {product.salePrice > 0 && (
              <span className="pd-price-old">{product.price.toLocaleString('vi-VN')}đ</span>
            )}
          </div>

          {/* Màu sắc */}
          <div className="pd-section">
            <div className="pd-variant-row-label">Màu sắc</div>
            <div className="pd-color-swatches">
              {product.images?.map((img, i) => (
                <button
                  key={i}
                  className={`pd-swatch-btn ${selectedColor === i ? 'active' : ''}`}
                  onClick={() => { setSelectedColor(i); setMainImg(i); }}
                  style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  aria-label={`Màu ${i + 1}`}
                >
                  {selectedColor === i && <span className="pd-swatch-check">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Bộ nhớ */}
          {spec.storage && (
            <div className="pd-section">
              <div className="pd-variant-row-label">Bộ nhớ</div>
              <div className="pd-storage-btns">
                {[spec.storage, spec.storage === '128 GB' ? '256 GB' : '128 GB'].map((s, i) => (
                  <button
                    key={i}
                    className={`pd-storage-btn ${i === 0 ? 'active' : ''}`}
                  >
                    {spec.ram ? `${spec.ram.replace(' ', '')}-${s.replace(' ', '')}` : s}
                    <span className="pd-storage-check">✓</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + Add to cart */}
          <div className="pd-buy-row">
            <div className="pd-qty-wrap">
              <button className="pd-qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className="pd-qty-val">{qty}</span>
              <button className="pd-qty-btn" onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
            </div>
            <button
              className="pd-add-btn"
              onClick={handleAddCart}
              disabled={!user || product.stock <= 0}
            >
              {product.stock <= 0 ? 'Hết hàng' : !user ? 'Đăng nhập để mua' : '🛒 Thêm vào giỏ hàng'}
            </button>
            <Link to="/checkout" className="pd-buy-now-btn">Mua ngay</Link>
          </div>
          {addedMsg && <p className="pd-added-msg">{addedMsg}</p>}

          {/* Stock */}
          <div className="pd-stock-info">
            {product.stock > 0
              ? <span className="pd-in-stock">✅ Còn {product.stock} sản phẩm</span>
              : <span className="pd-out-stock">❌ Hết hàng</span>}
          </div>

          {/* Promotions */}
          <div className="pd-promos">
            <div className="pd-promo-item">🎁 Tặng kèm sạc nhanh 20W chính hãng</div>
            <div className="pd-promo-item">🛡️ Bảo hành chính hãng 12 tháng</div>
            <div className="pd-promo-item">🚚 Giao hàng toàn quốc, miễn phí từ 500K</div>
            <div className="pd-promo-item">💳 Trả góp 0% qua thẻ tín dụng kỳ hạn 3-6 tháng</div>
          </div>
        </div>
      </div>

      {/* ── Tabs: Mô tả / Thông số / Đánh giá ── */}
      <div className="pd-tabs-wrap">
        <div className="pd-tabs">
          {[
            { key: 'desc', label: 'Mô tả' },
            { key: 'specs', label: 'Thông số kỹ thuật' },
            { key: 'reviews', label: `Đánh giá (${MOCK_REVIEWS.length})` },
          ].map((t) => (
            <button key={t.key} className={`pd-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="pd-tab-content">
          {/* Mô tả */}
          {tab === 'desc' && (
            <div className="pd-desc">
              <h3>Mô tả sản phẩm</h3>
              <p>{product.shortDescription}</p>
              <h4>Đặc điểm nổi bật:</h4>
              <ul className="pd-feature-list">
                {['Chất lượng cao, bền bỉ', 'Thiết kế hiện đại, sang trọng', 'Dễ dàng sử dụng', 'Bảo hành chính hãng 12 tháng', 'Giao hàng toàn quốc'].map((f, i) => (
                  <li key={i}><span className="pd-check-icon">✓</span>{f}</li>
                ))}
              </ul>
              {product.description && <p style={{ marginTop: 12 }}>{product.description}</p>}
            </div>
          )}

          {/* Thông số */}
          {tab === 'specs' && (
            <div className="pd-specs">
              <h3>Thông số kỹ thuật</h3>
              <table className="pd-spec-table">
                <tbody>
                  {[
                    ['Thương hiệu', product.brand],
                    ['Mã sản phẩm', product.slug?.toUpperCase()],
                    ['Tình trạng', product.stock > 0 ? 'Còn hàng' : 'Hết hàng'],
                    ['Màn hình', spec.screen || '—'],
                    ['Chipset', spec.chipset || '—'],
                    ['RAM', spec.ram || '—'],
                    ['Bộ nhớ trong', spec.storage || '—'],
                    ['Pin', spec.battery || '—'],
                    ['Camera sau', spec.rearCamera || '—'],
                    ['Camera trước', spec.frontCamera || '—'],
                    ['Hệ điều hành', spec.os || '—'],
                    ['Bảo hành', '12 tháng'],
                    ['Giao hàng', 'Toàn quốc'],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td className="pd-spec-label">{label}</td>
                      <td className="pd-spec-value">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Đánh giá */}
          {tab === 'reviews' && (
            <div className="pd-reviews">
              <h3>Đánh giá khách hàng</h3>
              <div className="pd-rating-summary">
                <div className="pd-rating-big">
                  <div className="pd-rating-num">{avgRating}</div>
                  <Stars rating={Number(avgRating)} size={24} />
                  <div className="pd-rating-based">Dựa trên {MOCK_REVIEWS.length} đánh giá</div>
                </div>
                <div className="pd-rating-bars">
                  {ratingCounts.map((r) => (
                    <RatingBar key={r.star} label={r.star} count={r.count} total={MOCK_REVIEWS.length} />
                  ))}
                </div>
              </div>

              <div className="pd-review-list">
                {MOCK_REVIEWS.map((r) => (
                  <div key={r.id} className="pd-review-item">
                    <div className="pd-review-header">
                      <span className="pd-review-name">{r.name}</span>
                      <span className="pd-review-date">
                        {new Date(r.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}{' '}
                        {new Date(r.date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <Stars rating={r.rating} size={16} />
                    <p className="pd-review-comment">{r.comment}</p>
                    <button className="pd-reply-btn">↩ Trả lời đánh giá</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Related products ── */}
      {related.length > 0 && (
        <div className="pd-related">
          <h2 className="pd-related-title">Có thể bạn cũng thích</h2>
          <div className="pd-related-tabs">
            <button className={`pd-rtab ${relatedTab === 'similar' ? 'active' : ''}`} onClick={() => setRelatedTab('similar')}>
              Sản phẩm tương tự
            </button>
            <button className={`pd-rtab ${relatedTab === 'trade' ? 'active' : ''}`} onClick={() => setRelatedTab('trade')}>
              Tham khảo hàng cũ
            </button>
          </div>
          <div className="grid products-grid">
            {related.slice(0, 5).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
