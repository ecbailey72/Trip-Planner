require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Trip = require('./src/models/Trip');

const NEW_USER_ID = '6a07d375bb9f3dcb4d82d5d8';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  // Fix email typo
  await User.updateOne({ _id: NEW_USER_ID }, { email: 'erikbailey@gmail.com' });
  // Re-link trips
  const result = await Trip.updateMany({}, { $set: { userId: NEW_USER_ID } });
  console.log('Email fixed, trips linked:', result.modifiedCount);
  mongoose.disconnect();
});
