const router = require('express').Router();
const Notification = require('../models/Notification.model');
const verifyToken = require('../middleware/auth.middleware');




router.get('/', verifyToken, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' 
      ? { userId: null } 
      : { userId: req.user.id };

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Not found' });

    
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
