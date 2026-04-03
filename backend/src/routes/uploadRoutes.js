const express = require('express');
const { upload, uploadImages } = require('../controllers/uploadController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Upload nhiều ảnh (chỉ admin)
router.post('/images', protect, adminOnly, upload.array('images', 10), uploadImages);

module.exports = router;