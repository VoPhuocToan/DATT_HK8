require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Map tên sản phẩm (keyword) -> ảnh từ /public (frontend serve tại localhost:5173)
const IMAGE_MAP = [
  { keywords: ['iphone 17 pro'], images: ['/iphone-17-pro_1.webp', '/iphone-17-pro_2.webp', '/iphone-17-pro_3.webp'] },
  { keywords: ['iphone 17 air', 'iphone air'], images: ['/iphone-air-1.webp', '/iphone-air-2.webp', '/iphone-air-3.webp'] },
  { keywords: ['iphone 17'], images: ['/iphone-17_1.webp', '/iphone-17_2.webp', '/iphone-17_3.webp'] },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  const products = await Product.find({});
  let updated = 0;

  for (const product of products) {
    const nameLower = product.name.toLowerCase();
    for (const map of IMAGE_MAP) {
      if (map.keywords.some((kw) => nameLower.includes(kw))) {
        product.images = map.images;
        await product.save();
        console.log(`✅ Updated images: ${product.name}`);
        updated++;
        break;
      }
    }
  }

  console.log(`\nĐã cập nhật ${updated} sản phẩm.`);
  await mongoose.disconnect();
};

run().catch((err) => { console.error(err); process.exit(1); });
