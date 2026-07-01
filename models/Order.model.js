const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantName: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    priceAtPurchase: { type: Number, required: true },
  },
  { _id: true },
);

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [OrderItemSchema],
    subtotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: { type: String, required: true },
    shippingMethod: {
      type: String,
      enum: ['standard', 'express', 'sameday', 'pickup'],
      default: 'standard'
    },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    },
    paypalOrderId: { type: String },
    returnStatus: { type: String, enum: ['none', 'requested', 'approved', 'rejected'], default: 'none' },
    returnReason: { type: String },
    cancelledBy: { type: String, enum: ['user', 'admin'] },
    orderDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Order', OrderSchema);
