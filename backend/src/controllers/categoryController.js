const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const Category = require('../models/Category');

const getCategories = async (req, res) => {
  const categories = await Category.find({}).sort({ createdAt: -1 });
  return res.json(categories);
};

const createCategory = async (req, res) => {
  const { name, image } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  const slug = slugify(name);
  const existing = await Category.findOne({ slug });
  if (existing) {
    return res.status(400).json({ message: 'Category already exists' });
  }

  const category = await Category.create({ name, slug, image: image || '' });
  return res.status(201).json(category);
};

module.exports = { getCategories, createCategory };
