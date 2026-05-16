require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await User.updateOne({ _id: '6a07d375bb9f3dcb4d82d5d8' }, { email: '2erikbailey@gmail.com' });
  console.log('Email updated');
  mongoose.disconnect();
});
