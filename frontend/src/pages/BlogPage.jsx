import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUrl';
import { IconUser, IconClock } from '../components/Icons';

const CAT_COLORS = { 'Đánh giá': '#e53e3e', 'Tin tức': '#2563eb', 'Mở hộp': '#7c3aed', 'Cận cảnh': '#d97706', 'Thủ thuật': '#059669' };

const HOT_TOPICS = [
  { id: 1, tag: '#iPhone 17 Pro Max', img: '/iphone-17-pro_1.webp' },
  { id: 2, tag: '#Samsung Galaxy S26', img: '/samsung-galaxy-s26-ultra-1.webp' },
  { id: 3, tag: '#Apple MacBook M5', img: '/apple-macbook-m5-1.webp' },
  { id: 4, tag: '#Xiaomi 17 Ultra', img: '/dien-thoai-xiaomi-17-ultra-1.webp' },
  { id: 5, tag: '#Apple Watch Ultra', img: '/apple-watch-ultra-1.webp' },
  { id: 6, tag: '#Samsung Z Fold 7', img: '/samsung-galaxy-z-fold-7-1.webp' },
];

const CATEGORIES = ['Tất cả', 'Đánh giá', 'Tin tức', 'Mở hộp', 'Cận cảnh', 'Thủ thuật'];

const BlogPage = () => {
  const [articles, setArticles] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  useEffect(() => {
    api.get('/articles').then(({ data }) => setArticles(data)).catch(() => {});
  }, []);

  const featured = articles.find((a) => a.featured);
  const sideArticles = articles.filter((a) => !a.featured).slice(0, 3);
  const filtered = activeCategory === 'Tất cả' ? articles : articles.filter((a) => a.category === activeCategory);

  return (
    <div className="blog-page">
      <section className="blog-section">
        <h2 className="blog-section-heading">CHỦ ĐỀ HOT</h2>
        <div className="blog-topics-scroll">
          {HOT_TOPICS.map((t) => (
            <div key={t.id} className="blog-topic-card">
              <img src={t.img} alt={t.tag} className="blog-topic-img" />
              <span className="blog-topic-tag">{t.tag}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="blog-section">
        <h2 className="blog-section-heading">NỔI BẬT NHẤT</h2>
        <div className="blog-featured-layout">
          {featured && (
            <Link to={`/blog/${featured.slug}`} className="blog-featured-main">
              <img src={getImageUrl(featured.img)} alt={featured.title} className="blog-featured-img" />
              <div className="blog-featured-overlay">
                <span className="blog-cat-badge" style={{ background: CAT_COLORS[featured.category] || '#64748b' }}>{featured.category}</span>
                <h3 className="blog-featured-title">{featured.title}</h3>
                <p className="blog-featured-excerpt">{featured.excerpt}</p>
                <div className="blog-meta">
                  <span><IconUser size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{featured.author}</span>
                  <span><IconClock size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{new Date(featured.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </Link>
          )}
          <div className="blog-featured-side">
            {sideArticles.map((a) => (
              <Link key={a._id} to={`/blog/${a.slug}`} className="blog-side-item">
                <img src={getImageUrl(a.img)} alt={a.title} className="blog-side-img" />
                <div className="blog-side-info">
                  <h4 className="blog-side-title">{a.title}</h4>
                  <div className="blog-meta">
                    <span><IconUser size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{a.author}</span>
                    <span><IconClock size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{new Date(a.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="blog-section">
        <div className="blog-all-header">
          <h2 className="blog-section-heading" style={{ marginBottom: 0 }}>TẤT CẢ BÀI VIẾT</h2>
          <div className="blog-cat-tabs">
            {CATEGORIES.map((c) => (
              <button key={c} className={`blog-cat-tab ${activeCategory === c ? 'active' : ''}`} onClick={() => setActiveCategory(c)}>{c}</button>
            ))}
          </div>
        </div>
        <div className="blog-grid">
          {filtered.map((a) => (
            <Link key={a._id} to={`/blog/${a.slug}`} className="blog-card">
              <div className="blog-card-img-wrap">
                <img src={getImageUrl(a.img)} alt={a.title} className="blog-card-img" />
                <span className="blog-cat-badge blog-card-badge" style={{ background: CAT_COLORS[a.category] || '#64748b' }}>{a.category}</span>
              </div>
              <div className="blog-card-body">
                <h3 className="blog-card-title">{a.title}</h3>
                <p className="blog-card-excerpt">{a.excerpt}</p>
                <div className="blog-meta">
                  <span><IconUser size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{a.author}</span>
                  <span><IconClock size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />{new Date(a.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
