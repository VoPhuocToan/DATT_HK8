import { useEffect, useMemo, useState } from 'react';
import api from './services/api';

const initialProduct = {
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

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('admin_user');
    return raw ? JSON.parse(raw) : null;
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productForm, setProductForm] = useState(initialProduct);
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

  const revenue = useMemo(() => Number(stats?.revenue || 0), [stats]);

  const loadAdminData = async () => {
    setLoading(true);
    setMessage('');
    try {
      const [{ data: statData }, { data: productData }, { data: categoryData }, { data: orderData }] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/products?limit=100'),
        api.get('/categories'),
        api.get('/admin/orders'),
      ]);
      setStats(statData);
      setProducts(productData.items || []);
      setCategories(categoryData || []);
      setOrders(orderData || []);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Không tải được dữ liệu admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && isAdmin) {
      loadAdminData();
    }
  }, [token, isAdmin]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.role !== 'admin') {
        setMessage('Tài khoản này không có quyền quản trị.');
        return;
      }
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data));
      setToken(data.token);
      setUser(data);
      setEmail('');
      setPassword('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Đăng nhập thất bại.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken('');
    setUser(null);
    setStats(null);
    setProducts([]);
    setOrders([]);
    setCategories([]);
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await api.post('/products', {
        ...productForm,
        images: productForm.images.filter(Boolean),
        specifications: {},
      });
      setProductForm(initialProduct);
      await loadAdminData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Tạo sản phẩm thất bại.');
    }
  };

  const handleDeleteProduct = async (id) => {
    setMessage('');
    try {
      await api.delete(`/products/${id}`);
      await loadAdminData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Xóa sản phẩm thất bại.');
    }
  };

  const handleUpdateOrderStatus = async (id, orderStatus) => {
    setMessage('');
    try {
      await api.put(`/admin/orders/${id}/status`, { orderStatus });
      await loadAdminData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Cập nhật trạng thái đơn hàng thất bại.');
    }
  };

  if (!token || !isAdmin) {
    return (
      <main className="container">
        <section className="card">
          <h1>Đặng Anh Shop - Admin</h1>
          <p>Đăng nhập tài khoản admin để quản lý website.</p>
          <form className="form" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email admin"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button type="submit">Đăng nhập</button>
          </form>
          {message && <p className="error">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      <section className="card topbar">
        <div>
          <h1>Đặng Anh Shop - Quản trị</h1>
          <p>Xin chào {user.name}</p>
        </div>
        <div className="row">
          <button type="button" onClick={loadAdminData}>Làm mới</button>
          <button type="button" className="outline" onClick={handleLogout}>Đăng xuất</button>
        </div>
      </section>

      {message && <p className="error">{message}</p>}
      {loading && <section className="card">Đang tải dữ liệu...</section>}

      {stats && (
        <section className="stats-grid">
          <article className="card"><h3>Khách hàng</h3><p>{stats.userCount}</p></article>
          <article className="card"><h3>Sản phẩm</h3><p>{stats.productCount}</p></article>
          <article className="card"><h3>Đơn hàng</h3><p>{stats.orderCount}</p></article>
          <article className="card"><h3>Doanh thu</h3><p>{revenue.toLocaleString('vi-VN')}đ</p></article>
        </section>
      )}

      <section className="card">
        <h2>Thêm sản phẩm</h2>
        <form className="form" onSubmit={handleCreateProduct}>
          <input placeholder="Tên sản phẩm" value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} required />
          <input placeholder="Slug" value={productForm.slug} onChange={(event) => setProductForm({ ...productForm, slug: event.target.value })} required />
          <input placeholder="Thương hiệu" value={productForm.brand} onChange={(event) => setProductForm({ ...productForm, brand: event.target.value })} required />
          <select value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} required>
            <option value="">Chọn danh mục</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
          <input type="number" placeholder="Giá" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: Number(event.target.value) })} required />
          <input type="number" placeholder="Giá KM" value={productForm.salePrice} onChange={(event) => setProductForm({ ...productForm, salePrice: Number(event.target.value) })} />
          <input type="number" placeholder="Tồn kho" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: Number(event.target.value) })} required />
          <input placeholder="Mô tả ngắn" value={productForm.shortDescription} onChange={(event) => setProductForm({ ...productForm, shortDescription: event.target.value })} required />
          <textarea placeholder="Mô tả chi tiết" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} required />
          <input placeholder="Ảnh (URL)" value={productForm.images[0]} onChange={(event) => setProductForm({ ...productForm, images: [event.target.value] })} />
          <label>
            <input type="checkbox" checked={productForm.isFeatured} onChange={(event) => setProductForm({ ...productForm, isFeatured: event.target.checked })} /> Sản phẩm nổi bật
          </label>
          <button type="submit">Tạo sản phẩm</button>
        </form>
      </section>

      <section className="card">
        <h2>Danh sách sản phẩm</h2>
        <div className="list-grid">
          {products.map((product) => (
            <article key={product._id} className="mini-card">
              <h4>{product.name}</h4>
              <p>Giá: {Number(product.price || 0).toLocaleString('vi-VN')}đ</p>
              <p>Tồn: {product.stock}</p>
              <button type="button" className="outline" onClick={() => handleDeleteProduct(product._id)}>Xóa</button>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Đơn hàng</h2>
        <div className="list-grid">
          {orders.map((order) => (
            <article key={order._id} className="mini-card">
              <p>Khách: {order.user?.name || 'Không xác định'}</p>
              <p>Tổng: {Number(order.totalPrice || 0).toLocaleString('vi-VN')}đ</p>
              <select value={order.orderStatus} onChange={(event) => handleUpdateOrderStatus(order._id, event.target.value)}>
                <option value="pending">pending</option>
                <option value="confirmed">confirmed</option>
                <option value="shipping">shipping</option>
                <option value="delivered">delivered</option>
                <option value="cancelled">cancelled</option>
              </select>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default App;
