require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');

const SAMPLE_USERS = [
  { name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com' },
  { name: 'Trần Thị Bích', email: 'bich.tran@gmail.com' },
  { name: 'Lê Minh Tuấn', email: 'tuan.le@gmail.com' },
  { name: 'Phạm Thu Hà', email: 'ha.pham@gmail.com' },
  { name: 'Hoàng Đức Mạnh', email: 'manh.hoang@gmail.com' },
];

// Pool bình luận theo loại sản phẩm
const COMMENTS = {
  phone: [
    { r: 5, c: 'Điện thoại rất đẹp, màn hình sắc nét, camera chụp ảnh cực kỳ rõ nét. Rất hài lòng!' },
    { r: 5, c: 'Máy chạy mượt mà, pin trâu dùng cả ngày không lo hết. Đóng gói cẩn thận, giao hàng nhanh.' },
    { r: 4, c: 'Sản phẩm đúng mô tả, giá hợp lý. Chỉ tiếc pin hơi nhỏ nhưng nhìn chung rất ổn.' },
    { r: 5, c: 'Mua lần 2 rồi, chất lượng luôn đảm bảo. Shop tư vấn nhiệt tình, sẽ ủng hộ tiếp.' },
    { r: 4, c: 'Máy đẹp, hiệu năng tốt. Giao hàng đúng hẹn, hài lòng với trải nghiệm mua sắm.' },
  ],
  laptop: [
    { r: 5, c: 'Laptop chạy cực nhanh, làm việc và học online rất mượt. Màn hình đẹp, bàn phím gõ sướng tay.' },
    { r: 5, c: 'Đóng gói kỹ càng, máy nguyên seal. Hiệu năng vượt mong đợi, xứng đáng với giá tiền.' },
    { r: 4, c: 'Máy tốt, pin khá trâu dùng được 6-7 tiếng. Tản nhiệt hơi ồn khi chạy nặng nhưng chấp nhận được.' },
    { r: 5, c: 'Mua về dùng cho công việc đồ họa, render rất nhanh. Rất hài lòng, sẽ giới thiệu bạn bè.' },
    { r: 4, c: 'Laptop đẹp, mỏng nhẹ tiện mang đi. Chỉ ước có thêm cổng USB-A nhưng nhìn chung rất ổn.' },
  ],
  tablet: [
    { r: 5, c: 'Màn hình tablet rất đẹp, xem phim cực đã. Âm thanh to rõ, dùng học online rất tiện.' },
    { r: 4, c: 'Máy chạy mượt, pin dùng được cả ngày. Thiết kế sang trọng, cầm trên tay rất chắc chắn.' },
    { r: 5, c: 'Mua cho con học online, dùng rất tốt. Màn hình lớn, chữ rõ, bé học không mỏi mắt.' },
    { r: 4, c: 'Sản phẩm đúng mô tả, giao hàng nhanh. Hiệu năng ổn định, chơi game nhẹ không lag.' },
    { r: 5, c: 'Rất hài lòng với sản phẩm. Đóng gói cẩn thận, máy đẹp, dùng vẽ và ghi chú rất tiện.' },
  ],
  watch: [
    { r: 5, c: 'Đồng hồ đẹp, đeo vào rất sang. Theo dõi sức khỏe chính xác, pin dùng được 2 ngày.' },
    { r: 4, c: 'Thiết kế tinh tế, màn hình sáng rõ ngoài trời. Kết nối điện thoại nhanh, thông báo đầy đủ.' },
    { r: 5, c: 'Mua tặng người thân, ai cũng khen đẹp. Chức năng đo nhịp tim và SpO2 rất hữu ích.' },
    { r: 4, c: 'Đồng hồ chạy ổn định, giao diện dễ dùng. Chỉ tiếc dây đeo hơi cứng ban đầu nhưng đeo quen rồi ổn.' },
    { r: 5, c: 'Sản phẩm chính hãng, đóng gói đẹp. Tính năng theo dõi giấc ngủ rất hay, rất hài lòng.' },
  ],
  accessory: [
    { r: 5, c: 'Sản phẩm chất lượng tốt, đúng như mô tả. Giao hàng nhanh, đóng gói cẩn thận.' },
    { r: 4, c: 'Dùng ổn, giá hợp lý. Sẽ mua thêm nếu cần, shop phục vụ tốt.' },
    { r: 5, c: 'Hàng chính hãng, chất lượng đảm bảo. Rất hài lòng, sẽ ủng hộ shop lần sau.' },
    { r: 4, c: 'Sản phẩm tốt, dùng bền. Giao hàng đúng hẹn, cảm ơn shop.' },
    { r: 5, c: 'Mua lần 2 rồi vẫn chất lượng như lần đầu. Shop uy tín, sẽ giới thiệu bạn bè.' },
  ],
};

const getCommentPool = (product) => {
  const name = product.name.toLowerCase();
  if (name.includes('iphone') || name.includes('samsung') || name.includes('xiaomi') && !name.includes('pad') || name.includes('oppo') || name.includes('vivo') || name.includes('realme')) return COMMENTS.phone;
  if (name.includes('laptop') || name.includes('macbook') || name.includes('vivobook') || name.includes('ideapad') || name.includes('tuf') || name.includes('zenbook')) return COMMENTS.laptop;
  if (name.includes('pad') || name.includes('tab') || name.includes('ipad')) return COMMENTS.tablet;
  if (name.includes('watch') || name.includes('band') || name.includes('galaxy watch')) return COMMENTS.watch;
  return COMMENTS.accessory;
};

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  // Tạo/lấy user mẫu
  const password = await bcrypt.hash('demo123', 10);
  const users = [];
  for (const u of SAMPLE_USERS) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      user = await User.create({ name: u.name, email: u.email, password, role: 'customer' });
      console.log(`✅ Tạo user: ${u.name}`);
    }
    users.push(user);
  }

  // Xóa review cũ (seed lại)
  await Review.deleteMany({});
  console.log('🗑  Đã xóa review cũ');

  const products = await Product.find({});
  console.log(`📦 Tìm thấy ${products.length} sản phẩm`);

  let total = 0;
  for (const product of products) {
    const pool = shuffle(getCommentPool(product));
    const count = 2 + Math.floor(Math.random() * 2); // 2 hoặc 3 bình luận
    const picked = pool.slice(0, count);
    const shuffledUsers = shuffle(users);

    for (let i = 0; i < picked.length; i++) {
      const user = shuffledUsers[i % shuffledUsers.length];
      try {
        await Review.create({
          product: product._id,
          user: user._id,
          rating: picked[i].r,
          comment: picked[i].c,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 3600 * 1000),
        });
        total++;
      } catch (e) {
        // bỏ qua duplicate
      }
    }

    // Cập nhật rating sản phẩm
    const reviews = await Review.find({ product: product._id });
    if (reviews.length > 0) {
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      await Product.findByIdAndUpdate(product._id, {
        rating: Math.round(avg * 10) / 10,
        numReviews: reviews.length,
      });
    }
  }

  console.log(`✅ Đã tạo ${total} bình luận mẫu cho ${products.length} sản phẩm`);
  await mongoose.disconnect();
};

run().catch((err) => { console.error(err); process.exit(1); });
