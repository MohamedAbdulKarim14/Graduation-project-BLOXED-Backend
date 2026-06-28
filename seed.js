const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User.model');
const Category = require('./models/Category.model');
const Product  = require('./models/Product.model');

require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommere';

// ── Users ──────────────────────────────────────────────────────────────────
const usersData = [
  {
    name:     'Admin User',
    email:    'admin@bloxed.tech',
    password: 'admin123',
    role:     'admin',
  },
  {
    name:     'Ahmed Mohamed',
    email:    'user@bloxed.tech',
    password: 'user1234',
    role:     'user',
  },
];

// ── Categories ─────────────────────────────────────────────────────────────
const categoriesData = [
  { name: 'Laptops & PCs', description: 'High-performance laptops, desktops and accessories', imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80' },
  { name: 'Smartphones', description: 'Latest flagship and mid-range mobile devices', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80' },
  { name: 'Audio & Headphones', description: 'Premium sound — from earbuds to studio speakers', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' },
  { name: 'Gaming', description: 'Consoles, gaming laptops, controllers and accessories', imageUrl: 'https://images.unsplash.com/photo-1600069226367-46e38aadfd89?w=800&q=80' },
  { name: 'Smart Home', description: 'Smart speakers, lighting, cameras and home automation', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
  { name: 'Wearables', description: 'Smartwatches, fitness trackers and health devices', imageUrl: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800&q=80' },
  { name: 'Cameras & Drones', description: 'Professional cameras and high-tech drones', imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80' },
  { name: 'Monitors & Displays', description: 'Ultra-wide and high-refresh-rate monitors', imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80' },
  { name: 'Networking & Routers', description: 'Fast Wi-Fi routers and networking gear', imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80' },
  { name: 'Storage & Drives', description: 'Fast SSDs and reliable hard drives', imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80' }
];

// ── Run ────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  /* Users */
  await User.deleteMany({});
  const hashed = await Promise.all(
    usersData.map(async u => ({
      ...u,
      password: await bcrypt.hash(u.password, 10),
    }))
  );
  await User.insertMany(hashed);
  console.log('✅ Users seeded');

  /* Categories */
  await Category.deleteMany({});
  const cats = await Category.insertMany(categoriesData);
  console.log(`✅ ${cats.length} categories seeded`);

  /* Dynamic Products Generation (10 per category = 100 products) */
  await Product.deleteMany({});
  const prods = [];
  
  cats.forEach((cat, index) => {
    for (let i = 1; i <= 10; i++) {
      prods.push({
        name: `Pro ${cat.name} Model X${i}`,
        description: `High-quality ${cat.name.toLowerCase()} featuring advanced technology and premium materials. Ideal for all your needs.`,
        price: Math.floor(Math.random() * 900) + 99, // Random price $99 - $999
        stock: Math.floor(Math.random() * 50) + 5,   // Random stock 5 - 55
        imageUrl: cat.imageUrl, // Fallback to category image
        categoryIds: [cat._id]
      });
    }
  });

  await Product.insertMany(prods);
  console.log(`✅ ${prods.length} products seeded`);

  console.log('\n────────────────────────────────────');
  console.log('🔑  ADMIN  → admin@bloxed.tech  /  admin123');
  console.log('👤  USER   → user@bloxed.tech   /  user1234');
  console.log('────────────────────────────────────\n');

  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
