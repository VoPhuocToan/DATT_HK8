const User = require('../models/User');
const Product = require('../models/Product');

const getCart = async (req, res) => {
  const user = await User.findById(req.user._id).populate('cartItems.product');
  return res.json(user.cartItems);
};

const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const user = await User.findById(req.user._id);
  const existingIndex = user.cartItems.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingIndex >= 0) {
    user.cartItems[existingIndex].quantity += Number(quantity);
  } else {
    user.cartItems.push({ product: productId, quantity: Number(quantity) });
  }

  await user.save();
  await user.populate('cartItems.product');

  return res.json(user.cartItems);
};

const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const user = await User.findById(req.user._id);

  const item = user.cartItems.find((cartItem) => cartItem.product.toString() === req.params.productId);
  if (!item) {
    return res.status(404).json({ message: 'Cart item not found' });
  }

  if (quantity <= 0) {
    user.cartItems = user.cartItems.filter(
      (cartItem) => cartItem.product.toString() !== req.params.productId
    );
  } else {
    item.quantity = Number(quantity);
  }

  await user.save();
  await user.populate('cartItems.product');
  return res.json(user.cartItems);
};

const removeCartItem = async (req, res) => {
  const user = await User.findById(req.user._id);

  user.cartItems = user.cartItems.filter(
    (item) => item.product.toString() !== req.params.productId
  );

  await user.save();
  await user.populate('cartItems.product');

  return res.json(user.cartItems);
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
