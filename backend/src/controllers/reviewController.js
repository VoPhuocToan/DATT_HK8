const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Cập nhật rating trung bình của sản phẩm
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, { rating: 0, numReviews: 0 });
    return;
  }
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(avg * 10) / 10,
    numReviews: reviews.length,
  });
};

// GET /reviews?product=:id  — lấy review theo sản phẩm
const getReviewsByProduct = async (req, res) => {
  try {
    const { product } = req.query;
    if (!product) return res.status(400).json({ message: 'Thiếu product id' });
    const reviews = await Review.find({ product })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// GET /reviews  — admin: lấy tất cả review
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('product', 'name slug images')
      .sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// POST /reviews  — user đã mua gửi review
const createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    // Kiểm tra đã review chưa
    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });

    // Kiểm tra đã mua chưa (nếu có orderId)
    if (orderId) {
      const order = await Order.findOne({ _id: orderId, user: req.user._id, status: 'delivered' });
      if (!order) return res.status(403).json({ message: 'Bạn chưa mua sản phẩm này' });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      order: orderId || undefined,
      rating,
      comment,
    });
    await updateProductRating(productId);
    await review.populate('user', 'name');
    return res.status(201).json(review);
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });
    return res.status(500).json({ message: e.message });
  }
};

// DELETE /reviews/:id  — admin xóa review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    const productId = review.product;
    await review.deleteOne();
    await updateProductRating(productId);
    return res.json({ message: 'Đã xóa' });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// PUT /reviews/:id/reply  — admin trả lời review
const replyReview = async (req, res) => {
  try {
    const { reply } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    review.adminReply = reply || '';
    review.repliedAt = reply ? new Date() : null;
    await review.save();
    await review.populate('user', 'name');
    await review.populate('product', 'name slug images');
    return res.json(review);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

module.exports = { getReviewsByProduct, getAllReviews, createReview, deleteReview, replyReview };
