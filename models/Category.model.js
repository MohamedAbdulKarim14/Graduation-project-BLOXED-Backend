const mongoose = require('mongoose');

const Categorieschema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    imageUrl:    { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', Categorieschema);
