const router  = require('express').Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User.model');
const Cart     = require('../models/Cart.model');
const Notification = require('../models/Notification.model');
const sendEmail = require('../utils/sendEmail');

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    const exists = await User.findOne({ email });
    if (exists) {
      if (exists.isVerified) {
        return res.status(400).json({ message: 'Email already registered' });
      } else {
        // User exists but not verified. Update info, regenerate OTP, and resend.
        const hashed = await bcrypt.hash(password, 10);
        exists.name = name;
        exists.password = hashed;
        
        const otp = generateOTP();
        exists.otp = otp;
        exists.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await exists.save();

        await sendEmail({
          email: exists.email,
          subject: 'BLOXED - Verify your email',
          otp: otp
        });

        return res.status(200).json({ 
          message: 'OTP resent to email',
          userId: exists._id 
        });
      }
    }

    const hashed  = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashed, role: 'user' });

    // Create empty cart for new user
    await Cart.create({ userId: newUser._id, items: [] });

    // Notify Admin
    await Notification.create({
      userId: null, // Admin
      title: 'New User Registered',
      message: `${newUser.name} (${newUser.email}) just joined the store.`,
      type: 'info',
      link: '/admin/users'
    });

    const otp = generateOTP();
    newUser.otp = otp;
    newUser.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await newUser.save();

    await sendEmail({
      email: newUser.email,
      subject: 'BLOXED - Verify your email',
      otp: otp
    });

    res.status(201).json({ 
      message: 'OTP sent to email',
      userId: newUser._id 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/auth/verify-otp ────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) return res.status(400).json({ message: 'User ID and OTP are required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified) return res.status(400).json({ message: 'User is already verified' });

    if (user.otp !== otp || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const accessToken = signToken(user);
    res.status(200).json({ accessToken, message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Incorrect email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Incorrect email or password' });

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first', userId: user._id });
    }

    const accessToken = signToken(user);
    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
