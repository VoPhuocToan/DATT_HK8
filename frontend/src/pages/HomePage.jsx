import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import FlashSale from '../components/FlashSale';
import RecentlyViewed from '../components/RecentlyViewed';

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

      <FlashSale />

      <section className="section-block">
        <h2 className="section-title">Sản phẩm nổi bật</h2>
        <div className="grid products-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      <RecentlyViewed />
    </div>
  );
};

export default HomePage;
