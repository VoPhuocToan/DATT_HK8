const express = require('express');
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, adminOnly, createCategory);

module.exports = router;
