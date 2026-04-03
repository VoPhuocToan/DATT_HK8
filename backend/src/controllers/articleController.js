const Article = require('../models/Article');

const slugify = (text) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

// GET /articles — public, lấy bài đã published
const getArticles = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { published: true };
    if (req.query.category) filter.category = req.query.category;
    const articles = await Article.find(filter).sort({ createdAt: -1 });
    return res.json(articles);
  } catch (e) { return res.status(500).json({ message: e.message }); }
};

// GET /articles/:slug — public
const getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    if (!article) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    return res.json(article);
  } catch (e) { return res.status(500).json({ message: e.message }); }
};

// POST /articles — admin
const createArticle = async (req, res) => {
  try {
    const { title, category, excerpt, content, img, images, mainImageIndex, author, featured, published, readTime } = req.body;
    if (!title) return res.status(400).json({ message: 'Thiếu tiêu đề' });
    let slug = slugify(title);
    const existing = await Article.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;
    // Ảnh bìa = ảnh chính trong mảng images, hoặc img nếu không có
    const imgList = images || (img ? [img] : []);
    const idx = mainImageIndex || 0;
    const coverImg = imgList[idx] || img || '';
    const article = await Article.create({ title, slug, category, excerpt, content, img: coverImg, images: imgList, mainImageIndex: idx, author, featured, published, readTime });
    return res.status(201).json(article);
  } catch (e) { return res.status(500).json({ message: e.message }); }
};

// PUT /articles/:id — admin
const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    // Sync img từ images[mainImageIndex]
    if (req.body.images) {
      const idx = req.body.mainImageIndex ?? article.mainImageIndex ?? 0;
      req.body.img = req.body.images[idx] || req.body.img || article.img;
    }
    Object.assign(article, req.body);
    await article.save();
    return res.json(article);
  } catch (e) { return res.status(500).json({ message: e.message }); }
};

// DELETE /articles/:id — admin
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    await article.deleteOne();
    return res.json({ message: 'Đã xóa' });
  } catch (e) { return res.status(500).json({ message: e.message }); }
};

module.exports = { getArticles, getArticleBySlug, createArticle, updateArticle, deleteArticle };
