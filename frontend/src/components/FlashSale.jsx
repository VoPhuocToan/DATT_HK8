import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

// Các khung giờ flash sale
const SESSIONS = [
  { label: '20-22h 21/03', start: new Date('2026-03-21T20:00:00'), end: new Date('2026-03-21T22:00:00') },
  { label: '20-22h 22/03', start: new Date('2026-03-22T20:00:00'), end: new Date('2026-03-22T22:00:00') },
];

const useCountdown = (target) => {
  const [diff, setDiff] = useState(Math.max(0, target - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setDiff(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(id);
  }, [target]);
  const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  const ms = String(Math.floor((diff % 1000) / 10)).padStart(2, '0');
  return { h, m, s, ms };
};

const FlashSale = () => {
  const [tab, setTab] = useState('flash'); // flash | hot
  const [sessionIdx, setSessionIdx] = useState(0);
  const [flashProducts, setFlashProducts] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [slideIdx, setSlideIdx] = useState(0);
  const sliderRef = useRef(null);

  const countdown = useCountdown(SESSIONS[sessionIdx].end.getTime());

  useEffect(() => {
    api.get('/products?limit=20').then(({ data }) => {
      const all = data.items || [];
      const withSale = all.filter((p) => p.salePrice > 0);
      const noSale = all.filter((p) => !p.salePrice || p.salePrice === 0);
      setFlashProducts(withSale.length ? withSale : all.slice(0, 10));
      setHotProducts(noSale.length ? noSale : all.slice(0, 10));
    });
  }, []);

  const products = tab === 'flash' ? flashProducts : hotProducts;
  const VISIBLE = 5;
  const maxSlide = Math.max(0, products.length - VISIBLE);

  const slide = (dir) => {
    setSlideIdx((prev) => Math.min(Math.max(prev + dir, 0), maxSlide));
  };

  const pct = (p) =>
    p.salePrice > 0 && p.price > 0
      ? Math.round((1 - p.salePrice / p.price) * 100)
      : 0;

  const sold = (p) => Math.floor(Math.random() * 40 + 5); // mock
  const total = 50;

  return (
    <div className="fs-wrapper">
      {/* ── Header ── */}
      <div className="fs-header">
        <div className="fs-tabs">
          <button className={`fs-tab ${tab === 'flash' ? 'active' : ''}`} onClick={() => { setTab('flash'); setSlideIdx(0); }}>
            ⚡ FLASHSALE
          </button>
          <button className={`fs-tab ${tab === 'hot' ? 'active' : ''}`} onClick={() => { setTab('hot'); setSlideIdx(0); }}>
            🔥 HOTSALE
          </button>
        </div>
      </div>

      {/* ── Sub-header: sessions + countdown ── */}
      <div className="fs-subheader">
        <div className="fs-sessions">
          {SESSIONS.map((s, i) => (
            <button
              key={i}
              className={`fs-session-btn ${sessionIdx === i ? 'active' : ''}`}
              onClick={() => setSessionIdx(i)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="fs-countdown">
          <span className="fs-countdown-label">BẮT ĐẦU SAU</span>
          <div className="fs-clock">
            <span className="fs-digit">{countdown.h}</span>
            <span className="fs-sep">:</span>
            <span className="fs-digit">{countdown.m}</span>
            <span className="fs-sep">:</span>
            <span className="fs-digit">{countdown.s}</span>
            <span className="fs-sep">:</span>
            <span className="fs-digit">{countdown.ms}</span>
          </div>
          <span className="fs-pct-icon">%</span>
        </div>
      </div>

      {/* ── Product slider ── */}
      <div className="fs-slider-wrap">
        {slideIdx > 0 && (
          <button className="fs-arrow left" onClick={() => slide(-1)}>‹</button>
        )}

        <div className="fs-slider" ref={sliderRef}>
          {products.slice(slideIdx, slideIdx + VISIBLE).map((p) => {
            const discount = pct(p);
            const soldCount = sold(p);
            const displayPrice = p.salePrice > 0 ? p.salePrice : p.price;
            return (
              <Link to={`/products/${p.slug}`} key={p._id} className="fs-card">
                <div className="fs-img-wrap">
                  {discount > 0 && <span className="fs-discount-badge">-{discount}%</span>}
                  <img src={p.images?.[0] || 'https://placehold.co/160x160'} alt={p.name} />
                </div>
                <div className="fs-card-body">
                  <p className="fs-name">{p.name}</p>
                  <div className="fs-prices">
                    <span className="fs-sale-price">{Number(displayPrice).toLocaleString('vi-VN')}đ</span>
                    {p.salePrice > 0 && (
                      <span className="fs-old-price">{Number(p.price).toLocaleString('vi-VN')}đ</span>
                    )}
                  </div>
                  <div className="fs-progress-wrap">
                    <div className="fs-progress-bar">
                      <div className="fs-progress-fill" style={{ width: `${Math.min((soldCount / total) * 100, 100)}%` }} />
                    </div>
                    <span className="fs-sold-label">Đã bán {soldCount}/{total} suất</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {slideIdx < maxSlide && (
          <button className="fs-arrow right" onClick={() => slide(1)}>›</button>
        )}
      </div>

      {/* ── Footer note ── */}
      <div className="fs-footer">
        Chi áp dụng thanh toán online thành công — Mỗi SĐT chỉ được mua 1 sản phẩm cùng loại
      </div>
    </div>
  );
};

export default FlashSale;
