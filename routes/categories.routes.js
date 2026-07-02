const router      = require('express').Router();
const Category        = require('../models/Category.model');
const Product     = require('../models/Product.model');
const verifyToken = require('../middleware/auth.middleware');
const isAdmin     = require('../middleware/admin.middleware');


router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Product.countDocuments({ categoryIds: category._id });
        return { ...category.toObject(), productCount: count };
      })
    );
    res.json(categoriesWithCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
