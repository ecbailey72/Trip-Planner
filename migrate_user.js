require('dotenv').config();
const mongoose = require('mongoose');
const Trip = require('./src/models/Trip');

const MY_USER_ID = '6a07cd71bb9f3dcb4d82d5d7';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const result = await Trip.updateMany(
    { userId: { $exists: false } },
    { $set: { userId: MY_USER_ID } }
  );
  console.log('Trips updated:', result.modifiedCount);
  mongoose.disconnect();
});
