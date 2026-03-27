const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, default: 0, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    specifications: {
      screen: { type: String, default: '' },
      chipset: { type: String, default: '' },
      ram: { type: String, default: '' },
      storage: { type: String, default: '' },
      battery: { type: String, default: '' },
      rearCamera: { type: String, default: '' },
      frontCamera: { type: String, default: '' },
      os: { type: String, default: '' },
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    sold: { type: Number, default: 0, min: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
