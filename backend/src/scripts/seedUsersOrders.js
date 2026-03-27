require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

const customers = [
  {
    name: 'Nguyễn Minh Tuấn',
    email: 'minhtuannguyen@gmail.com',
    phone: '0901234567',
    password: '123456',
    address: { fullName: 'Nguyễn Minh Tuấn', phone: '0901234567', city: 'Hồ Chí Minh', district: 'Quận 1', ward: 'Phường Bến Nghé', detail: '12 Nguyễn Huệ' },
  },
  {
    name: 'Trần Thị Lan Anh',
    email: 'lananhtran@gmail.com',
    phone: '0912345678',
    password: '123456',
    address: { fullName: 'Trần Thị Lan Anh', phone: '0912345678', city: 'Hà Nội', district: 'Quận Hoàn Kiếm', ward: 'Phường Hàng Bài', detail: '45 Đinh Tiên Hoàng' },
  },
  {
    name: 'Lê Hoàng Phúc',
    email: 'hoangphuclê@gmail.com',
    phone: '0923456789',
    password: '123456',
    address: { fullName: 'Lê Hoàng Phúc', phone: '0923456789', city: 'Đà Nẵng', district: 'Quận Hải Châu', ward: 'Phường Hải Châu 1', detail: '78 Trần Phú' },
  },
  {
    name: 'Phạm Thị Thu Hương',
    email: 'thuhuongpham@gmail.com',
    phone: '0934567890',
    password: '123456',
    address: { fullName: 'Phạm Thị Thu Hương', phone: '0934567890', city: 'Hồ Chí Minh', district: 'Quận 3', ward: 'Phường 6', detail: '23 Võ Văn Tần' },
  },
  {
    name: 'Võ Đình Khải',
    email: 'dinhkhaivo@gmail.com',
    phone: '0945678901',
    password: '123456',
    address: { fullName: 'Võ Đình Khải', phone: '0945678901', city: 'Cần Thơ', district: 'Quận Ninh Kiều', ward: 'Phường An Hòa', detail: '56 Nguyễn Trãi' },
  },
  {
    name: 'Đặng Thị Mỹ Linh',
    email: 'mylinhdang@gmail.com',
    phone: '0956789012',
    password: '123456',
    address: { fullName: 'Đặng Thị Mỹ Linh', phone: '0956789012', city: 'Hà Nội', district: 'Quận Cầu Giấy', ward: 'Phường Dịch Vọng', detail: '89 Xuân Thủy' },
  },
  {
    name: 'Bùi Quốc Hùng',
    email: 'quochungbui@gmail.com',
    phone: '0967890123',
    password: '123456',
    address: { fullName: 'Bùi Quốc Hùng', phone: '0967890123', city: 'Hồ Chí Minh', district: 'Quận Bình Thạnh', ward: 'Phường 25', detail: '34 Đinh Bộ Lĩnh' },
  },
  {
    name: 'Ngô Thị Thanh Vân',
    email: 'thanhvanngo@gmail.com',
    phone: '0978901234',
    password: '123456',
    address: { fullName: 'Ngô Thị Thanh Vân', phone: '0978901234', city: 'Hải Phòng', district: 'Quận Lê Chân', ward: 'Phường An Dương', detail: '67 Tô Hiệu' },
  },
  {
    name: 'Hoàng Văn Dũng',
    email: 'vandunghoang@gmail.com',
    phone: '0989012345',
    password: '123456',
    address: { fullName: 'Hoàng Văn Dũng', phone: '0989012345', city: 'Hồ Chí Minh', district: 'Quận 7', ward: 'Phường Tân Phú', detail: '101 Nguyễn Thị Thập' },
  },
];

// Tạo ngày trong quá khứ ngẫu nhiên (trong vòng N ngày)
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

// Danh sách đơn hàng mẫu cho từng khách (slug sản phẩm + số lượng)
const orderTemplates = [
  // Nguyễn Minh Tuấn - 3 đơn
  [
    { slugs: [{ slug: 'iphone-17-pro-max-256gb', qty: 1 }, { slug: 'op-lung-iphone-17-pro-max', qty: 1 }], status: 'delivered', payment: 'paid', method: 'bank_transfer', daysAgo: 45, note: '' },
    { slugs: [{ slug: 'apple-watch-series-11', qty: 1 }], status: 'delivered', payment: 'paid', method: 'cod', daysAgo: 20, note: '' },
    { slugs: [{ slug: 'anker-powercore-20000mah', qty: 2 }], status: 'shipping', payment: 'pending', method: 'cod', daysAgo: 2, note: 'Giao giờ hành chính' },
  ],
  // Trần Thị Lan Anh - 4 đơn
  [
    { slugs: [{ slug: 'macbook-pro-m4-16gb-512gb', qty: 1 }], status: 'delivered', payment: 'paid', method: 'bank_transfer', daysAgo: 60, note: '' },
    { slugs: [{ slug: 'ipad-air-11-m3', qty: 1 }, { slug: 'cap-sac-apple-240w', qty: 1 }], status: 'delivered', payment: 'paid', method: 'bank_transfer', daysAgo: 30, note: '' },
    { slugs: [{ slug: 'apple-watch-se-2024', qty: 1 }], status: 'confirmed', payment: 'pending', method: 'cod', daysAgo: 5, note: '' },
    { slugs: [{ slug: 'baseus-airpow-20000mah', qty: 1 }, { slug: 'cap-baseus-1-2m', qty: 2 }], status: 'pending', payment: 'pending', method: 'cod', daysAgo: 1, note: 'Gọi trước khi giao' },
  ],
  // Lê Hoàng Phúc - 3 đơn
  [
    { slugs: [{ slug: 'samsung-galaxy-s26-ultra-256gb', qty: 1 }, { slug: 'op-lung-samsung-galaxy-s26-ultra', qty: 1 }], status: 'delivered', payment: 'paid', method: 'cod', daysAgo: 50, note: '' },
    { slugs: [{ slug: 'asus-tuf-gaming-a15-2024', qty: 1 }], status: 'delivered', payment: 'paid', method: 'bank_transfer', daysAgo: 25, note: '' },
    { slugs: [{ slug: 'xiaomi-watch-s4', qty: 1 }, { slug: 'cu-sac-samsung-25w', qty: 1 }], status: 'shipping', payment: 'pending', method: 'cod', daysAgo: 3, note: '' },
  ],
  // Phạm Thị Thu Hương - 4 đơn
  [
    { slugs: [{ slug: 'iphone-16-pro-max-256gb', qty: 1 }], status: 'delivered', payment: 'paid', method: 'bank_transfer', daysAgo: 70, note: '' },
    { slugs: [{ slug: 'ipad-pro-m5-11', qty: 1 }, { slug: 'cu-sac-apple-20w', qty: 1 }], status: 'delivered', payment: 'paid', method: 'bank_transfer', daysAgo: 35, note: '' },
    { slugs: [{ slug: 'apple-watch-ultra-2', qty: 1 }], status: 'delivered', payment: 'paid', method: 'cod', daysAgo: 15, note: '' },
    { slugs: [{ slug: 'ugreen-powerbank-25000mah', qty: 1 }, { slug: 'cap-anker-1-8m', qty: 1 }], status: 'pending', payment: 'pending', method: 'cod', daysAgo: 1, note: '' },
  ],
  // Võ Đình Khải - 3 đơn
  [
    { slugs: [{ slug: 'xiaomi-17-ultra-256gb', qty: 1 }], status: 'delivered', payment: 'paid', method: 'cod', daysAgo: 40, note: '' },
    { slugs: [{ slug: 'lenovo-loq-15-2024', qty: 1 }], status: 'delivered', payment: 'paid', method: 'bank_transfer', daysAgo: 18, note: '' },
    { slugs: [{ slug: 'samsung-galaxy-watch-8', qty: 1 }, { slug: 'cap-sac-ugreen-45w', qty: 2 }], status: 'confirmed', payment: 'pending', method: 'cod', daysAgo: 4, note: 'Giao buổi sáng' },
  ],
  // Đặng Thị Mỹ Linh - 4 đơn
  [
    { slugs: [{ slug: 'iphone-17-air-128gb', qty: 1 }, { slug: 'op-lung-iphone-air', qty: 1 }], status: 'delivered', payment: 'paid', method: 'bank_transfer', daysAgo: 55, note: '' },
    { slugs: [{ slug: 'samsung-galaxy-tab-s11', qty: 1 }], status: 'delivered', payment: 'paid', method: 'bank_transfer', daysAgo: 28, note: '' },
    { slugs: [{ slug: 'huawei-watch-gt-10', qty: 1 }], status: 'shipping', payment: 'pending', method: 'cod', daysAgo: 3, note: '' },
    { slugs: [{ slug: 'cuktech-air-20000mah', qty: 1 }, { slug: 'cap-cuktech-240w', qty: 1 }], status: 'pending', payment: 'pending', method: 'cod', daysAgo: 0, note: 'Giao nhanh trong ngày' },
  ],
  // Bùi Quốc Hùng - 3 đơn
  [
    { slugs: [{ slug: 'samsung-galaxy-z-fold-7-256gb', qty: 1 }], status: 'delivered', payment: 'paid', method: 'bank_transfer', daysAgo: 65, note: '' },
    { slugs: [{ slug: 'msi-gaming-thin-15-2024', qty: 1 }], status: 'delivered', payment: 'paid', method: 'bank_transfer', daysAgo: 22, note: '' },
    { slugs: [{ slug: 'xiaomi-pad-8-pro', qty: 1 }, { slug: 'cap-sac-cuktech-120w', qty: 1 }], status: 'shipping', payment: 'pending', method: 'cod', daysAgo: 2, note: '' },
  ],
  // Ngô Thị Thanh Vân - 4 đơn
  [
    { slugs: [{ slug: 'iphone-17e-128gb', qty: 1 }, { slug: 'op-lung-iphone-17', qty: 1 }], status: 'delivered', payment: 'paid', method: 'cod', daysAgo: 48, note: '' },
    { slugs: [{ slug: 'asus-vivobook-14-2024', qty: 1 }], status: 'delivered', payment: 'paid', method: 'bank_transfer', daysAgo: 26, note: '' },
    { slugs: [{ slug: 'samsung-galaxy-watch-ultra', qty: 1 }], status: 'confirmed', payment: 'pending', method: 'cod', daysAgo: 6, note: '' },
    { slugs: [{ slug: 'baseus-enerfill-10000mah', qty: 2 }, { slug: 'cap-baseus-1-2m', qty: 1 }], status: 'pending', payment: 'pending', method: 'cod', daysAgo: 0, note: '' },
  ],
  // Hoàng Văn Dũng - 3 đơn
  [
    { slugs: [{ slug: 'samsung-galaxy-s26-256gb', qty: 1 }, { slug: 'op-lung-samsung-galaxy-s25-ultra', qty: 1 }], status: 'delivered', payment: 'paid', method: 'bank_transfer', daysAgo: 38, note: '' },
    { slugs: [{ slug: 'gigabyte-aorus-16x-2024', qty: 1 }], status: 'delivered', payment: 'paid', method: 'bank_transfer', daysAgo: 14, note: '' },
    { slugs: [{ slug: 'oppo-find-x9-256gb', qty: 1 }], status: 'cancelled', payment: 'pending', method: 'cod', daysAgo: 7, note: 'Khách hủy do đổi ý' },
  ],
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  const createdUsers = [];

  for (const c of customers) {
    let user = await User.findOne({ email: c.email });
    if (!user) {
      const hashed = await bcrypt.hash(c.password, 10);
      user = await User.create({
        name: c.name,
        email: c.email,
        phone: c.phone,
        password: hashed,
        role: 'customer',
        address: c.address,
      });
      console.log(`✅ Tạo khách hàng: ${c.name}`);
    } else {
      console.log(`⏭️  Đã tồn tại: ${c.name}`);
    }
    createdUsers.push(user);
  }

  // Xóa đơn hàng cũ của các khách này để seed lại sạch
  const userIds = createdUsers.map((u) => u._id);
  await Order.deleteMany({ user: { $in: userIds } });
  console.log('\n🗑️  Đã xóa đơn hàng cũ của các khách seed\n');

  let totalOrders = 0;

  for (let i = 0; i < createdUsers.length; i++) {
    const user = createdUsers[i];
    const orders = orderTemplates[i];

    for (const tpl of orders) {
      // Lấy sản phẩm từ DB
      const orderItems = [];
      let subtotal = 0;

      for (const item of tpl.slugs) {
        const product = await Product.findOne({ slug: item.slug });
        if (!product) {
          console.warn(`  ⚠️  Không tìm thấy sản phẩm: ${item.slug}`);
          continue;
        }
        const price = product.salePrice > 0 ? product.salePrice : product.price;
        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images?.[0] || '',
          price,
          quantity: item.qty,
        });
        subtotal += price * item.qty;
      }

      if (orderItems.length === 0) continue;

      const shippingFee = subtotal >= 5000000 ? 0 : 30000;
      const totalPrice = subtotal + shippingFee;

      // Tạo ngày đặt hàng
      const createdAt = daysAgo(tpl.daysAgo);

      const order = await Order.create({
        user: user._id,
        orderItems,
        shippingAddress: user.address,
        paymentMethod: tpl.method,
        paymentStatus: tpl.payment,
        orderStatus: tpl.status,
        shippingFee,
        subtotal,
        totalPrice,
        note: tpl.note,
        createdAt,
        updatedAt: createdAt,
      });

      console.log(`  📦 ${user.name} → ${tpl.status.padEnd(10)} | ${totalPrice.toLocaleString('vi-VN')}đ`);
      totalOrders++;
    }
  }

  console.log(`\n✅ Hoàn tất: ${createdUsers.length} khách hàng, ${totalOrders} đơn hàng.`);
  await mongoose.disconnect();
};

run().catch((err) => { console.error(err); process.exit(1); });
