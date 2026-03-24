import { useState } from 'react';
import { Link } from 'react-router-dom';

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

const ARTICLES = [
  {
    id: 1,
    category: 'Đánh giá',
    categoryColor: '#e53e3e',
    title: 'Đánh giá iPhone 17 Pro Max: Chip A19 Pro mạnh nhất từ trước đến nay, camera nâng cấp vượt bậc',
    excerpt: 'iPhone 17 Pro Max mang đến chip A19 Pro với hiệu năng đột phá, hệ thống camera 48MP cải tiến và màn hình ProMotion 120Hz sắc nét hơn bao giờ hết...',
    author: 'Đặng Anh',
    date: '24/03/2026 10:32',
    img: '/iphone-17-pro_1.webp',
    featured: true,
  },
  {
    id: 2,
    category: 'Tin tức',
    categoryColor: '#2563eb',
    title: 'Samsung Galaxy Z Fold 7 ra mắt: Màn hình gập 7.6 inch, chip Snapdragon 8 Elite, giá từ 39 triệu',
    excerpt: 'Samsung chính thức trình làng Galaxy Z Fold 7 với thiết kế mỏng hơn, màn hình lớn hơn và hiệu năng mạnh mẽ hơn thế hệ trước...',
    author: 'Minh Tuấn',
    date: '24/03/2026 09:15',
    img: '/samsung-galaxy-z-fold-7-1.webp',
    featured: false,
  },
  {
    id: 3,
    category: 'Mở hộp',
    categoryColor: '#7c3aed',
    title: 'Mở hộp MacBook Pro M5: Hiệu năng "quái vật", pin 22 giờ, xứng đáng từng đồng',
    excerpt: 'MacBook Pro M5 vừa về tay, cùng trải nghiệm ngay chiếc laptop mạnh nhất của Apple với chip M5 thế hệ mới...',
    author: 'Jay Nguyen',
    date: '23/03/2026 17:47',
    img: '/apple-macbook-m5-1.webp',
    featured: false,
  },
  {
    id: 4,
    category: 'Cận cảnh',
    categoryColor: '#d97706',
    title: 'Cận cảnh Apple Watch Ultra 2: Vỏ titan sang trọng, pin 60 giờ, dành cho người yêu thể thao',
    excerpt: 'Apple Watch Ultra 2 với thiết kế titan cao cấp, màn hình 49mm sáng nhất và pin lên đến 60 giờ là lựa chọn hoàn hảo cho dân thể thao...',
    author: 'Hải Trần',
    date: '23/03/2026 16:56',
    img: '/apple-watch-ultra-1.webp',
    featured: false,
  },
  {
    id: 5,
    category: 'Đánh giá',
    categoryColor: '#e53e3e',
    title: 'Đánh giá Xiaomi 17 Ultra: Camera Leica 200MP, sạc 90W, đối thủ xứng tầm iPhone 17 Pro',
    excerpt: 'Xiaomi 17 Ultra với hệ thống camera Leica 200MP và sạc siêu nhanh 90W đang là cái tên đáng chú ý nhất phân khúc flagship Android...',
    author: 'Đặng Anh',
    date: '22/03/2026 14:20',
    img: '/dien-thoai-xiaomi-17-ultra-1.webp',
    featured: false,
  },
  {
    id: 6,
    category: 'Tin tức',
    categoryColor: '#2563eb',
    title: 'Huawei Watch GT 10 ra mắt: Pin 14 ngày, theo dõi sức khỏe AI, giá chỉ 6.490.000đ',
    excerpt: 'Huawei Watch GT 10 gây ấn tượng với thời lượng pin lên đến 14 ngày và các tính năng theo dõi sức khỏe được hỗ trợ bởi AI...',
    author: 'Minh Tuấn',
    date: '22/03/2026 11:05',
    img: '/huawai-watch-gt-10-1.webp',
    featured: false,
  },
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
