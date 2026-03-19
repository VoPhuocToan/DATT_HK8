require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  const existing = await User.findOne({ email: 'admin@gmail.com' });
  if (existing) {
    console.log('Tài khoản admin@gmail.com đã tồn tại.');
    await mongoose.disconnect();
    return;
  }

  await User.create({
    name: 'Admin',
    email: 'admin@gmail.com',
    password: 'admin123',
    role: 'admin',
  });

  console.log('✅ Tạo tài khoản admin thành công!');
  console.log('   Email   : admin@gmail.com');
  console.log('   Mật khẩu: admin123');
  await mongoose.disconnect();
};

run().catch((err) => { console.error(err); process.exit(1); });
