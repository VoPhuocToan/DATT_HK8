import { useEffect, useState } from 'react';
import api from '../services/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get('/categories');
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/categories', { name, image });
      setName('');
      setImage('');
      setMsg('Tạo danh mục thành công.');
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Tạo danh mục thất bại.');
    }
  };

  return (
    <div className="page">
      <h2 className="page-title">Danh mục</h2>

      <div className="card" style={{ maxWidth: 480 }}>
        <h3 className="card-title">Thêm danh mục mới</h3>
        <form onSubmit={handleSubmit} className="form-inline">
          <div className="field"><label>Tên danh mục *</label><input value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="field"><label>Ảnh (URL)</label><input value={image} onChange={(e) => setImage(e.target.value)} /></div>
          {msg && <p className={msg.includes('thành công') ? 'success-msg' : 'error-msg'}>{msg}</p>}
          <button type="submit" className="btn-primary">Tạo danh mục</button>
        </form>
      </div>

      <div className="card">
        <h3 className="card-title">Danh sách danh mục</h3>
        {loading ? <div className="page-loading">Đang tải...</div> : (
          <table className="table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên</th>
                <th>Slug</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td>
                    {c.image
                      ? <img src={c.image} alt={c.name} className="product-thumb" />
                      : <div className="thumb-placeholder">📁</div>}
                  </td>
                  <td>{c.name}</td>
                  <td><code>{c.slug}</code></td>
                  <td>{new Date(c.createdAt).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Categories;
