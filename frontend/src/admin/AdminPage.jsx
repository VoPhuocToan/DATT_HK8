import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const initialForm = {
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

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    const { data } = await api.get('/admin/stats');
    setStats(data);
  };

  const fetchProductsAndCategories = async () => {
    const [{ data: productData }, { data: categoryData }] = await Promise.all([
      api.get('/products?limit=100'),
      api.get('/categories'),
    ]);

    setProducts(productData.items || []);
    setCategories(categoryData || []);
  };

  const fetchOrders = async () => {
    const { data } = await api.get('/admin/orders');
    setOrders(data || []);
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([fetchStats(), fetchProductsAndCategories(), fetchOrders()]);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu quản trị.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const revenue = useMemo(() => {
    if (!stats) return 0;
    return Number(stats.revenue || 0);
  }, [stats]);

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await api.post('/products', {
        ...form,
        images: form.images.filter(Boolean),
        specifications: {},
      });
      setForm(initialForm);
      await fetchProductsAndCategories();
      await fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Tạo sản phẩm thất bại.');
    }
  };

  const handleDeleteProduct = async (id) => {
    setError('');
    try {
      await api.delete(`/products/${id}`);
      await fetchProductsAndCategories();
      await fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Xóa sản phẩm thất bại.');
    }
  };

  const handleUpdateOrderStatus = async (id, orderStatus) => {
    setError('');
    try {
      await api.put(`/admin/orders/${id}/status`, { orderStatus });
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Cập nhật trạng thái đơn hàng thất bại.');
    }
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h1>Trang quản trị</h1>
        <p className="text-muted" style={{ marginTop: 6 }}>
          Quản lý tổng quan hệ thống, sản phẩm và đơn hàng.
        </p>
        <div className="row" style={{ marginTop: 12, flexWrap: 'wrap' }}>
          <button
            className={`btn ${activeTab === 'overview' ? '' : 'btn-outline'}`}
            type="button"
            onClick={() => setActiveTab('overview')}
          >
            Tổng quan
          </button>
          <button
            className={`btn ${activeTab === 'products' ? '' : 'btn-outline'}`}
            type="button"
            onClick={() => setActiveTab('products')}
          >
            Sản phẩm
          </button>
          <button
            className={`btn ${activeTab === 'orders' ? '' : 'btn-outline'}`}
            type="button"
            onClick={() => setActiveTab('orders')}
          >
            Đơn hàng
          </button>
          <button className="btn btn-outline" type="button" onClick={loadData}>
            Tải lại dữ liệu
          </button>
        </div>
      </div>

      {error && (
        <div className="card error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card">Đang tải dữ liệu quản trị...</div>
      ) : (
        <>
          {(activeTab === 'overview' || activeTab === 'products' || activeTab === 'orders') && stats && (
            <section className="grid admin-stats">
              <div className="card"><h3>Khách hàng</h3><p>{stats.userCount}</p></div>
              <div className="card"><h3>Sản phẩm</h3><p>{stats.productCount}</p></div>
              <div className="card"><h3>Đơn hàng</h3><p>{stats.orderCount}</p></div>
              <div className="card"><h3>Doanh thu</h3><p>{revenue.toLocaleString('vi-VN')}đ</p></div>
            </section>
          )}

          {activeTab === 'overview' && (
            <section className="grid">
              <div className="card">
                <h2>Đơn hàng mới</h2>
                <div className="grid" style={{ marginTop: 12 }}>
                  {(stats?.recentOrders || []).map((order) => (
                    <article className="card" key={order._id}>
                      <p>Khách: {order.user?.name || 'Khách vãng lai'}</p>
                      <p>Tổng: {Number(order.totalPrice || 0).toLocaleString('vi-VN')}đ</p>
                      <p>Trạng thái: {order.orderStatus}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'products' && (
            <section className="grid" style={{ gap: 14 }}>
              <form className="card form" onSubmit={handleCreateProduct}>
                <h2>Thêm sản phẩm</h2>
                <input
                  placeholder="Tên sản phẩm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <input
                  placeholder="Slug"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                />
                <input
                  placeholder="Thương hiệu"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  required
                />
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                  ))}
                </select>
                <input
                  placeholder="Giá gốc"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  required
                />
                <input
                  placeholder="Giá khuyến mãi"
                  type="number"
                  value={form.salePrice}
                  onChange={(e) => setForm({ ...form, salePrice: Number(e.target.value) })}
                />
                <input
                  placeholder="Tồn kho"
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                  required
                />
                <input
                  placeholder="Mô tả ngắn"
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Mô tả chi tiết"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
                <input
                  placeholder="Ảnh đại diện (URL)"
                  value={form.images[0]}
                  onChange={(e) => setForm({ ...form, images: [e.target.value] })}
                />

                <label>
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    style={{ width: 'auto', marginRight: 8 }}
                  />
                  Sản phẩm nổi bật
                </label>

                <button className="btn" type="submit">Thêm sản phẩm</button>
              </form>

              <div className="grid">
                {products.map((product) => (
                  <article className="card" key={product._id}>
                    <h3>{product.name}</h3>
                    <p>Giá: {Number(product.price || 0).toLocaleString('vi-VN')}đ</p>
                    <p>Tồn kho: {product.stock}</p>
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() => handleDeleteProduct(product._id)}
                    >
                      Xóa
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'orders' && (
            <section className="grid">
              {orders.map((order) => (
                <article className="card" key={order._id}>
                  <p>Khách: {order.user?.name || 'Không xác định'}</p>
                  <p>Tổng: {Number(order.totalPrice || 0).toLocaleString('vi-VN')}đ</p>
                  <p>Trạng thái hiện tại: {order.orderStatus}</p>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                  >
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="shipping">shipping</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </article>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPage;
