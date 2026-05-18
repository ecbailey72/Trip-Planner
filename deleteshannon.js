require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const result = await User.deleteOne({ email: 'shannonbaileyms' });
  console.log('Deleted:', result.deletedCount);
  mongoose.disconnect();
});
