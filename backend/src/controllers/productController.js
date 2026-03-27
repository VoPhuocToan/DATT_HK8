const Product = require('../models/Product');

const buildQuery = (query) => {
  const filter = {};

  if (query.keyword) {
    filter.name = { $regex: query.keyword, $options: 'i' };
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.brand) {
    filter.brand = { $regex: query.brand, $options: 'i' };
  }

  if (query.featured === 'true') {
    filter.isFeatured = true;
  }

  // Mặc định chỉ hiện sản phẩm đang visible (trừ khi admin xem all)
  if (query.showHidden !== 'true') {
    filter.isVisible = { $ne: false };
  }

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  return filter;
};

const getProducts = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const filter = buildQuery(req.query);

  const sort = req.query.sort || 'newest';
  const sortMap = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    popular: { numReviews: -1 },
    best_selling: { sold: -1 },
  };

  // Lọc còn hàng nếu có query instock=true
  if (req.query.instock === 'true') {
    filter.stock = { $gt: 0 };
  }

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  return res.json({
    items,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
};

const getProductBySlug = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.json(product);
};

const createProduct = async (req, res) => {
  const payload = req.body;
  const product = await Product.create(payload);
  return res.status(201).json(product);
};

const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  Object.assign(product, req.body);
  await product.save();
  return res.json(product);
};

const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  await product.deleteOne();
  return res.json({ message: 'Product deleted' });
};

const toggleVisibility = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.isVisible = !product.isVisible;
  await product.save();
  return res.json({ isVisible: product.isVisible });
};

module.exports = {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleVisibility,
};
