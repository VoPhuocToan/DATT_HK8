import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUrl';
import { IconUser, IconClock, IconBook, IconLoader, IconFileText } from '../components/Icons';

const CAT_COLORS = { 'Đánh giá': '#e53e3e', 'Tin tức': '#2563eb', 'Mở hộp': '#7c3aed', 'Cận cảnh': '#d97706', 'Thủ thuật': '#059669' };

const BlogDetailPage = () => {
  const { id } = useParams(); // id là slug
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    api.get(`/articles/${id}`)
      .then(({ data }) => {
        setArticle(data);
        // Load related
        api.get('/articles').then(({ data: all }) => {
          setRelated(all.filter((a) => a.slug !== id).slice(0, 3));
        });
      })
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="bdet-notfound"><div style={{ fontSize: 48 }}><IconLoader size={48} /></div><p>Đang tải...</p></div>;

  if (!article) return (
    <div className="bdet-notfound">
      <div style={{ fontSize: 48 }}><IconFileText size={48} /></div>
      <h2>Bài viết không tồn tại</h2>
      <Link to="/blog" className="btn">← Quay lại trang bài viết</Link>
    </div>
  );

  const catColor = CAT_COLORS[article.category] || '#64748b';

  return (
    <div className="bdet-page">
      <div className="bdet-layout">
        <article className="bdet-article">
          <nav className="bdet-breadcrumb">
            <Link to="/">Trang chủ</Link><span>›</span>
            <Link to="/blog">Bài viết</Link><span>›</span>
            <span>{article.category}</span>
          </nav>

          <div className="bdet-header">
            <span className="blog-cat-badge" style={{ background: catColor }}>{article.category}</span>
            <h1 className="bdet-title">{article.title}</h1>
            <div className="bdet-meta">
              <span><IconUser size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />{article.author}</span>
              <span><IconClock size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />{new Date(article.createdAt).toLocaleDateString('vi-VN')}</span>
              {article.readTime && <span><IconBook size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />{article.readTime}</span>}
            </div>
          </div>

          {article.img && <img src={getImageUrl(article.img)} alt={article.title} className="bdet-cover" />}

          {/* Render HTML content */}
          <div className="bdet-content" dangerouslySetInnerHTML={{ __html: article.content }} />

          <div className="bdet-footer">
            <div className="bdet-tags">
              <span className="bdet-tag-label">Chủ đề:</span>
              <span className="bdet-tag">{article.category}</span>
              <span className="bdet-tag">Công nghệ</span>
            </div>
          </div>
        </article>

        <aside className="bdet-sidebar">
          <div className="bdet-sidebar-block">
            <h3 className="bdet-sidebar-title">Bài viết liên quan</h3>
            <div className="bdet-related-list">
              {related.map((a) => (
                <Link key={a._id} to={`/blog/${a.slug}`} className="bdet-related-item">
                  <img src={getImageUrl(a.img)} alt={a.title} className="bdet-related-img" />
                  <div className="bdet-related-info">
                    <span className="blog-cat-badge" style={{ background: CAT_COLORS[a.category] || '#64748b', fontSize: 10 }}>{a.category}</span>
                    <p className="bdet-related-title">{a.title}</p>
                    <span className="bdet-related-date"><IconClock size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />{new Date(a.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BlogDetailPage;
