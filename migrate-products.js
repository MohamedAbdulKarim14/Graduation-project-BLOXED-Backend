require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product.model');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tripstore');
    console.log('Connected to DB');

    const products = await Product.find({});
    for (let p of products) {
      if (!p.images || p.images.length === 0) {
        
        const base = p.imageUrl || `https://placehold.co/800x600/1e1e1e/aaa?text=${encodeURIComponent(p.name)}`;
        p.images = [
          base,
          `https://placehold.co/800x600/222222/bbb?text=${encodeURIComponent(p.name + ' View 2')}`,
          `https://placehold.co/800x600/333333/ccc?text=${encodeURIComponent(p.name + ' View 3')}`
        ];
      }
      if (!p.specifications || p.specifications.length === 0) {
        p.specifications = [
          { key: 'Brand', value: 'BLOXED Certified' },
          { key: 'Model', value: p.name },
          { key: 'Condition', value: 'Brand New' },
          { key: 'Warranty', value: '1 Year Local Warranty' },
          { key: 'Color', value: 'Black / Silver' },
          { key: 'Weight', value: '1.2 kg' },
          { key: 'Dimensions', value: '25 x 15 x 5 cm' }
        ];
      }
      await p.save();
    }

    console.log('Migration completed for', products.length, 'products');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
