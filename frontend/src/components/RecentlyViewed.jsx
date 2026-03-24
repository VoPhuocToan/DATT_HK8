import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'recently_viewed';
const MAX_ITEMS = 10;

// Hàm tiện ích để thêm sản phẩm vào lịch sử xem
export const addToRecentlyViewed = (product) => {
  if (!product?._id) return;
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const filtered = stored.filter((p) => p._id !== product._id);
  const updated = [
    { _id: product._id, name: product.name, slug: product.slug, price: product.price, salePrice: product.salePrice, images: product.images },
    ...filtered,
  ].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

const formatPrice = (n) =>
  new Intl.NumberFormat('vi-VN').format(n) + 'đ';

const RecentlyViewed = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = () => {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setItems(stored);
    };
    load();
    // Cập nhật khi tab được focus lại
    window.addEventListener('focus', load);
    return () => window.removeEventListener('focus', load);
  }, []);

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  };

  if (items.length === 0) return null;

  const displayPrice = (p) => (p.salePrice > 0 ? p.salePrice : p.price);

  return (
    <section className="section-block rv-section">
      <div className="rv-header">
        <h2 className="section-title" style={{ marginBottom: 0 }}>Sản phẩm đã xem</h2>
        <button className="rv-clear-btn" onClick={handleClear}>Xóa lịch sử</button>
      </div>
      <div className="rv-list">
        {items.map((p) => (
          <Link key={p._id} to={`/products/${p.slug}`} className="rv-item">
            <button
              className="rv-remove-btn"
              onClick={(e) => {
                e.preventDefault();
                const updated = items.filter((i) => i._id !== p._id);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                setItems(updated);
              }}
              aria-label="Xóa"
            >✕</button>
            <img src={p.images?.[0]} alt={p.name} className="rv-item-img" />
            <div className="rv-item-info">
              <span className="rv-item-name">{p.name}</span>
              <span className="rv-item-price">{formatPrice(displayPrice(p))}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
