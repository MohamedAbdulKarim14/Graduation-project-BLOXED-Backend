const router      = require('express').Router();
const Order       = require('../models/Order.model');
const Cart        = require('../models/Cart.model');
const Notification= require('../models/Notification.model');
const Coupon      = require('../models/Coupon.model');
const verifyToken = require('../middleware/auth.middleware');
const isAdmin     = require('../middleware/admin.middleware');


router.get('/', verifyToken, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .populate('items.productId', 'name imageUrl')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('items.productId', 'name imageUrl price');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    
    if (req.user.role !== 'admin' && order.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/', verifyToken, async (req, res) => {
  try {
    const { items, shippingAddress, location, paymentMethod, cardDetails, paypalOrderId, couponCode, shippingMethod } = req.body;
    if (!items || items.length === 0)
      return res.status(400).json({ message: 'Order must have at least one item' });

    
    const Product = require('../models/Product.model');
    let subtotal = 0;
    const finalItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });
      
      subtotal += product.price * item.quantity;
      finalItems.push({
        productId: product._id,
        quantity: item.quantity,
        priceAtPurchase: product.price
      });
    }

    
    const Setting = require('../models/Setting.model');
    let settings = await Setting.findOne();
    if (!settings) settings = { shippingFee: 9.99, expressShippingFee: 10, samedayShippingFee: 20, freeShippingThreshold: 100, taxRate: 0.14 };

    
    let discountAmount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && coupon.isActive && (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) && (coupon.usageLimit === 0 || coupon.timesUsed < coupon.usageLimit)) {
        if (coupon.discountType === 'fixed') {
          discountAmount = coupon.discountValue;
        } else {
          discountAmount = subtotal * (coupon.discountValue / 100);
        }
        appliedCoupon = coupon.code;
        
        coupon.timesUsed += 1;
        await coupon.save();
      }
    }

    let shipping = 0;
    if (shippingMethod === 'standard') {
      shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
    } else if (shippingMethod === 'express') {
      shipping = settings.shippingFee + (settings.expressShippingFee || 10);
    } else if (shippingMethod === 'sameday') {
      shipping = settings.shippingFee + (settings.samedayShippingFee || 20);
    } else if (shippingMethod === 'pickup') {
      shipping = 0;
    }
    
    const tax = subtotal * settings.taxRate;
    const calculatedTotal = Math.max(0, subtotal + shipping + tax - discountAmount);

    
    if (paymentMethod === 'card') {
      if (!cardDetails || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
        return res.status(400).json({ message: 'Missing card details' });
      }

      const num = cardDetails.number.replace(/\s/g, '');
      if (num.length !== 16) return res.status(400).json({ message: 'Invalid card number length' });
      
      
      if (!num.includes('*')) {
        const digits = num.split('').reverse().map(Number);
        const sum = digits.reduce((acc, d, i) => {
          if (i % 2 !== 0) { d *= 2; if (d > 9) d -= 9; }
          return acc + d;
        }, 0);
        
        if (sum % 10 !== 0) {
          return res.status(400).json({ message: 'Card number is invalid (Luhn Check failed on Server)' });
        }
      }

      // Check expiry
      if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
        return res.status(400).json({ message: 'Invalid expiry format' });
      }
      const [mm, yy] = cardDetails.expiry.split('/').map(Number);
      const now = new Date();
      const expDate = new Date(2000 + yy, mm - 1, 1);
      if (mm < 1 || mm > 12 || expDate < now) {
        return res.status(400).json({ message: 'Card has expired or invalid month' });
      }

      
      
    } else if (paymentMethod === 'paypal') {
      if (!paypalOrderId) {
        return res.status(400).json({ message: 'Missing PayPal Order ID' });
      }
      
    }

    
    const order = await Order.create({
      userId: req.user.id,
      items: finalItems,
      shippingAddress,
      shippingMethod: shippingMethod || 'standard',
      location,
      subtotal,
      shippingFee: shipping,
      taxAmount: tax,
      discountAmount,
      couponCode: appliedCoupon,
      totalAmount: calculatedTotal,
      paymentMethod: paymentMethod,
      paypalOrderId: paymentMethod === 'paypal' ? paypalOrderId : undefined,
      status: paymentMethod === 'card' || paymentMethod === 'paypal' ? 'paid' : 'pending',
    });

    
    await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [] });

    
    await Notification.create({
      userId: null,
      title: 'New Order Received',
      message: `Order #${order._id.toString().slice(-6).toUpperCase()} was placed for $${calculatedTotal.toFixed(2)}.`,
      type: 'success',
      link: '/admin/orders'
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.patch('/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    let updateFields = { status };
    if (status === 'cancelled') updateFields.cancelledBy = 'admin';

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).populate('userId', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    
    await Notification.create({
      userId: order.userId._id,
      title: 'Order Status Updated',
      message: `Your order #${order._id.toString().slice(-6).toUpperCase()} is now ${status}.`,
      type: 'info',
      link: '/profile' 
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/:id/return', verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    }

    order.returnStatus = 'requested';
    order.returnReason = reason || 'No reason provided';
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.patch('/:id/return-status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { returnStatus } = req.body;
    if (!['approved', 'rejected', 'none'].includes(returnStatus)) {
      return res.status(400).json({ message: 'Invalid return status' });
    }

    const order = await Order.findById(req.params.id).populate('userId', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.returnStatus = returnStatus;
    await order.save();

    
    await Notification.create({
      userId: order.userId._id,
      title: 'Return Request Updated',
      message: `Your return request for order #${order._id.toString().slice(-6).toUpperCase()} was ${returnStatus}.`,
      type: returnStatus === 'approved' ? 'success' : 'warning',
      link: '/orders'
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    
    const hoursSinceOrder = (new Date() - new Date(order.createdAt)) / (1000 * 60 * 60);
    if (hoursSinceOrder > 24) {
      return res.status(400).json({ message: 'Orders can only be cancelled within 24 hours' });
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ message: 'This order cannot be cancelled anymore' });
    }

    order.status = 'cancelled';
    order.cancelledBy = 'user';
    await order.save();

    res.json({ message: 'Order cancelled and refund requested successfully', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
