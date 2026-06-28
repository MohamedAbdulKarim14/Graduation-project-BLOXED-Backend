const router = require('express').Router();
const Setting = require('../models/Setting.model');
const verifyToken = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.middleware');

// GET /api/settings
// Publicly accessible to fetch global store settings
router.get('/', async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      // Create defaults if not exists
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/settings
// Admin only updates the global settings
router.put('/', verifyToken, isAdmin, async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
