const mongoose = require('mongoose');

const productsData = [
  { catName: 'Laptops & PCs', name: 'MacBook Pro 16" M3 Max', description: 'The ultimate pro laptop with the most advanced Apple silicon.', price: 3499.00, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80' },
  { catName: 'Laptops & PCs', name: 'Dell XPS 15 OLED', description: 'Stunning 3.5K OLED display and 13th Gen Intel Core processors.', price: 1899.99, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80' },
  { catName: 'Smartphones', name: 'iPhone 15 Pro Max', description: 'Titanium design, A17 Pro chip, and a more advanced 48MP Main camera.', price: 1199.00, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80' },
  { catName: 'Smartphones', name: 'Samsung Galaxy S24 Ultra', description: 'Galaxy AI is here. Welcome to the era of mobile AI.', price: 1299.99, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80' },
  { catName: 'Audio & Headphones', name: 'Sony WH-1000XM5', description: 'Industry leading noise canceling headphones.', price: 398.00, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80' },
  { catName: 'Audio & Headphones', name: 'AirPods Pro (2nd Gen)', description: 'Rich audio quality, up to 2x more Active Noise Cancellation.', price: 249.00, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80' },
  { catName: 'Gaming', name: 'PlayStation 5 Console', description: 'Experience lightning-fast loading with an ultra-high speed SSD.', price: 499.99, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80' },
  { catName: 'Gaming', name: 'Xbox Series X', description: 'The fastest, most powerful Xbox ever.', price: 499.99, stock: 22, imageUrl: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&q=80' },
  { catName: 'Smart Home', name: 'Amazon Echo Dot (5th Gen)', description: 'Our best-sounding Echo Dot yet.', price: 49.99, stock: 200, imageUrl: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&q=80' },
  { catName: 'Smart Home', name: 'Google Nest Hub Max', description: 'Smart display with Google Assistant.', price: 229.00, stock: 35, imageUrl: 'https://images.unsplash.com/photo-1565313936683-1122a27521e1?w=800&q=80' },
  { catName: 'Wearables', name: 'Apple Watch Ultra 2', description: 'The most rugged and capable Apple Watch pushes the limits again.', price: 799.00, stock: 18, imageUrl: 'https://images.unsplash.com/photo-1696446702111-e4905d4b4a37?w=800&q=80' },
  { catName: 'Wearables', name: 'Garmin Fenix 7 Pro', description: 'Multisport GPS smartwatch with solar charging.', price: 799.99, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80' },
  { catName: 'Cameras & Drones', name: 'DJI Mini 4 Pro', description: 'Under 249g, 4K/60fps HDR True Vertical Shooting.', price: 959.00, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&q=80' },
  { catName: 'Cameras & Drones', name: 'Sony A7 IV Mirrorless Camera', description: '33MP full-frame Exmor R back-illuminated CMOS sensor.', price: 2498.00, stock: 8, imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80' },
  { catName: 'Monitors & Displays', name: 'LG 27" UltraGear OLED', description: '240Hz, 0.03ms response time gaming monitor.', price: 999.99, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80' },
  { catName: 'Monitors & Displays', name: 'Samsung 49" Odyssey G9', description: 'Curved gaming monitor, 240Hz, 1ms.', price: 1399.99, stock: 5, imageUrl: 'https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=800&q=80' },
  { catName: 'Networking & Routers', name: 'ASUS ROG Rapture Wi-Fi 6E', description: 'Quad-band WiFi 6E gaming router.', price: 599.99, stock: 10, imageUrl: 'https://images.unsplash.com/photo-1551703599-6b3e8379aa8c?w=800&q=80' },
  { catName: 'Storage & Drives', name: 'Samsung 990 PRO 2TB', description: 'PCIe 4.0 NVMe M.2 SSD.', price: 169.99, stock: 60, imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&q=80' },
  { catName: 'Storage & Drives', name: 'SanDisk 2TB Extreme Portable SSD', description: 'Up to 1050MB/s read and 1000MB/s write speeds.', price: 149.99, stock: 45, imageUrl: 'https://images.unsplash.com/photo-1620054708785-5b48db92c3a5?w=800&q=80' },
  { catName: 'Tablets & iPads', name: 'iPad Pro 12.9" M2', description: 'Mind-blowing performance with M2 chip and advanced displays.', price: 1099.00, stock: 22, imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80' },
  { catName: 'Tablets & iPads', name: 'Samsung Galaxy Tab S9 Ultra', description: '14.6" Dynamic AMOLED 2X display, IP68 water resistance.', price: 1199.99, stock: 14, imageUrl: 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=800&q=80' },
  { catName: 'TVs & Home Theater', name: 'LG 65" OLED evo C3 Series', description: 'Smart TV with Magic Remote.', price: 1596.99, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80' },
  { catName: 'Keyboards & Mice', name: 'Logitech MX Master 3S', description: 'Wireless performance mouse with 8K DPI any-surface tracking.', price: 99.99, stock: 75, imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac1eeb5304ba?w=800&q=80' },
  { catName: 'Keyboards & Mice', name: 'Keychron Q1 Pro', description: 'Wireless custom mechanical keyboard.', price: 199.00, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80' },
  { catName: 'Chargers & Power Banks', name: 'Anker Prime 27,650mAh Power Bank', description: '250W multi-device fast charging.', price: 179.99, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1609692814857-d01d82600d56?w=800&q=80' },
  { catName: 'Printers & Scanners', name: 'Epson EcoTank ET-4850', description: 'Wireless color all-in-one cartridge-free supertank printer.', price: 399.99, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800&q=80' },
  { catName: 'PC Components', name: 'NVIDIA GeForce RTX 4090', description: 'The ultimate GeForce GPU. Beyond fast.', price: 1599.00, stock: 3, imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80' },
  { catName: 'PC Components', name: 'Intel Core i9-14900K', description: '24 cores (8 P-cores + 16 E-cores) and 32 threads.', price: 589.99, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80' },
  { catName: 'VR & AR Devices', name: 'Meta Quest 3', description: 'Mixed reality headset with breakthrough high-resolution.', price: 499.99, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&q=80' },
  { catName: 'VR & AR Devices', name: 'Apple Vision Pro', description: 'Spatial computer that blends digital content with your physical space.', price: 3499.00, stock: 5, imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80' },
  { catName: 'Electric Scooters & Mobility', name: 'Segway Ninebot Max G2', description: 'Electric kick scooter with dual suspension.', price: 899.99, stock: 10, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' }
];

mongoose.connect('mongodb://127.0.0.1:27017/ecommere').then(async () => {
  const categories = await mongoose.connection.db.collection('categories').find().toArray();
  const catMap = {};
  categories.forEach(c => catMap[c.name] = c._id);
  
  let added = 0;
  for (const p of productsData) {
    if (catMap[p.catName]) {
      const prod = {
        name: p.name,
        name_ar: '',
        description: p.description,
        description_ar: '',
        price: p.price,
        stock: p.stock,
        imageUrl: p.imageUrl,
        categoryIds: [catMap[p.catName]],
        variants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
      };
      await mongoose.connection.db.collection('products').insertOne(prod);
      added++;
    }
  }
  console.log('Successfully inserted', added, 'products!');
  process.exit();
}).catch(e => { console.error(e); process.exit(1); });
