const express = require('express');
const { getReviewsByProduct, getAllReviews, createReview, deleteReview, replyReview } = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, adminOnly, getAllReviews);          // admin: tất cả review
router.get('/by-product', getReviewsByProduct);              // public: review theo sản phẩm
router.post('/', protect, createReview);                     // user: gửi review
router.put('/:id/reply', protect, adminOnly, replyReview);   // admin: trả lời
router.delete('/:id', protect, adminOnly, deleteReview);     // admin: xóa

module.exports = router;
