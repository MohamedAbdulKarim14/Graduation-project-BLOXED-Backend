const router  = require('express').Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User.model');
const Cart     = require('../models/Cart.model');
const Notification = require('../models/Notification.model');
const sendEmail = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );


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
        
        const hashed = await bcrypt.hash(password, 10);
        exists.name = name;
        exists.password = hashed;
        
        const otp = generateOTP();
        exists.otp = otp;
        exists.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); 
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

    
    await Cart.create({ userId: newUser._id, items: [] });

    
    await Notification.create({
      userId: null, 
      title: 'New User Registered',
      message: `${newUser.name} (${newUser.email}) just joined the store.`,
      type: 'info',
      link: '/admin/users'
    });

    const otp = generateOTP();
    newUser.otp = otp;
    newUser.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); 
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


router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body; 
    if (!credential) return res.status(400).json({ message: 'Google credential is required' });

    
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${credential}` }
    });
    const data = await googleResponse.json();
    const { email, name } = data;

    let user = await User.findOne({ email });

    if (!user) {
      
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const hashed = await bcrypt.hash(randomPassword, 10);
      
      user = await User.create({ 
        name, 
        email, 
        password: hashed, 
        role: 'user',
        isVerified: true 
      });

      
      await Cart.create({ userId: user._id, items: [] });

      
      await Notification.create({
        userId: null,
        title: 'New User Registered (Google)',
        message: `${user.name} (${user.email}) just joined the store via Google.`,
        type: 'info',
        link: '/admin/users'
      });
    } else {
      
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
    }

    const accessToken = signToken(user);
    res.status(200).json({ accessToken });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ message: 'Error authenticating with Google' });
  }
});

module.exports = router;
