const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'TechShop' },
    shippingFee: { type: Number, default: 9.99 },
    freeShippingThreshold: { type: Number, default: 100 },
    taxRate: { type: Number, default: 0.14 },
    currency: { type: String, default: 'USD' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
