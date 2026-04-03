require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Banner = require('../models/Banner');

const BANNERS = [
  {
    badge: 'Danganhshop × Ra mắt 2026',
    title: 'iPhone 17e',
    subtitle: 'Đủ tính năng. Đầy giá trị. Chỉ từ 17.990.000đ',
    ctaText: 'Mua ngay',
    ctaLink: '/dien-thoai',
    image: 'quang-cao-iphone-17e.webp',
    bgFrom: '#fce4ec',
    bgTo: '#f3e5f5',
    active: true,
    order: 0,
  },
  {
    badge: 'MacBook Air M3 — Siêu mỏng siêu nhẹ',
    title: 'MacBook Air M3',
    subtitle: 'Hiệu năng vượt trội, pin cả ngày. Từ 27.990.000đ',
    ctaText: 'Khám phá ngay',
    ctaLink: '/laptop',
    image: 'quang-cao-macbook-air.webp',
    bgFrom: '#e3f2fd',
    bgTo: '#ede7f6',
    active: true,
    order: 1,
  },
  {
    badge: 'Samsung Galaxy S26 — Flagship 2026',
    title: 'Galaxy S26 Ultra',
    subtitle: 'Camera AI 200MP. Chip Snapdragon 8 Elite. Từ 31.990.000đ',
    ctaText: 'Xem chi tiết',
    ctaLink: '/dien-thoai',
    image: 'quang-cao-samsung-s26.webp',
    bgFrom: '#e8f5e9',
    bgTo: '#e0f7fa',
    active: true,
    order: 2,
  },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Banner.deleteMany({});
  await Banner.insertMany(BANNERS);
  console.log('✅ Seeded', BANNERS.length, 'banners');
  await mongoose.disconnect();
})();
