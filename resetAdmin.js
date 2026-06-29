const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/ecommere')
  .then(async () => {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: 'admin@bloxed.tech' },
      { $set: { password: hash } }
    );
    console.log('Password reset result:', result);
  })
  .catch(console.error)
  .finally(() => process.exit());
