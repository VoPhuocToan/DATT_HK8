require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Variants theo slug
const variants = {
  // ── iPHONE 17 series ──
  'iphone-17-pro-max-256gb': {
    colors: ['Titan Đen', 'Titan Trắng', 'Titan Sa Mạc', 'Titan Tự Nhiên'],
    storageOptions: [{ ram: '8GB', rom: '256GB' }, { ram: '8GB', rom: '512GB' }, { ram: '8GB', rom: '1TB' }],
  },
  'iphone-17-pro-128gb': {
    colors: ['Titan Đen', 'Titan Trắng', 'Titan Sa Mạc', 'Titan Tự Nhiên'],
    storageOptions: [{ ram: '8GB', rom: '128GB' }, { ram: '8GB', rom: '256GB' }, { ram: '8GB', rom: '512GB' }],
  },
  'iphone-17-air-128gb': {
    colors: ['Trắng', 'Đen', 'Xanh Dương', 'Hồng', 'Vàng'],
    storageOptions: [{ ram: '8GB', rom: '128GB' }, { ram: '8GB', rom: '256GB' }],
  },
  'iphone-17-256gb': {
    colors: ['Đen', 'Trắng', 'Hồng', 'Xanh Lá', 'Xanh Dương', 'Vàng'],
    storageOptions: [{ ram: '8GB', rom: '128GB' }, { ram: '8GB', rom: '256GB' }, { ram: '8GB', rom: '512GB' }],
  },
  'iphone-17-128gb': {
    colors: ['Đen', 'Trắng', 'Hồng', 'Xanh Lá', 'Xanh Dương', 'Vàng'],
    storageOptions: [{ ram: '8GB', rom: '128GB' }, { ram: '8GB', rom: '256GB' }],
  },
  'iphone-17e-128gb': {
    colors: ['Đen', 'Trắng', 'Đỏ'],
    storageOptions: [{ ram: '6GB', rom: '128GB' }, { ram: '6GB', rom: '256GB' }],
  },

  // ── iPHONE 16 series ──
  'iphone-16-pro-max-256gb': {
    colors: ['Titan Đen', 'Titan Trắng', 'Titan Sa Mạc', 'Titan Tự Nhiên'],
    storageOptions: [{ ram: '8GB', rom: '256GB' }, { ram: '8GB', rom: '512GB' }, { ram: '8GB', rom: '1TB' }],
  },
  'iphone-16-pro-128gb': {
    colors: ['Titan Đen', 'Titan Trắng', 'Titan Sa Mạc', 'Titan Tự Nhiên'],
    storageOptions: [{ ram: '8GB', rom: '128GB' }, { ram: '8GB', rom: '256GB' }, { ram: '8GB', rom: '512GB' }],
  },
  'iphone-16e-128gb': {
    colors: ['Đen', 'Trắng'],
    storageOptions: [{ ram: '6GB', rom: '128GB' }, { ram: '6GB', rom: '256GB' }],
  },

  // ── SAMSUNG Galaxy S series ──
  'samsung-galaxy-s26-ultra-256gb': {
    colors: ['Titan Đen', 'Titan Xám', 'Titan Xanh', 'Titan Bạc'],
    storageOptions: [{ ram: '12GB', rom: '256GB' }, { ram: '12GB', rom: '512GB' }, { ram: '12GB', rom: '1TB' }],
  },
  'samsung-galaxy-s26-256gb': {
    colors: ['Đen Onyx', 'Bạc Icy', 'Xanh Navy', 'Hồng Blush'],
    storageOptions: [{ ram: '8GB', rom: '256GB' }, { ram: '12GB', rom: '256GB' }, { ram: '12GB', rom: '512GB' }],
  },
  'samsung-galaxy-s25-ultra-256gb': {
    colors: ['Titan Đen', 'Titan Xám', 'Titan Xanh', 'Titan Bạc'],
    storageOptions: [{ ram: '12GB', rom: '256GB' }, { ram: '12GB', rom: '512GB' }, { ram: '12GB', rom: '1TB' }],
  },
  'samsung-galaxy-z-fold-7-256gb': {
    colors: ['Đen', 'Bạc', 'Xanh Navy'],
    storageOptions: [{ ram: '12GB', rom: '256GB' }, { ram: '12GB', rom: '512GB' }, { ram: '12GB', rom: '1TB' }],
  },
  'samsung-galaxy-z-flip-7-256gb': {
    colors: ['Vàng', 'Xanh Mint', 'Đen', 'Trắng', 'Hồng'],
    storageOptions: [{ ram: '8GB', rom: '256GB' }, { ram: '8GB', rom: '512GB' }],
  },
  'samsung-galaxy-a26-128gb': {
    colors: ['Đen', 'Trắng', 'Xanh Dương', 'Vàng Đồng'],
    storageOptions: [{ ram: '6GB', rom: '128GB' }, { ram: '8GB', rom: '128GB' }, { ram: '8GB', rom: '256GB' }],
  },
  'samsung-galaxy-m55-128gb': {
    colors: ['Xanh Dương', 'Xanh Lá', 'Đen'],
    storageOptions: [{ ram: '8GB', rom: '128GB' }, { ram: '8GB', rom: '256GB' }],
  },

  // ── XIAOMI ──
  'xiaomi-17-ultra-256gb': {
    colors: ['Đen', 'Trắng', 'Xanh Dương'],
    storageOptions: [{ ram: '12GB', rom: '256GB' }, { ram: '16GB', rom: '512GB' }, { ram: '16GB', rom: '1TB' }],
  },
  'xiaomi-15-256gb': {
    colors: ['Đen', 'Trắng', 'Xanh Lá'],
    storageOptions: [{ ram: '12GB', rom: '256GB' }, { ram: '16GB', rom: '512GB' }],
  },
  'xiaomi-15t-5g-256gb': {
    colors: ['Đen', 'Bạc', 'Xanh Dương'],
    storageOptions: [{ ram: '8GB', rom: '256GB' }, { ram: '12GB', rom: '256GB' }, { ram: '12GB', rom: '512GB' }],
  },
  'xiaomi-redmi-note-15-256gb': {
    colors: ['Đen', 'Xanh Dương', 'Tím', 'Vàng'],
    storageOptions: [{ ram: '8GB', rom: '256GB' }, { ram: '8GB', rom: '512GB' }],
  },
  'xiaomi-redmi-note-14-256gb': {
    colors: ['Đen', 'Xanh Dương', 'Tím', 'Bạc'],
    storageOptions: [{ ram: '8GB', rom: '256GB' }, { ram: '8GB', rom: '512GB' }],
  },
  'xiaomi-redmi-note-13-256gb': {
    colors: ['Đen', 'Xanh Dương', 'Xanh Lá', 'Vàng'],
    storageOptions: [{ ram: '8GB', rom: '256GB' }],
  },
  'xiaomi-redmi-note-12-128gb': {
    colors: ['Đen', 'Xanh Dương', 'Trắng'],
    storageOptions: [{ ram: '6GB', rom: '128GB' }, { ram: '8GB', rom: '256GB' }],
  },

  // ── OPPO ──
  'oppo-find-x9-256gb': {
    colors: ['Đen', 'Trắng', 'Xanh Dương'],
    storageOptions: [{ ram: '12GB', rom: '256GB' }, { ram: '16GB', rom: '512GB' }],
  },
  'oppo-find-x8-256gb': {
    colors: ['Đen', 'Trắng', 'Xanh Dương'],
    storageOptions: [{ ram: '12GB', rom: '256GB' }, { ram: '16GB', rom: '512GB' }],
  },
  'oppo-find-n6-256gb': {
    colors: ['Đen', 'Trắng'],
    storageOptions: [{ ram: '12GB', rom: '256GB' }, { ram: '16GB', rom: '512GB' }],
  },
  'oppo-reno15-5g-256gb': {
    colors: ['Đen', 'Trắng', 'Tím', 'Xanh Dương'],
    storageOptions: [{ ram: '8GB', rom: '256GB' }, { ram: '12GB', rom: '256GB' }],
  },
  'oppo-a3-128gb': {
    colors: ['Đen', 'Xanh Dương', 'Tím', 'Vàng'],
    storageOptions: [{ ram: '6GB', rom: '128GB' }, { ram: '8GB', rom: '256GB' }],
  },

  // ── LAPTOP APPLE ──
  'macbook-pro-m5-16gb-512gb': {
    colors: ['Bạc', 'Đen Vũ Trụ'],
    storageOptions: [{ ram: '16GB', rom: '512GB' }, { ram: '24GB', rom: '512GB' }, { ram: '24GB', rom: '1TB' }, { ram: '32GB', rom: '1TB' }],
  },
  'macbook-pro-m4-16gb-512gb': {
    colors: ['Bạc', 'Đen Vũ Trụ'],
    storageOptions: [{ ram: '16GB', rom: '512GB' }, { ram: '24GB', rom: '512GB' }, { ram: '24GB', rom: '1TB' }, { ram: '32GB', rom: '1TB' }],
  },
  'macbook-air-m2-8gb-256gb': {
    colors: ['Bạc', 'Xám Vũ Trụ', 'Vàng Ánh Sao', 'Xanh Giữa Đêm'],
    storageOptions: [{ ram: '8GB', rom: '256GB' }, { ram: '8GB', rom: '512GB' }, { ram: '16GB', rom: '512GB' }, { ram: '16GB', rom: '1TB' }],
  },

  // ── LAPTOP ASUS ──
  'asus-tuf-gaming-a15-2024': {
    colors: ['Xám Graphite', 'Đen'],
    storageOptions: [{ ram: '16GB', rom: '512GB' }, { ram: '16GB', rom: '1TB' }, { ram: '32GB', rom: '1TB' }],
  },
  'asus-tuf-gaming-f16-2024': {
    colors: ['Xám Graphite', 'Đen'],
    storageOptions: [{ ram: '16GB', rom: '512GB' }, { ram: '16GB', rom: '1TB' }, { ram: '32GB', rom: '1TB' }],
  },
  'asus-vivobook-14-2024': {
    colors: ['Bạc', 'Đen', 'Xanh Dương', 'Hồng'],
    storageOptions: [{ ram: '8GB', rom: '512GB' }, { ram: '16GB', rom: '512GB' }, { ram: '16GB', rom: '1TB' }],
  },
  'asus-vivobook-16x-2024': {
    colors: ['Bạc', 'Đen'],
    storageOptions: [{ ram: '16GB', rom: '512GB' }, { ram: '16GB', rom: '1TB' }, { ram: '32GB', rom: '1TB' }],
  },

  // ── LAPTOP LENOVO ──
  'lenovo-loq-15-2024': {
    colors: ['Xám', 'Đen'],
    storageOptions: [{ ram: '16GB', rom: '512GB' }, { ram: '16GB', rom: '1TB' }, { ram: '32GB', rom: '1TB' }],
  },
  'lenovo-ideapad-5-15-2024': {
    colors: ['Xám', 'Xanh Dương', 'Bạc'],
    storageOptions: [{ ram: '8GB', rom: '512GB' }, { ram: '16GB', rom: '512GB' }, { ram: '16GB', rom: '1TB' }],
  },
  'lenovo-thinkpad-e14-gen5': {
    colors: ['Đen'],
    storageOptions: [{ ram: '16GB', rom: '512GB' }, { ram: '16GB', rom: '1TB' }, { ram: '32GB', rom: '1TB' }],
  },

  // ── LAPTOP MSI ──
  'msi-gaming-thin-15-2024': {
    colors: ['Đen'],
    storageOptions: [{ ram: '16GB', rom: '512GB' }, { ram: '16GB', rom: '1TB' }, { ram: '32GB', rom: '1TB' }],
  },
  'msi-modern-14-2024': {
    colors: ['Bạc', 'Đen', 'Trắng'],
    storageOptions: [{ ram: '8GB', rom: '512GB' }, { ram: '16GB', rom: '512GB' }, { ram: '16GB', rom: '1TB' }],
  },
  'msi-prestige-13-ai-2024': {
    colors: ['Bạc', 'Đen'],
    storageOptions: [{ ram: '32GB', rom: '1TB' }, { ram: '32GB', rom: '2TB' }],
  },

  // ── LAPTOP GIGABYTE ──
  'gigabyte-aorus-16x-2024': {
    colors: ['Đen'],
    storageOptions: [{ ram: '32GB', rom: '1TB' }, { ram: '32GB', rom: '2TB' }],
  },
  'gigabyte-aero-x16-2024': {
    colors: ['Bạc', 'Đen'],
    storageOptions: [{ ram: '32GB', rom: '2TB' }],
  },
  'gigabyte-gaming-a16-2024': {
    colors: ['Đen'],
    storageOptions: [{ ram: '16GB', rom: '512GB' }, { ram: '16GB', rom: '1TB' }, { ram: '32GB', rom: '1TB' }],
  },

  // ── SMARTWATCH (chỉ màu sắc) ──
  'apple-watch-series-11': { colors: ['Đen', 'Bạc', 'Vàng', 'Hồng', 'Xanh Dương'] },
  'apple-watch-se-2024': { colors: ['Đen', 'Bạc', 'Vàng'] },
  'apple-watch-ultra-2': { colors: ['Titan Tự Nhiên', 'Titan Đen', 'Titan Trắng'] },
  'samsung-galaxy-watch-8': { colors: ['Đen', 'Bạc', 'Vàng', 'Xanh Dương'] },
  'samsung-galaxy-watch-7': { colors: ['Đen', 'Bạc', 'Xanh Lá', 'Vàng'] },
  'samsung-galaxy-watch-ultra': { colors: ['Titan Trắng', 'Titan Đen', 'Titan Cam'] },
  'huawei-watch-gt-10': { colors: ['Đen', 'Bạc', 'Nâu'] },
  'huawei-watch-fit-4': { colors: ['Đen', 'Trắng', 'Hồng', 'Xanh Dương'] },
  'huawei-band-10': { colors: ['Đen', 'Trắng', 'Hồng', 'Xanh Dương', 'Vàng'] },
  'xiaomi-watch-s4': { colors: ['Đen', 'Bạc', 'Vàng'] },
  'xiaomi-watch-5-active': { colors: ['Đen', 'Trắng', 'Xanh Dương'] },
  'xiaomi-watch-band-9': { colors: ['Đen', 'Trắng', 'Hồng', 'Xanh Dương', 'Vàng', 'Tím'] },

  // ── TABLET ──
  'ipad-pro-m5-11': {
    colors: ['Bạc', 'Đen Vũ Trụ'],
    storageOptions: [{ ram: '8GB', rom: '256GB' }, { ram: '8GB', rom: '512GB' }, { ram: '16GB', rom: '1TB' }, { ram: '16GB', rom: '2TB' }],
  },
  'ipad-air-11-m3': {
    colors: ['Bạc', 'Xanh Dương', 'Tím', 'Vàng Ánh Sao'],
    storageOptions: [{ ram: '8GB', rom: '128GB' }, { ram: '8GB', rom: '256GB' }, { ram: '8GB', rom: '512GB' }],
  },
  'ipad-mini-7': {
    colors: ['Bạc', 'Xanh Dương', 'Tím', 'Vàng Ánh Sao'],
    storageOptions: [{ ram: '8GB', rom: '128GB' }, { ram: '8GB', rom: '256GB' }, { ram: '8GB', rom: '512GB' }],
  },
  'ipad-a16-10-9': {
    colors: ['Bạc', 'Xanh Dương', 'Hồng', 'Vàng'],
    storageOptions: [{ ram: '4GB', rom: '128GB' }, { ram: '4GB', rom: '256GB' }],
  },
  'xiaomi-pad-8-pro': {
    colors: ['Xám', 'Xanh Dương'],
    storageOptions: [{ ram: '8GB', rom: '256GB' }, { ram: '12GB', rom: '256GB' }, { ram: '12GB', rom: '512GB' }],
  },
  'xiaomi-pad-mini': {
    colors: ['Xám', 'Xanh Dương', 'Hồng'],
    storageOptions: [{ ram: '4GB', rom: '128GB' }, { ram: '6GB', rom: '128GB' }],
  },
  'lenovo-tab-plus': {
    colors: ['Xám', 'Xanh Dương'],
    storageOptions: [{ ram: '8GB', rom: '128GB' }, { ram: '8GB', rom: '256GB' }],
  },
  'samsung-galaxy-tab-s11': {
    colors: ['Đen', 'Bạc', 'Xanh Dương'],
    storageOptions: [{ ram: '12GB', rom: '256GB' }, { ram: '12GB', rom: '512GB' }],
  },
  'samsung-galaxy-tab-s10-fe': {
    colors: ['Đen', 'Bạc', 'Xanh Dương', 'Xanh Lá'],
    storageOptions: [{ ram: '8GB', rom: '128GB' }, { ram: '8GB', rom: '256GB' }],
  },
  'samsung-galaxy-tab-s9': {
    colors: ['Đen', 'Bạc', 'Kem'],
    storageOptions: [{ ram: '8GB', rom: '128GB' }, { ram: '8GB', rom: '256GB' }, { ram: '12GB', rom: '512GB' }],
  },
  'samsung-galaxy-tab-a11': {
    colors: ['Đen', 'Bạc', 'Xanh Dương'],
    storageOptions: [{ ram: '4GB', rom: '64GB' }, { ram: '4GB', rom: '128GB' }],
  },
  'samsung-galaxy-tab-a11-plus': {
    colors: ['Đen', 'Bạc'],
    storageOptions: [{ ram: '6GB', rom: '128GB' }, { ram: '6GB', rom: '256GB' }],
  },
  'lenovo-yoga-tab-13': {
    colors: ['Xám', 'Đen'],
    storageOptions: [{ ram: '8GB', rom: '256GB' }],
  },
  'lenovo-idea-tab': {
    colors: ['Xám', 'Xanh Dương'],
    storageOptions: [{ ram: '4GB', rom: '64GB' }, { ram: '4GB', rom: '128GB' }],
  },
  'xiaomi-redmi-pad-2': {
    colors: ['Xám', 'Xanh Dương', 'Xanh Lá'],
    storageOptions: [{ ram: '4GB', rom: '128GB' }, { ram: '6GB', rom: '128GB' }],
  },
  'xiaomi-redmi-pad-se': {
    colors: ['Xám', 'Xanh Dương', 'Tím'],
    storageOptions: [{ ram: '4GB', rom: '128GB' }, { ram: '6GB', rom: '128GB' }, { ram: '8GB', rom: '256GB' }],
  },

  // ── PHỤ KIỆN - Sạc dự phòng (chỉ màu sắc) ──
  'anker-powercore-20000mah': { colors: ['Đen', 'Trắng'] },
  'anker-zolo-10000mah': { colors: ['Đen', 'Trắng', 'Xanh Dương'] },
  'baseus-airpow-20000mah': { colors: ['Đen', 'Trắng'] },
  'baseus-enerfill-10000mah': { colors: ['Đen', 'Trắng', 'Hồng'] },
  'cuktech-air-20000mah': { colors: ['Đen', 'Trắng'] },
  'cuktech-mini-10000mah': { colors: ['Đen', 'Trắng', 'Xanh Dương'] },
  'ugreen-powerbank-25000mah': { colors: ['Đen', 'Trắng'] },
  'ugreen-uno-10000mah': { colors: ['Đen', 'Trắng', 'Xanh Dương'] },

  // ── PHỤ KIỆN - Củ sạc ──
  'cu-sac-apple-20w': { colors: ['Trắng'] },
  'cu-sac-samsung-25w': { colors: ['Đen', 'Trắng'] },

  // ── PHỤ KIỆN - Cáp sạc ──
  'cap-sac-apple-240w': { colors: ['Trắng'] },
  'cap-anker-1-8m': { colors: ['Đen', 'Trắng'] },
  'cap-baseus-1-2m': { colors: ['Đen', 'Trắng', 'Đỏ'] },
  'cap-cuktech-240w': { colors: ['Đen', 'Trắng'] },
  'cap-sac-cuktech-120w': { colors: ['Đen', 'Trắng'] },
  'cap-sac-ugreen-45w': { colors: ['Đen', 'Trắng', 'Xanh Dương'] },

  // ── PHỤ KIỆN - Ốp lưng ──
  'op-lung-iphone-17-pro-max': { colors: ['Trong Suốt', 'Đen', 'Trắng', 'Xanh Dương', 'Hồng', 'Tím'] },
  'op-lung-iphone-17': { colors: ['Trong Suốt', 'Đen', 'Trắng', 'Xanh Dương', 'Hồng', 'Tím', 'Vàng'] },
  'op-lung-iphone-air': { colors: ['Trong Suốt', 'Đen', 'Trắng', 'Xanh Dương', 'Hồng'] },
  'op-lung-iphone-16-pro-max': { colors: ['Trong Suốt', 'Đen', 'Trắng', 'Xanh Dương', 'Hồng'] },
  'op-lung-samsung-galaxy-s26-ultra': { colors: ['Trong Suốt', 'Đen', 'Trắng', 'Xanh Dương', 'Tím'] },
  'op-lung-samsung-galaxy-s25-ultra': { colors: ['Trong Suốt', 'Đen', 'Trắng', 'Xanh Dương', 'Tím'] },
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  let updated = 0, notFound = 0;

  for (const [slug, data] of Object.entries(variants)) {
    const product = await Product.findOne({ slug });
    if (!product) {
      console.log(`⚠️  Không tìm thấy: ${slug}`);
      notFound++;
      continue;
    }

    product.colors = data.colors || [];
    product.storageOptions = data.storageOptions || [];
    product.markModified('colors');
    product.markModified('storageOptions');
    await product.save();

    console.log(`✅ ${product.name}: ${data.colors?.length || 0} màu, ${data.storageOptions?.length || 0} bộ nhớ`);
    updated++;
  }

  console.log(`\nHoàn tất: ${updated} sản phẩm đã cập nhật, ${notFound} không tìm thấy.`);
  await mongoose.disconnect();
};

run().catch((err) => { console.error(err); process.exit(1); });
