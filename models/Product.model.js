const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    name_ar:     { type: String, trim: true },
    description: { type: String, default: '' },
    description_ar: { type: String, default: '' },
    price:       { type: Number, required: true, min: 0 },
    stock:       { type: Number, required: true, min: 0, default: 0 },
    imageUrl:    { type: String, default: '' },
    images:      [{ type: String }],
    specifications: [
      { key: String, value: String, key_ar: String, value_ar: String }
    ],
    variants: [
      {
        name: String, // e.g., "Red - M"
        name_ar: String, // e.g., "أحمر - وسط"
        stock: { type: Number, default: 0 },
        price: { type: Number } // Optional override price for variant
      }
    ],
    categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
