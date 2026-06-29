const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantName: { type: String },
    quantity:  { type: Number, required: true, min: 1, default: 1 },
    price:     { type: Number, required: true },
  },
  { _id: true }
);

const CartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items:  [CartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', CartSchema);
