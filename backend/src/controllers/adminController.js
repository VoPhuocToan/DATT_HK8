const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const getDashboardStats = async (req, res) => {
  const now = new Date();

  // Tính khoảng thời gian cho biểu đồ
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 6);
  const monthAgo = new Date(now); monthAgo.setDate(now.getDate() - 29);
  const quarterAgo = new Date(now); quarterAgo.setMonth(now.getMonth() - 2); quarterAgo.setDate(1);

  const [userCount, productCount, orderCount, revenue] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
  ]);

  // Đếm theo trạng thái đơn hàng
  const orderStatusCounts = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
  ]);
  const orderStats = {};
  orderStatusCounts.forEach((s) => { orderStats[s._id] = s.count; });

  // Tình trạng tồn kho
  const [inStock, lowStock, outStock] = await Promise.all([
    Product.countDocuments({ stock: { $gt: 5 } }),
    Product.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
    Product.countDocuments({ stock: 0 }),
  ]);

  // Doanh thu theo ngày (7 ngày)
  const revenueByDay = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'cancelled' }, createdAt: { $gte: weekAgo } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  // Doanh thu theo ngày (30 ngày)
  const revenueByMonth = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'cancelled' }, createdAt: { $gte: monthAgo } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  // Doanh thu theo tháng (3 tháng gần nhất)
  const revenueByQuarter = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'cancelled' }, createdAt: { $gte: quarterAgo } } },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const recentOrders = await Order.find({})
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  return res.json({
    userCount,
    productCount,
    orderCount,
    revenue: revenue[0]?.total || 0,
    orderStats,
    stockStats: { inStock, lowStock, outStock },
    revenueByDay,
    revenueByMonth,
    revenueByQuarter,
    recentOrders,
  });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({})
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 });
  return res.json(orders);
};

const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const { orderStatus, paymentStatus } = req.body;
  if (orderStatus) order.orderStatus = orderStatus;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  await order.save();
  return res.json(order);
};

const getCustomers = async (req, res) => {
  const customers = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
  return res.json(customers);
};

// Thống kê doanh thu theo tháng (12 tháng gần nhất)
const getRevenueStats = async (req, res) => {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const monthly = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'cancelled' }, createdAt: { $gte: from } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const [totalRevenue, totalOrders, pendingOrders, deliveredOrders] = await Promise.all([
    Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.countDocuments({ orderStatus: { $ne: 'cancelled' } }),
    Order.countDocuments({ orderStatus: 'pending' }),
    Order.countDocuments({ orderStatus: 'delivered' }),
  ]);

  // Top sản phẩm bán chạy
  const topProducts = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'cancelled' } } },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.name',
        sold: { $sum: '$orderItems.quantity' },
        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
      },
    },
    { $sort: { sold: -1 } },
    { $limit: 5 },
  ]);

  return res.json({
    monthly,
    totalRevenue: totalRevenue[0]?.total || 0,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    topProducts,
  });
};

// Thống kê sản phẩm bán chạy / bán ế theo khoảng thời gian
const getProductStats = async (req, res) => {
  const { from, to } = req.query;

  const matchDate = { orderStatus: { $ne: 'cancelled' } };
  if (from || to) {
    matchDate.createdAt = {};
    if (from) matchDate.createdAt.$gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      matchDate.createdAt.$lte = toDate;
    }
  }

  // Tổng hợp doanh số từ đơn hàng
  const soldStats = await Order.aggregate([
    { $match: matchDate },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        name: { $first: '$orderItems.name' },
        image: { $first: '$orderItems.image' },
        sold: { $sum: '$orderItems.quantity' },
        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        price: { $first: '$orderItems.price' },
      },
    },
  ]);

  // Map sold stats by product id
  const soldMap = {};
  soldStats.forEach((s) => { soldMap[String(s._id)] = s; });

  // Lấy tất cả sản phẩm
  const allProducts = await Product.find({}).populate('category', 'name').lean();

  const merged = allProducts.map((p) => {
    const s = soldMap[String(p._id)] || {};
    return {
      _id: p._id,
      name: p.name,
      slug: p.slug,
      image: p.images?.[0] || '',
      price: p.salePrice > 0 ? p.salePrice : p.price,
      stock: p.stock,
      category: p.category?.name || '',
      sold: s.sold || 0,
      revenue: s.revenue || 0,
    };
  });

  const topSelling = [...merged].sort((a, b) => b.sold - a.sold).slice(0, 10);
  const topSlow = [...merged].sort((a, b) => a.sold - b.sold).slice(0, 10);

  return res.json({ topSelling, topSlow });
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getCustomers,
  getRevenueStats,
  getProductStats,
};
