const express = require('express');
const {
  getSessions,
  getActiveSessions,
  createSession,
  updateSession,
  deleteSession,
} = require('../controllers/flashSaleController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public - frontend lấy session đang chạy
router.get('/active', getActiveSessions);

// Admin only
router.get('/', protect, adminOnly, getSessions);
router.post('/', protect, adminOnly, createSession);
router.put('/:id', protect, adminOnly, updateSession);
router.delete('/:id', protect, adminOnly, deleteSession);

module.exports = router;
