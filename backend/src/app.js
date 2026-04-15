const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const flashSaleRoutes = require('./routes/flashSaleRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const articleRoutes = require('./routes/articleRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const supportRoutes = require('./routes/supportRoutes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(cors({
  origin: ['http://localhost:5175', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ message: 'Dang Anh Shop API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/flash-sale', flashSaleRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/support', supportRoutes);

// Serve static files (hình ảnh từ frontend/public — bao gồm cả ảnh upload mới)
const frontendPublic = path.join(__dirname, '../../frontend/public');
app.use('/images', express.static(frontendPublic));

// Fallback: serve ảnh cũ từ backend/uploads/images (upload trước khi migrate)
const uploadsDir = path.join(__dirname, '../uploads/images');
app.use('/images', express.static(uploadsDir));

// Serve admin panel từ dist
const adminDist = path.join(__dirname, '../../admin/dist');
app.use('/admin', express.static(adminDist));
app.get('/admin/*splat', (req, res) => {
  res.sendFile(path.join(adminDist, 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
