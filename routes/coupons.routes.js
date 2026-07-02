const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon.model');
const verifyToken = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.middleware');




router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code is required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });

    if (!coupon.isActive) return res.status(400).json({ message: 'This coupon is no longer active' });

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    if (coupon.usageLimit > 0 && coupon.timesUsed >= coupon.usageLimit) {
      return res.status(400).json({ message: 'This coupon usage limit has been reached' });
    }

    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { code, discountType, discountValue, isActive, expiresAt, usageLimit } = req.body;
    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) return res.status(400).json({ message: 'Coupon code already exists' });

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      isActive,
      expiresAt,
      usageLimit
    });

    const created = await coupon.save();
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    await coupon.deleteOne();
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
