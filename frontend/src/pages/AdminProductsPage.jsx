import { useEffect, useState } from 'react';
import api from '../services/api';

const initialState = {
  name: '',
  slug: '',
  brand: '',
  category: '',
  shortDescription: '',
  description: '',
  price: 0,
  salePrice: 0,
  stock: 0,
  images: [''],
  isFeatured: false,
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialState);

  const fetchData = async () => {
    const [{ data: productData }, { data: categoryData }] = await Promise.all([
      api.get('/products?limit=100'),
      api.get('/categories'),
    ]);
    setProducts(productData.items || []);
    setCategories(categoryData || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await api.post('/products', {
      ...form,
      images: form.images.filter(Boolean),
      specifications: {},
    });
    setForm(initialState);
    fetchData();
  };

  const handleDelete = async (id) => {
    await api.delete(`/products/${id}`);
    fetchData();
  };

  return (
    <div>
      <h1>Quản lý sản phẩm</h1>
      <form className="card form" onSubmit={handleSubmit}>
        <input placeholder="Tên sản phẩm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        <input placeholder="Thương hiệu" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
          <option value="">Chọn danh mục</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>{category.name}</option>
          ))}
        </select>
        <input placeholder="Giá gốc" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
        <input placeholder="Giá khuyến mãi" type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: Number(e.target.value) })} />
        <input placeholder="Tồn kho" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required />
        <input placeholder="Mô tả ngắn" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} required />
        <textarea placeholder="Mô tả chi tiết" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input placeholder="Ảnh đại diện (URL)" value={form.images[0]} onChange={(e) => setForm({ ...form, images: [e.target.value] })} />

        <label>
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
          Sản phẩm nổi bật
        </label>

        <button className="btn" type="submit">Thêm sản phẩm</button>
      </form>

      <div className="grid">
        {products.map((product) => (
          <article className="card" key={product._id}>
            <h3>{product.name}</h3>
            <p>{product.price.toLocaleString('vi-VN')}đ</p>
            <button className="btn btn-outline" onClick={() => handleDelete(product._id)}>Xóa</button>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AdminProductsPage;
