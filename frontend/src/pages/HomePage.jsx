import { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import FlashSale from '../components/FlashSale';
import HeroBanner from '../components/HeroBanner';
import RecentlyViewed from '../components/RecentlyViewed';

const HomePage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await api.get('/products?sort=best_selling&instock=true&limit=15');
      setProducts(data.items || []);
    };
    fetchFeatured();
  }, []);

  return (
    <div className="home-page">
      <HeroBanner />

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
