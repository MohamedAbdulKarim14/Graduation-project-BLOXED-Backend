const mongoose = require('mongoose');
const Category = require('./models/Category.model');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommere';

const categories = [
  {
    name: 'Laptops & Computers',
    description: 'High-performance laptops, desktops, and accessories for work and gaming.'
  },
  {
    name: 'Smartphones',
    description: 'Latest mobile devices, cases, and charging accessories.'
  },
  {
    name: 'Audio & Headphones',
    description: 'Premium headphones, earbuds, and speakers with immersive sound.'
  },
  {
    name: 'Gaming & Consoles',
    description: 'Next-gen gaming consoles, VR headsets, and pro controllers.'
  },
  {
    name: 'Smart Home',
    description: 'Smart speakers, lighting, security cameras, and home automation.'
  },
  {
    name: 'Wearables',
    description: 'Smartwatches, fitness trackers, and health monitoring devices.'
  }
];

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Clearing old categories...');
    await Category.deleteMany({});
    
    console.log('Inserting new electronics categories...');
    await Category.insertMany(categories);
    
    console.log('Categories seeded successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error seeding categories:', err);
    process.exit(1);
  });
