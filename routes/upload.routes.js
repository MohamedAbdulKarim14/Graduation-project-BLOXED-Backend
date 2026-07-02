const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const verifyToken = require('../middleware/auth.middleware');
const isAdmin = require('../middleware/admin.middleware');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ecommere_products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  }
});

const upload = multer({ storage: storage });

router.post('/', verifyToken, isAdmin, (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      console.error('Multer/Cloudinary Error:', err);
      return res.status(500).json({ message: 'Upload failed', error: err.message || err.toString() });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    res.json({ imageUrl: req.file.path });
  });
});

module.exports = router;
