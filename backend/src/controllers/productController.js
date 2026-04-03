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

  const { colors, storageOptions, specifications, images, ...rest } = req.body;

  console.log('[updateProduct] colors:', colors);
  console.log('[updateProduct] storageOptions:', storageOptions);

  // Cập nhật các field thông thường
  Object.assign(product, rest);

  // Cập nhật array/object fields một cách tường minh
  if (colors !== undefined) {
    product.colors = colors;
    product.markModified('colors');
  }
  if (storageOptions !== undefined) {
    product.storageOptions = storageOptions;
    product.markModified('storageOptions');
  }
  if (specifications !== undefined) {
    product.specifications = specifications;
    product.markModified('specifications');
  }
  if (images !== undefined) {
    product.images = images;
    product.markModified('images');
  }

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

const getFlashSaleProducts = async (req, res) => {
  const products = await Product.find({ isFlashSale: true, isVisible: { $ne: false } })
    .populate('category', 'name slug')
    .sort({ createdAt: -1 });
  return res.json(products);
};

const toggleFlashSale = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const { isFlashSale, flashSalePrice, flashSaleStock } = req.body;
  product.isFlashSale = isFlashSale !== undefined ? isFlashSale : !product.isFlashSale;
  if (flashSalePrice !== undefined) product.flashSalePrice = flashSalePrice;
  if (flashSaleStock !== undefined) product.flashSaleStock = flashSaleStock;
  await product.save();
  return res.json(product);
};

module.exports = {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleVisibility,
  getFlashSaleProducts,
  toggleFlashSale,
};
