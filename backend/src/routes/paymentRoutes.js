const express = require('express');
const { testPayOSConnection, createPaymentLink, handlePaymentWebhook, checkPaymentStatus } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Test PayOS connection
router.get('/test', testPayOSConnection);

// Tạo link thanh toán (cần đăng nhập)
router.post('/create', protect, createPaymentLink);

// Webhook từ PayOS (không cần auth)
router.post('/webhook', handlePaymentWebhook);

// Kiểm tra trạng thái thanh toán (cần đăng nhập)
router.get('/status/:orderId', protect, checkPaymentStatus);

module.exports = router;