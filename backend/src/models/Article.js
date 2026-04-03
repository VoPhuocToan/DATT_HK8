const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  category: { type: String, required: true, default: 'Tin tức' },
  excerpt: { type: String, default: '' },
  content: { type: String, default: '' }, // HTML content
  img: { type: String, default: '' },       // ảnh bìa (ảnh chính)
  images: [{ type: String }],               // tất cả ảnh upload
  mainImageIndex: { type: Number, default: 0 },
  author: { type: String, default: 'Đặng Anh' },
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: true },
  readTime: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);
