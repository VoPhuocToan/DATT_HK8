const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

const calculateSubtotal = (items) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

const createOrder = async (req, res) => {
  const { shippingAddress, paymentMethod = 'cod', shippingFee = 0, note = '' } = req.body;

  const user = await User.findById(req.user._id).populate('cartItems.product');
  if (!user.cartItems.length) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const orderItems = user.cartItems.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    image: item.product.images?.[0] || '',
    price: item.product.salePrice > 0 ? item.product.salePrice : item.product.price,
    quantity: item.quantity,
  }));

  const subtotal = calculateSubtotal(orderItems);
  const totalPrice = subtotal + Number(shippingFee || 0);

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    shippingFee,
    subtotal,
    totalPrice,
    note,
  });

  user.cartItems = [];
  await user.save();

  // Tăng sold cho từng sản phẩm
  await Promise.all(
    orderItems.map((item) =>
      Product.findByIdAndUpdate(item.product, { $inc: { sold: item.quantity } })
    )
  );

  return res.status(201).json(order);
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.json(orders);
};

const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  return res.json(order);
};

const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Forbidden' });
  if (!['pending', 'confirmed'].includes(order.orderStatus))
    return res.status(400).json({ message: 'Không thể hủy đơn hàng ở trạng thái này' });
  order.orderStatus = 'cancelled';
  await order.save();
  return res.json(order);
};

module.exports = { createOrder, getMyOrders, getOrderById, cancelOrder };
