const router = require('express').Router();
const Notification = require('../models/Notification.model');
const verifyToken = require('../middleware/auth.middleware');

// GET /api/notifications
// Admin gets admin notifications (userId: null)
// User gets their own notifications (userId: req.user.id)
router.get('/', verifyToken, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' 
      ? { userId: null } // admin-wide notifications
      : { userId: req.user.id };

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Not found' });

    // Validate ownership
    if (req.user.role !== 'admin' && String(notification.userId) !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', verifyToken, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' 
      ? { userId: null }
      : { userId: req.user.id };

    await Notification.updateMany({ ...filter, isRead: false }, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
