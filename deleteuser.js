require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await User.deleteOne({ email: 'erikbailey@gmail.com' });
  console.log('User deleted');
  mongoose.disconnect();
});
