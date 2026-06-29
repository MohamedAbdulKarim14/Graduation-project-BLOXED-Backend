const router      = require('express').Router();
const Cart        = require('../models/Cart.model');
const Product     = require('../models/Product.model');
const verifyToken = require('../middleware/auth.middleware');

// ─── GET /api/carts/my ────────────────────────────────────────────────────────
router.get('/my', verifyToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/carts/add ──────────────────────────────────────────────────────
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { productId, quantity, variantName } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = await Cart.create({ userId: req.user.id, items: [] });

    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId && (item.variantName || null) === (variantName || null)
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity || 1;
    } else {
      let price = product.price;
      if (variantName && product.variants && product.variants.length > 0) {
        const variant = product.variants.find(v => v.name === variantName);
        if (variant && variant.price) price = variant.price;
      }
      cart.items.push({ productId, variantName, quantity: quantity || 1, price });
    }

    await cart.save();
    await cart.populate('items.productId');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PATCH /api/carts/item/:itemId ────────────────────────────────────────
router.patch('/item/:itemId', verifyToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items.pull(req.params.itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.productId');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE /api/carts/item/:itemId ────────────────────────────────────────
router.delete('/item/:itemId', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items.pull(req.params.itemId);
    await cart.save();
    await cart.populate('items.productId');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE /api/carts/clear ─────────────────────────────────────────────────
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = [];
    await cart.save();
    res.json({ message: 'Cart cleared', cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
