const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name:            { type: String, required: true, trim: true },
    email:           { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:        { type: String, required: true },
    role:            { type: String, enum: ['user', 'admin'], default: 'user' },
    shippingAddress: { type: String, default: '' },
    addresses: [
      {
        label: { type: String, default: 'Home' },
        fullName: String,
        address: String,
        city: String,
        zip: String,
        isDefault: { type: Boolean, default: false }
      }
    ],
    savedCards: [
      {
        maskedNumber: String,
        expiry: String,
        cardName: String,
        brand: String
      }
    ],
    isVerified:      { type: Boolean, default: false },
    otp:             { type: String },
    otpExpiresAt:    { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
