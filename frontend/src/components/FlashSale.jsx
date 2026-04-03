import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { IconZap } from './Icons';

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
  const [session, setSession] = useState(null); // session đang active
  const [slideIdx, setSlideIdx] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    api.get('/flash-sale/active').then(({ data }) => {
      // Lấy session đầu tiên đang chạy
      if (data && data.length > 0) setSession(data[0]);
    }).catch(() => {});
  }, []);

  const countdown = useCountdown(session ? new Date(session.endTime).getTime() : Date.now());

  if (!session || !session.items || session.items.length === 0) return null;

  const products = session.items.filter((it) => it.product);
  const VISIBLE = 5;
  const maxSlide = Math.max(0, products.length - VISIBLE);

  const slide = (dir) => setSlideIdx((prev) => Math.min(Math.max(prev + dir, 0), maxSlide));

  return (
    <div className="fs-wrapper">
      {/* Header */}
      <div className="fs-header">
        <div className="fs-tabs">
          <button className="fs-tab active"><IconZap size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />FLASH SALE</button>
        </div>
      </div>

      {/* Sub-header: tên session + countdown */}
      <div className="fs-subheader">
        <div className="fs-sessions">
          <span className="fs-session-name-label">{session.name}</span>
        </div>
        <div className="fs-countdown">
          <span className="fs-countdown-label">KẾT THÚC SAU</span>
          <div className="fs-clock">
            <span className="fs-digit">{countdown.h}</span>
            <span className="fs-sep">:</span>
            <span className="fs-digit">{countdown.m}</span>
            <span className="fs-sep">:</span>
            <span className="fs-digit">{countdown.s}</span>
          </div>
        </div>
      </div>

      {/* Product slider */}
      <div className="fs-slider-wrap">
        {slideIdx > 0 && (
          <button className="fs-arrow left" onClick={() => slide(-1)}>‹</button>
        )}

        <div className="fs-slider" ref={sliderRef}>
          {products.slice(slideIdx, slideIdx + VISIBLE).map((item) => {
            const p = item.product;
            const displayPrice = item.flashSalePrice;
            const discount = p.price > 0 ? Math.round((1 - displayPrice / p.price) * 100) : 0;
            const soldCount = item.flashSaleSold || 0;
            const total = item.flashSaleStock || 50;
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
                    {discount > 0 && (
                      <span className="fs-old-price">{Number(p.price).toLocaleString('vi-VN')}đ</span>
                    )}
                  </div>
                  <div className="fs-progress-wrap">
                    <div className="fs-progress-bar">
                      <div className="fs-progress-fill" style={{ width: `${Math.min((soldCount / Math.max(total, 1)) * 100, 100)}%` }} />
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

      {/* Footer note */}
      <div className="fs-footer">
        Chỉ áp dụng thanh toán online thành công — Mỗi SĐT chỉ được mua 1 sản phẩm cùng loại
      </div>
    </div>
  );
};

export default FlashSale;
