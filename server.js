const express = require('express');
const mongoose = require('mongoose');
const cors    = require('cors');
const dotenv  = require('dotenv');
const path    = require('path');

dotenv.config();

const app = express();


app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));  


app.use('/api/auth',       require('./routes/auth.routes'));
app.use('/api/products',   require('./routes/products.routes'));
app.use('/api/categories', require('./routes/Categories.routes'));
app.use('/api/Categories', require('./routes/Categories.routes'));  
app.use('/api/carts',      require('./routes/cart.routes'));
app.use('/api/orders',     require('./routes/orders.routes'));
app.use('/api/reviews',    require('./routes/reviews.routes'));
app.use('/api/chat',       require('./routes/chat.routes'));
app.use('/api/users',      require('./routes/users.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));
app.use('/api/settings',      require('./routes/settings.routes'));
app.use('/api/coupons',       require('./routes/coupons.routes'));
app.use('/api/wishlists',     require('./routes/wishlist.routes'));
app.use('/api/upload',        require('./routes/upload.routes'));


app.get('/', (req, res) => res.json({ message: 'Categoriestore API is running' }));


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('[INFO] MongoDB connected -> Categoriestore');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`[INFO] Server running on http://localhost:${PORT}`);
      console.log('─────────────────────────────────────────');
      console.log('  Auth   : POST /api/auth/register');
      console.log('           POST /api/auth/login');
      console.log('  Data   : /api/products  /api/Categories');
      console.log('           /api/carts     /api/orders');
      console.log('           /api/users');
      console.log('─────────────────────────────────────────');
    });
  })
  .catch((err) => {
    console.error('[ERROR] MongoDB connection error:', err.message);
    process.exit(1);
  });
