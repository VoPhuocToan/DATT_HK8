import { useEffect, useState } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState('');

  const fetchProducts = async (params = '') => {
    const { data } = await api.get(`/products${params}`);
    setProducts(data.items || []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
    await fetchProducts(query);
  };

  return (
    <div className="section-block">
      <h1 className="section-title">Điện thoại nổi bật</h1>
      <form className="search" onSubmit={handleSearch}>
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm theo tên sản phẩm"
        />
        <button className="btn" type="submit">
          Tìm kiếm
        </button>
      </form>

      <div className="grid products-grid">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;
