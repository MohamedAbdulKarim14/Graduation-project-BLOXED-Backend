const router = require('express').Router();
const Wishlist = require('../models/Wishlist.model');
const verifyToken = require('../middleware/auth.middleware');


router.get('/my', verifyToken, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id }).populate('groups.items');
    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId: req.user.id,
        groups: [{ name: 'My Wishlist', items: [] }]
      });
    }
    res.json(wishlist.groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.put('/my', verifyToken, async (req, res) => {
  try {
    const { groups } = req.body;
    let wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user.id });
    }
    
    
    const processedGroups = groups.map(g => ({
      name: g.name,
      _id: g._id || g.id,
      items: g.items.map(item => item._id ? item._id : item)
    }));

    wishlist.groups = processedGroups;
    await wishlist.save();
    
    await wishlist.populate('groups.items');
    res.json(wishlist.groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
