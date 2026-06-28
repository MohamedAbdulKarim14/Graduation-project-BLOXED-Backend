const router      = require('express').Router();
const User        = require('../models/User.model');
const Order       = require('../models/Order.model');
const verifyToken = require('../middleware/auth.middleware');
const isAdmin     = require('../middleware/admin.middleware');

// ─── GET /api/users (admin) ───────────────────────────────────────────────────
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/users/me ────────────────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PATCH /api/users/:id (admin) ────────────────────────────────────────────
router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { password, ...data } = req.body; // Don't update password here
    const user = await User.findByIdAndUpdate(req.params.id, data, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE /api/users/:id (admin) ───────────────────────────────────────────
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/users/stats (admin) ────────────────────────────────────────────
router.get('/stats/summary', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers  = await User.countDocuments({ role: 'user' });
    const totalOrders = await Order.countDocuments();
    const revenueAgg  = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;
    res.json({ totalUsers, totalOrders, totalRevenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/users/addresses ──────────────────────────────────────────────────
router.post('/addresses', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // If this is the first address, make it default automatically
    const isDefault = req.body.isDefault || user.addresses.length === 0;
    
    if (isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }
    
    user.addresses.push({ ...req.body, isDefault });
    await user.save();
    
    res.status(201).json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE /api/users/addresses/:addressId ────────────────────────────────────
router.delete('/addresses/:addressId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
    
    // If we deleted the default address, make the first one default if exists
    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PUT /api/users/addresses/:addressId/default ──────────────────────────────
router.put('/addresses/:addressId/default', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.addresses.forEach(a => {
      a.isDefault = a._id.toString() === req.params.addressId;
    });

    await user.save();
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/users/cards ──────────────────────────────────────────────────
router.post('/cards', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Push new card
    user.savedCards.push(req.body);
    await user.save();
    
    res.status(201).json(user.savedCards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE /api/users/cards/:cardId ────────────────────────────────────
router.delete('/cards/:cardId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.savedCards = user.savedCards.filter(c => c._id.toString() !== req.params.cardId);
    
    await user.save();
    res.json(user.savedCards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
