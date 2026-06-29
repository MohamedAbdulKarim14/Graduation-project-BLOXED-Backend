const mongoose = require('mongoose');

const WishlistGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
});

const WishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  groups: [WishlistGroupSchema]
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', WishlistSchema);
