import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const imgUrl = (src) => {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  // Ảnh serve qua backend /images/ (bao gồm cả frontend/public và uploads)
  return `${BACKEND_URL}/images/${src.replace(/^\//, '')}`;
};

const FALLBACK = [{
  _id: 'fallback',
  badge: 'danganhshop x mùa sale tháng 3',
  title: 'iPhone 17e',
  subtitle: 'Đủ tính năng. Đầy giá trị. Chỉ từ 17.990.000đ',
  ctaText: 'Mua ngay',
  ctaLink: '/dien-thoai',
  image: '',
  bgFrom: '#ffe0ef',
  bgTo: '#f8f2ff',
}];

const HeroBanner = () => {
  const [banners, setBanners] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api.get('/banners').then(({ data }) => {
      if (data?.length) setBanners(data);
      else setBanners(FALLBACK);
    }).catch(() => setBanners(FALLBACK));
  }, []);

  const next = useCallback(() => setCurrent((c) => (c + 1) % banners.length), [banners.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + banners.length) % banners.length), [banners.length]);

  // Auto-slide mỗi 5 giây
  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [banners.length, next]);

  if (!banners.length) return null;

  const b = banners[current];

  return (
    <section className="hero hero-banner card" style={{
      background: `linear-gradient(135deg, ${b.bgFrom} 0%, ${b.bgTo} 100%)`,
    }}>
      <div className="hero-copy">
        {b.badge && <p className="hero-badge">{b.badge}</p>}
        <h1>{b.title}</h1>
        {b.subtitle && <p className="hero-subtitle">{b.subtitle}</p>}
        <Link to={b.ctaLink || '/'} className="btn hero-cta">{b.ctaText || 'Mua ngay'}</Link>
      </div>

      <div className="hero-visual-wrap">
        {b.image
          ? <img src={imgUrl(b.image)} alt={b.title} className="hero-product-img" />
          : <div className="hero-visual" aria-hidden="true" />
        }
      </div>

      {banners.length > 1 && (
        <>
          <button className="hero-nav hero-nav-prev" onClick={prev} aria-label="Trước">‹</button>
          <button className="hero-nav hero-nav-next" onClick={next} aria-label="Tiếp">›</button>
          <div className="hero-dots">
            {banners.map((_, i) => (
              <button
                key={i}
                className={`hero-dot${i === current ? ' active' : ''}`}
                onClick={() => setCurrent(i)}
                aria-label={`Banner ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroBanner;
