import { useParams, Link, useNavigate } from 'react-router-dom';
import { ARTICLES } from '../data/articles';

const BlogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = ARTICLES.find((a) => a.id === Number(id));
  const related = ARTICLES.filter((a) => a.id !== Number(id)).slice(0, 3);

  if (!article) {
    return (
      <div className="bdet-notfound">
        <div style={{ fontSize: 48 }}>📄</div>
        <h2>Bài viết không tồn tại</h2>
        <Link to="/blog" className="btn">← Quay lại trang bài viết</Link>
      </div>
    );
  }

  return (
    <div className="bdet-page">
      {/* ── Layout chính ── */}
      <div className="bdet-layout">
        {/* ── Nội dung bài viết ── */}
        <article className="bdet-article">
          {/* Breadcrumb */}
          <nav className="bdet-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>›</span>
            <Link to="/blog">Bài viết</Link>
            <span>›</span>
            <span>{article.category}</span>
          </nav>

          {/* Header */}
          <div className="bdet-header">
            <span className="blog-cat-badge" style={{ background: article.categoryColor }}>
              {article.category}
            </span>
            <h1 className="bdet-title">{article.title}</h1>
            <div className="bdet-meta">
              <span>👤 {article.author}</span>
              <span>🕐 {article.date}</span>
              <span>📖 {article.readTime}</span>
            </div>
          </div>

          {/* Ảnh bìa */}
          <img src={article.img} alt={article.title} className="bdet-cover" />

          {/* Nội dung */}
          <div className="bdet-content">
            {article.content.map((block, i) => {
              if (block.type === 'paragraph') {
                return <p key={i} className="bdet-paragraph">{block.text}</p>;
              }
              if (block.type === 'heading') {
                return <h2 key={i} className="bdet-heading">{block.text}</h2>;
              }
              if (block.type === 'image') {
                return (
                  <figure key={i} className="bdet-figure">
                    <img src={block.src} alt={block.caption} className="bdet-img" />
                    {block.caption && <figcaption className="bdet-caption">{block.caption}</figcaption>}
                  </figure>
                );
              }
              if (block.type === 'list') {
                return (
                  <ul key={i} className="bdet-list">
                    {block.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                );
              }
              if (block.type === 'verdict') {
                return (
                  <div key={i} className="bdet-verdict">
                    <h3 className="bdet-verdict-title">Kết luận</h3>
                    <div className="bdet-verdict-body">
                      <div className="bdet-verdict-col">
                        <div className="bdet-verdict-label bdet-pros-label">✅ Ưu điểm</div>
                        <ul className="bdet-verdict-list">
                          {block.pros.map((p, j) => <li key={j}>{p}</li>)}
                        </ul>
                      </div>
                      <div className="bdet-verdict-col">
                        <div className="bdet-verdict-label bdet-cons-label">❌ Nhược điểm</div>
                        <ul className="bdet-verdict-list">
                          {block.cons.map((c, j) => <li key={j}>{c}</li>)}
                        </ul>
                      </div>
                      <div className="bdet-score-wrap">
                        <div className="bdet-score-num">{block.score}</div>
                        <div className="bdet-score-label">/ 10</div>
                        <div className="bdet-score-text">Điểm đánh giá</div>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Tags & Share */}
          <div className="bdet-footer">
            <div className="bdet-tags">
              <span className="bdet-tag-label">Chủ đề:</span>
              <span className="bdet-tag">{article.category}</span>
              <span className="bdet-tag">Công nghệ</span>
              <span className="bdet-tag">Review</span>
            </div>
            <div className="bdet-share">
              <span>Chia sẻ:</span>
              <button className="bdet-share-btn bdet-fb">Facebook</button>
              <button className="bdet-share-btn bdet-tw">Twitter</button>
            </div>
          </div>

          {/* Điều hướng bài trước/sau */}
          <div className="bdet-nav">
            <button
              className="bdet-nav-btn"
              onClick={() => navigate(`/blog/${Math.max(1, article.id - 1)}`)}
              disabled={article.id <= 1}
            >
              ← Bài trước
            </button>
            <Link to="/blog" className="bdet-nav-btn bdet-nav-center">Danh sách bài viết</Link>
            <button
              className="bdet-nav-btn"
              onClick={() => navigate(`/blog/${Math.min(ARTICLES.length, article.id + 1)}`)}
              disabled={article.id >= ARTICLES.length}
            >
              Bài tiếp →
            </button>
          </div>
        </article>

        {/* ── Sidebar ── */}
        <aside className="bdet-sidebar">
          <div className="bdet-sidebar-block">
            <h3 className="bdet-sidebar-title">Bài viết liên quan</h3>
            <div className="bdet-related-list">
              {related.map((a) => (
                <Link key={a.id} to={`/blog/${a.id}`} className="bdet-related-item">
                  <img src={a.img} alt={a.title} className="bdet-related-img" />
                  <div className="bdet-related-info">
                    <span className="blog-cat-badge" style={{ background: a.categoryColor, fontSize: 10 }}>
                      {a.category}
                    </span>
                    <p className="bdet-related-title">{a.title}</p>
                    <span className="bdet-related-date">🕐 {a.date}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bdet-sidebar-block">
            <h3 className="bdet-sidebar-title">Danh mục</h3>
            {['Đánh giá', 'Tin tức', 'Mở hộp', 'Cận cảnh', 'Thủ thuật'].map((c) => (
              <Link key={c} to="/blog" className="bdet-cat-link">
                <span>{c}</span>
                <span className="bdet-cat-count">
                  {ARTICLES.filter((a) => a.category === c).length}
                </span>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BlogDetailPage;
