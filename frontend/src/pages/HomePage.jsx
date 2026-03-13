import { useEffect, useState } from 'react';
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
    <div>
      <section className="hero tgdd-banner">
        <div>
          <h1>Đặng Anh Shop</h1>
          <p>Điện thoại chính hãng - Giá tốt mỗi ngày - Giao nhanh toàn quốc</p>
        </div>
        <button className="btn">Xem ưu đãi hôm nay</button>
      </section>

      <section className="category-pills">
        <a href="#">iPhone</a>
        <a href="#">Samsung</a>
        <a href="#">Xiaomi</a>
        <a href="#">OPPO</a>
        <a href="#">Vivo</a>
        <a href="#">Realme</a>
      </section>

      <section className="section-block">
        <h2 className="section-title">Sản phẩm nổi bật</h2>
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
