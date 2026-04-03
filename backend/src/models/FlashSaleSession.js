const mongoose = require('mongoose');

const flashSaleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  flashSalePrice: { type: Number, required: true, min: 0 },
  flashSaleStock: { type: Number, required: true, min: 1 },
  flashSaleSold: { type: Number, default: 0, min: 0 },
}, { _id: false });

const flashSaleSessionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  items: [flashSaleItemSchema],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('FlashSaleSession', flashSaleSessionSchema);
