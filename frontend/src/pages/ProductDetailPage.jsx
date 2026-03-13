import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await api.get(`/products/${slug}`);
      setProduct(data);
    };

    fetchProduct();
  }, [slug]);

  if (!product) {
    return <p>Đang tải...</p>;
  }

  const price = product.salePrice > 0 ? product.salePrice : product.price;

  return (
    <section className="card detail-layout">
      <img src={product.images?.[0] || 'https://via.placeholder.com/400x300'} alt={product.name} />
      <div>
        <h1>{product.name}</h1>
        <p>{product.shortDescription}</p>
        <p className="price">{price.toLocaleString('vi-VN')}đ</p>
        <p>{product.description}</p>
        <h3>Thông số kỹ thuật</h3>
        <ul>
          <li>Màn hình: {product.specifications?.screen || 'N/A'}</li>
          <li>Chipset: {product.specifications?.chipset || 'N/A'}</li>
          <li>RAM: {product.specifications?.ram || 'N/A'}</li>
          <li>Bộ nhớ: {product.specifications?.storage || 'N/A'}</li>
          <li>Pin: {product.specifications?.battery || 'N/A'}</li>
        </ul>

        <button className="btn" onClick={() => addItem(product._id, 1)} disabled={!user || product.stock <= 0}>
          Thêm vào giỏ hàng
        </button>
      </div>
    </section>
  );
};

export default ProductDetailPage;
