const express = require('express');
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getCustomers,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect, adminOnly);
router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/customers', getCustomers);

module.exports = router;
