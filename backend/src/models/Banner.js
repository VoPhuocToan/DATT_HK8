const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  badge: { type: String, default: '' },         // dòng nhỏ phía trên
  title: { type: String, required: true },       // tiêu đề lớn
  subtitle: { type: String, default: '' },       // mô tả
  ctaText: { type: String, default: 'Mua ngay' },
  ctaLink: { type: String, default: '/' },
  image: { type: String, default: '' },          // ảnh sản phẩm bên phải
  bgFrom: { type: String, default: '#ffe0ef' },  // màu gradient start
  bgTo: { type: String, default: '#f8f2ff' },    // màu gradient end
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
