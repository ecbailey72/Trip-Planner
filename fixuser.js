require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const hash = await bcrypt.hash('Ventaro2026', 12);
  await User.updateOne(
    { email: '2erikbailey@gmail.com' },
    { email: 'erikbailey@gmail.com', password: hash }
  );
  console.log('User fixed');
  mongoose.disconnect();
});
