import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await api.get('/products?featured=true&limit=8');
      setProducts(data.items || []);
    };

    fetchFeatured();
  }, []);

  return (
    <div className="home-page">
      <section className="hero tgdd-banner card">
        <div className="hero-copy">
          <p className="hero-badge">danganhshop x mùa sale tháng 3</p>
          <h1>iPhone 17e</h1>
          <p>Đủ tính năng. Đầy giá trị. Chỉ từ 17.990.000đ</p>
          <Link to="/products" className="btn hero-cta">
            Mua ngay
          </Link>
        </div>
        <div className="hero-visual" aria-hidden="true" />
      </section>

      <section className="section-block promo-section">
        <h2 className="section-title">Khuyến mãi online</h2>
        <div className="promo-topics">
          <span className="topic-tag active">Flash sale giá sốc</span>
          <span className="topic-tag">Giảm đến 50%</span>
          <span className="topic-tag">Online only</span>
          <span className="topic-link">Điện thoại</span>
          <span className="topic-link">Apple</span>
          <span className="topic-link">Laptop</span>
          <span className="topic-link">Phụ kiện</span>
          <span className="topic-link">Đồng hồ</span>
        </div>

        <div className="flash-timeline">
          <div className="timeline-item active">
            <strong>Chỉ còn:</strong>
            <span>01 : 24 : 11</span>
          </div>
          <div className="timeline-item">
            <strong>Sắp diễn ra</strong>
            <span>21:30</span>
          </div>
          <div className="timeline-item">
            <strong>Ngày mai</strong>
            <span>00:00</span>
          </div>
          <div className="timeline-item">
            <strong>Ngày mai</strong>
            <span>09:00</span>
          </div>
          <div className="timeline-item">
            <strong>Ngày mai</strong>
            <span>12:00</span>
          </div>
        </div>

        <div className="grid products-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
