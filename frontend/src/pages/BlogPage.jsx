import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ARTICLES } from '../data/articles';

/* ── Mock data ── */
const HOT_TOPICS = [
  { id: 1, tag: '#OPPO Find N6',        img: '/oppo-find-n6-1.webp' },
  { id: 2, tag: '#Samsung Galaxy S26',  img: '/samsung-galaxy-s26-ultra-1.webp' },
  { id: 3, tag: '#Apple MacBook M5',    img: '/apple-macbook-m5-1.webp' },
  { id: 4, tag: '#Xiaomi 17 Ultra',     img: '/dien-thoai-xiaomi-17-ultra-1.webp' },
  { id: 5, tag: '#iPhone 17 Pro Max',   img: '/iphone-17-pro_1.webp' },
  { id: 6, tag: '#Apple Watch Ultra',   img: '/apple-watch-ultra-1.webp' },
  { id: 7, tag: '#Samsung Z Fold 7',    img: '/samsung-galaxy-z-fold-7-1.webp' },
  { id: 8, tag: '#Huawei Watch GT 10',  img: '/huawai-watch-gt-10-1.webp' },
];

const CATEGORIES = ['Tất cả', 'Đánh giá', 'Tin tức', 'Mở hộp', 'Cận cảnh', 'Thủ thuật'];

const BlogPage = () => {
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const featured = ARTICLES.find((a) => a.featured);
  const sideArticles = ARTICLES.filter((a) => !a.featured).slice(0, 3);
  const filtered = activeCategory === 'Tất cả'
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === activeCategory);

  return (
    <div className="blog-page">

      {/* ── Chủ đề hot ── */}
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

      {/* ── Nổi bật nhất ── */}
      <section className="blog-section">
        <h2 className="blog-section-heading">NỔI BẬT NHẤT</h2>
        <div className="blog-featured-layout">
          {/* Bài chính */}
          {featured && (
            <Link to={`/blog/${featured.id}`} className="blog-featured-main">
              <img src={featured.img} alt={featured.title} className="blog-featured-img" />
              <div className="blog-featured-overlay">
                <span className="blog-cat-badge" style={{ background: featured.categoryColor }}>
                  {featured.category}
                </span>
                <h3 className="blog-featured-title">{featured.title}</h3>
                <p className="blog-featured-excerpt">{featured.excerpt}</p>
                <div className="blog-meta">
                  <span>👤 {featured.author}</span>
                  <span>🕐 {featured.date}</span>
                </div>
              </div>
            </Link>
          )}

          {/* Bài phụ bên phải */}
          <div className="blog-featured-side">
            {sideArticles.map((a) => (
              <Link key={a.id} to={`/blog/${a.id}`} className="blog-side-item">
                <img src={a.img} alt={a.title} className="blog-side-img" />
                <div className="blog-side-info">
                  <h4 className="blog-side-title">{a.title}</h4>
                  <div className="blog-meta">
                    <span>👤 {a.author}</span>
                    <span>🕐 {a.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tất cả bài viết ── */}
      <section className="blog-section">
        <div className="blog-all-header">
          <h2 className="blog-section-heading" style={{ marginBottom: 0 }}>TẤT CẢ BÀI VIẾT</h2>
          <div className="blog-cat-tabs">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`blog-cat-tab ${activeCategory === c ? 'active' : ''}`}
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="blog-grid">
          {filtered.map((a) => (
            <Link key={a.id} to={`/blog/${a.id}`} className="blog-card">
              <div className="blog-card-img-wrap">
                <img src={a.img} alt={a.title} className="blog-card-img" />
                <span className="blog-cat-badge blog-card-badge" style={{ background: a.categoryColor }}>
                  {a.category}
                </span>
              </div>
              <div className="blog-card-body">
                <h3 className="blog-card-title">{a.title}</h3>
                <p className="blog-card-excerpt">{a.excerpt}</p>
                <div className="blog-meta">
                  <span>👤 {a.author}</span>
                  <span>🕐 {a.date}</span>
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
